/**
 * Шаблонизатор pug — ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
 *
 * ─── ЧТО БЫЛО МЕДЛЕННО ───────────────────────────────────────────────────────
 *
 *  1. CACHE_TTL = 1000ms при SCSS-компиляции ~500ms:
 *     Кэш протухал каждые 1-2 файла → SCSS пересобирался ~25 раз за билд.
 *     25 × 500ms = 12.5 секунд только на critical CSS.
 *
 *  2. gulp-pug transform stream: sequential bottleneck.
 *     Каждый файл проходит через plumber → cached → pug → dest по очереди.
 *     Оверхед pipe + vinyl + stream transforms на каждый из 50 файлов.
 *
 *  3. gulp-cached в build-таске: бесполезен при cold start (кэш пуст),
 *     но добавляет хэш-вычисление для каждого файла.
 *
 *  4. Баг: css.replaceAll() не мутирует строку (String immutable) →
 *     &quot; так и оставался в critical CSS.
 *
 * ─── ЧТО ТЕПЕРЬ ──────────────────────────────────────────────────────────────
 *
 *  1. SESSION CACHE: кэш привязан к номеру сессии, а не ко времени.
 *     SCSS компилируется ровно 1 раз за билд, независимо от его длины.
 *     JSON читается 1 раз за билд. Options строятся 1 раз за билд.
 *
 *  2. Прямой вызов pug.compileFile() вместо gulp-pug stream:
 *     - Нет overhead от vinyl/stream transforms
 *     - Скомпилированные pug-функции кэшируются по mtime файла
 *     - В watch-режиме: файл без изменений рендерится за ~1ms (без парсинга)
 *
 *  3. Параллельная async запись результатов через Promise.all
 *
 *  4. Новый инстанс pugIncludeGlob() на каждый файл — плагин имеет состояние,
 *     shared instance приводил бы к гонкам при параллельной обработке.
 *
 *  5. Исправлен баг с replaceAll (результат теперь присваивается).
 */

// ─── IMPORTS ──────────────────────────────────────────────────────────────────

import { series, src, dest, watch } from 'gulp'
import gulpif from 'gulp-if'
import replace from 'gulp-replace'
import notify from 'gulp-notify'

// pug напрямую (не gulp-pug — он нам больше не нужен)
import pug from 'pug'
import pugIncludeGlob from 'pug-include-glob'

// Node built-ins
import fs from 'fs'
import path from 'path'

// Critical CSS
import jstransformer from 'jstransformer'
import scss from 'jstransformer-scss'
import cleanCss from 'jstransformer-clean-css'

// Конфиг
import config from '../config.mjs'

// ─── CRITICAL CSS TRANSFORMERS ────────────────────────────────────────────────

const jstscss = jstransformer(scss)
const jstminify = jstransformer(cleanCss)

// ─── SESSION CACHE ────────────────────────────────────────────────────────────
//
// Механизм: каждый запуск changePages/changeIncludes инкрементирует sessionId.
// Данные кэшируются вместе со своим sessionId. При проверке сравниваем ID.
// Кэш не протухает по таймеру — он валиден ровно на одну сессию билда.
//
// Это устраняет главную причину тормозов: CACHE_TTL=1000ms был короче, чем
// время компиляции SCSS (~500ms), поэтому кэш протухал каждые 1-2 файла.

let sessionId = 0

let _data = null
let _dataId = -1
let _critCSS = null
let _critCSSId = -1
let _opts = null
let _optsId = -1
// ─── COMPILED FUNCTION CACHE ─────────────────────────────────────────────────
//
// pug.compileFile() разбирает .pug в функцию. Это дорого (парсинг + компиляция).
// Кэшируем результат по mtime файла. Если файл не изменился — вызываем только
// рендер (fn(locals)), что занимает ~1-3ms вместо ~50-100ms.
//
// В watch: изменилась страница → только она перекомпилируется (остальные из кэша).
// В watch: изменился include/JSON → compiledFnCache.clear() → всё пересобирается.

const compiledFnCache = new Map() // Map<filePath, { fn: CompiledFn, mtime: number }>

// ─── FILE DISCOVERY ───────────────────────────────────────────────────────────

const findPugFiles = dir => {
    const result = []
    const walk = d => {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
            const full = path.join(d, entry.name)
            if (entry.isDirectory()) walk(full)
            else if (entry.name.endsWith('.pug')) result.push(full)
        }
    }
    walk(dir)
    return result
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const getData = () => {
    if (_data && _dataId === sessionId) return _data

    const data = {}
    const walk = d => {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
            const full = path.join(d, entry.name)
            if (entry.isDirectory()) walk(full)
            else if (entry.name.endsWith('.json'))
                data[entry.name.slice(0, -5)] = JSON.parse(fs.readFileSync(full, 'utf8'))
        }
    }
    walk(config.src.markup.data)

    _data = data
    _dataId = sessionId
    return _data
}

// ─── CRITICAL CSS ─────────────────────────────────────────────────────────────

const getCriticalCSS = cssPath => {
    // ОПТИМИЗАЦИЯ: В dev-режиме critical CSS подключается отдельным файлом через criticalBuild()
    // Инлайнинг не нужен — возвращаем пустую строку для ускорения компиляции
    if (config.isDev) {
        return ''
    }

    if (_critCSS && _critCSSId === sessionId) return _critCSS

    console.log('  → Compiling critical CSS...')

    const css = jstscss.render(cssPath).body
    // БАГ В ОРИГИНАЛЕ: css.replaceAll() не мутирует строку — результат терялся.
    // String в JS иммутабелен, нужно присваивать результат.
    const fixedCss = css.replaceAll('&quot;', '"')
    const result = jstminify.render(fixedCss, {
        level: { 1: { specialComments: 0 } },
    }).body

    _critCSS = result
    _critCSSId = sessionId
    return _critCSS
}

// ─── OPTIONS ──────────────────────────────────────────────────────────────────

const getOptions = () => {
    if (_opts && _optsId === sessionId) return _opts

    _opts = {
        doctype: 'html',
        pretty: config.isProd, // true = форматированный HTML (медленнее, но читаемо в prod)
        locals: { jsonData: getData() },
        filters: {
            // :critical-css вызывается при pug.compileFile() — не при рендере.
            // Результат встраивается в скомпилированную функцию и кэшируется вместе с ней.
            'critical-css': (_text, { path: cssPath }) => getCriticalCSS(cssPath),
            'special-chars': text => text.replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
        },
    }
    _optsId = sessionId
    return _opts
}

// ─── COMPILE ONE FILE ─────────────────────────────────────────────────────────

const compilePugFile = (filePath, options) => {
    const mtime = fs.statSync(filePath).mtimeMs
    let entry = compiledFnCache.get(filePath)

    if (!entry || entry.mtime !== mtime) {
        // Парсинг + компиляция (~50-100ms на файл).
        // Новый инстанс pugIncludeGlob() на каждый файл — плагин имеет внутреннее состояние.
        const compiledFn = pug.compileFile(filePath, {
            doctype: options.doctype,
            pretty: options.pretty,
            plugins: [pugIncludeGlob()],
            filters: options.filters,
        })
        entry = { fn: compiledFn, mtime }
        compiledFnCache.set(filePath, entry)
    }
    // cache hit → пропускаем парсинг, только рендер (~1-3ms)

    // Рендер с актуальными locals (данные инжектируются в рантайме)
    return entry.fn(options.locals)
}

// ─── COMPILE ALL PAGES ────────────────────────────────────────────────────────

const compileAllPages = async options => {
    const pagesDir = config.src.markup.pages
    const buildDir = config.build.root
    const files = findPugFiles(pagesDir)

    if (!files.length) {
        console.warn('⚠ Pug: не найдено ни одного файла в', pagesDir)
        return
    }

    console.log(`  → ${files.length} страниц`)

    // ── Синхронная компиляция всех файлов ──────────────────────────────────
    // pug.compileFile() — синхронная CPU-операция. Параллелизм возможен только
    // через worker_threads, что усложнило бы код и сломало замыкания фильтров.
    // Главный выигрыш: нет gulp-stream overhead + session cache + fn cache.

    const compiled = []
    const errors = []

    for (const file of files) {
        try {
            const html = compilePugFile(file, options)
            const rel = path.relative(pagesDir, file).replace(/\.pug$/, '.html')
            const outPath = path.join(buildDir, rel)
            compiled.push({ outPath, html })
        } catch (err) {
            errors.push({ file, err })
            console.error(`  ✗ ${path.relative(pagesDir, file)}: ${err.message}`)
        }
    }

    // ── Параллельная async запись HTML-файлов ──────────────────────────────
    // Запись — I/O-операция, реально параллелится через Promise.all.
    await Promise.all(
        compiled.map(async ({ outPath, html }) => {
            await fs.promises.mkdir(path.dirname(outPath), { recursive: true })
            await fs.promises.writeFile(outPath, html, 'utf8')
        }),
    )

    // Уведомляем об ошибках (не бросаем исключение — не ломаем watch-режим)
    if (errors.length) {
        errors.forEach(({ file, err }) => {
            notify.onError({
                title: 'Pug: ошибка компиляции',
                message: `${path.basename(file)}: ${err.message}`,
                sound: false,
            })()
        })
    }
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

/**
 * Изменилась страница: инкрементируем сессию (инвалидируем JSON/CSS кэши),
 * но НЕ чистим compiledFnCache — неизменённые страницы отрендерятся из кэша.
 */
const changePages = async () => {
    const t = Date.now()
    sessionId++ // Новая сессия: данные и critical CSS будут перечитаны 1 раз

    try {
        const options = getOptions()
        await compileAllPages(options)
        console.log(`✓ Pug pages compiled in ${((Date.now() - t) / 1000).toFixed(2)}s`)
        global.browserSync.reload()
    } catch (err) {
        console.error('✗ Pug build failed:', err.message)
    }
}

/**
 * ОПТИМИЗАЦИЯ: Изменились только данные (JSON/спрайты) — НЕ сбрасываем compiledFnCache.
 * Скомпилированные pug-функции не зависят от данных, только от структуры шаблонов.
 * Данные инжектируются в рантайме через options.locals.
 */
const changeData = async () => {
    const t = Date.now()
    sessionId++ // Инвалидируем кэш данных, но НЕ compiledFnCache

    try {
        const options = getOptions()
        await compileAllPages(options)
        console.log(`✓ Pug data updated in ${((Date.now() - t) / 1000).toFixed(2)}s`)
        global.browserSync.reload()
    } catch (err) {
        console.error('✗ Pug build failed:', err.message)
    }
}

/**
 * Изменился include/layout/mixin:
 * Сбрасываем compiledFnCache полностью — нельзя знать, какие страницы затронуты.
 */
const changeIncludes = async () => {
    const t = Date.now()
    sessionId++
    compiledFnCache.clear() // Все страницы перекомпилируются заново

    try {
        const options = getOptions()
        await compileAllPages(options)
        console.log(`✓ Pug includes recompiled in ${((Date.now() - t) / 1000).toFixed(2)}s`)
        global.browserSync.reload()
    } catch (err) {
        console.error('✗ Pug build failed:', err.message)
    }
}

// ─── ENV / VERSION ────────────────────────────────────────────────────────────

const envSet = () => {
    const pattern = /(- (var|let|const) env = ")(prod|dev)(";?)/g

    return src(`${config.src.markup.root}/_config.pug`)
        .pipe(gulpif(config.isDev, replace(pattern, '$1dev$4')))
        .pipe(gulpif(config.isProd, replace(pattern, '$1prod$4')))
        .pipe(dest(file => file.base))
}

const versionSet = () => {
    const pattern = /(- (var|let|const) version = ")(.*)(";?)/g

    return src(`${config.src.markup.root}/_config.pug`)
        .pipe(replace(pattern, `$1${config.version}$4`))
        .pipe(dest(file => file.base))
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export const pugBuild = series(envSet, versionSet, changePages)

/**
 * Инвалидирует весь fn cache и пересобирает все страницы.
 * Используется при изменении спрайтов — layout инлайнит спрайты через include,
 * поэтому все скомпилированные функции страниц устарели.
 */
export const invalidateFilesAndRebuild = async () => {
    await changeIncludes()
}

export const pugWatch = () => {
    // Изменилась страница — пересобираем только её (fn cache для остальных сохраняется)
    watch([`${config.src.markup.pages}/**/*.pug`], changePages)

    // ОПТИМИЗАЦИЯ: Разделяем watchers по типу изменений для умной инвалидации кэша

    // Изменились includes/layouts/mixins — полная перекомпиляция (fn cache сброшен)
    watch([`${config.src.markup.root}/**/*.pug`, `!${config.src.markup.pages}/**/*.pug`], changeIncludes)

    // Изменились JSON данные — только рендер с новыми данными (fn cache сохранен)
    watch([`${config.src.markup.data}/**/*.json`], changeData)
}
