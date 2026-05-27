/**
 * Scss препроцессор
 * ОПТИМИЗАЦИИ:
 * - Чистый массив PostCSS (убраны () => {})
 * - Точный watcher для critical (ловит base/ и blocks/)
 * - Исправлен импорт browserSync
 */

import { src, dest, watch } from 'gulp'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import postcss from 'gulp-postcss'
import autoPrefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssCustomMedia from 'postcss-custom-media'
import postcssMediaMinMax from '@csstools/postcss-media-minmax'
import sortMediaQueries from 'postcss-sort-media-queries'
import comments from 'postcss-discard-comments'
import cssImport from 'postcss-import'
import config from '../config.mjs'

const sass = gulpSass(dartSass)

// ✅ Единая функция плагинов (убирает () => {} которые ломают postcss в dev)
const getPostcssPlugins = () => [
    cssImport(),
    postcssCustomMedia(),
    postcssMediaMinMax(),
    autoPrefixer(),
    ...(config.isProd ? [sortMediaQueries({ sort: 'desktop-first' }), cssnano(), comments({ removeAll: true })] : []),
]

export const stylesBuild = () => {
    const startTime = Date.now()
    return src([`${config.src.style}/main.scss`], { sourcemaps: config.isDev })
        .pipe(
            plumber({
                errorHandler: notify.onError(err => {
                    console.error('\n❌ ОШИБКА SASS:', err.message)
                    console.error('Файл:', err.relativePath || err.file)
                    console.error('Строка:', err.line, 'Колонка:', err.column)
                    return { title: 'Ошибка stylesBuild', sound: false, message: err.message }
                }),
            }),
        )
        .pipe(sass.sync({ loadPaths: ['./node_modules'] }))
        .pipe(postcss(getPostcssPlugins()))
        .pipe(dest(config.build.style, { sourcemaps: config.isDev ? '.' : false }))
    .on('end', () => console.log(`✓ Styles compiled in ${((Date.now() - startTime) / 1000).toFixed(2)}s`))
    .pipe(global.browserSync.stream())
}

export const criticalBuild = () => {
    if (config.isProd) return Promise.resolve()

    return src([`${config.src.style}/critical.scss`], { sourcemaps: config.isDev })
        .pipe(
            plumber({
                errorHandler: notify.onError(err => {
                    console.error('\n❌ ОШИБКА CRITICAL CSS:', err.message)
                    console.error('Файл:', err.relativePath || err.file)
                    console.error('Строка:', err.line, 'Колонка:', err.column)
                    return { title: 'Ошибка criticalBuild', sound: false, message: err.message }
                }),
            }),
        )
        .pipe(sass.sync({ loadPaths: ['./node_modules'] }))
        .pipe(postcss(getPostcssPlugins()))
    .pipe(dest(config.build.style, { sourcemaps: config.isDev ? '.' : false }))
    .pipe(global.browserSync.stream())
}

// ✅ ИСПРАВЛЕННЫЙ ВОТЧЕР
export const stylesWatch = () => {
    watch(`${config.src.style}/**/*.{scss,sass}`, stylesBuild)

    watch(
        [
            `${config.src.style}/critical.scss`,
            `${config.src.style}/base/**/*.scss`,
            `${config.src.style}/blocks/ui/*.scss`,
            `${config.src.style}/**/*-critical.scss`,
        ],
        criticalBuild,
    )
}
