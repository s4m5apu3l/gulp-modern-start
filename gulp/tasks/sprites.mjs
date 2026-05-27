/**
 * SVG спрайт
 *
 * Создает svg спрайт
 *
 * Пример использования в css:
 * background: url('sprite-mono.svg#icon-name-view') no-repeat;
 * background-size: 20px;
 *
 * Пример использования в html:
 * <svg width="50" height="50" aria-hidden="true"><use href="#icon-name"></use></svg>
 *
 * @link https://github.com/svg/svgo
 */

// Сторонние библиотеки
import { src, dest, watch, series, parallel } from 'gulp' // gulp плагин
import svgSprite from 'gulp-svg-symbol-view' // создает спрайт
import replace from 'gulp-replace' // замена в файлах

// Конфиги
import config from '../config.mjs'
import fs from 'fs'
import path from 'path'
import { invalidateFilesAndRebuild } from './pug.mjs'

const onSpriteChanged = () => invalidateFilesAndRebuild()

// Создание черно-белого svg спрайта (currentColor)
const spriteMono = () =>
  // входящие файлы
  src(`${config.src.assets.icons.mono}/**/icon-*.svg`, { allowEmpty: true })
    .pipe(
      svgSprite({
        name: 'sprite-mono',
        svgo: {
          plugins: [
            { cleanupIDs: true }, // удалить id
            { removeRasterImages: true }, // удалить растровые изображения
            { removeStyleElement: true }, // удалить <style>
            { removeUselessDefs: true }, // удалить <defs>
            { removeViewBox: false }, // сохранить ViewBox
            { removeComments: true }, // удалить комментарии
            {
              removeAttrs: {
                attrs: ['class', 'data-name'], // удалить указанные атрибуты
              },
            },
          ],
        },
      }),
    )
    // Удаляем inline fill (кроме none), но НЕ трогаем stroke — outline-иконки рисуются через stroke
    .pipe(replace(/\s+fill="(?!none")[^"]*"/g, ''))
    // Добавляем fill="currentColor" только если на symbol его ещё нет
    .pipe(replace(/<symbol\b(?![^>]*fill=)([^>]*)>/g, '<symbol$1 fill="currentColor">'))
    .pipe(dest(config.src.assets.icons.root)) // исходящий файл

// Создание цветного svg спрайта
const spriteMulti = () =>
  // входящие файлы
  src(`${config.src.assets.icons.multi}/**/icon-*.svg`, { allowEmpty: true })
    .pipe(
      svgSprite({
        name: 'sprite-multi',
        svgo: {
          plugins: [
            { cleanupIDs: true }, // удалить id
            { removeUselessDefs: true }, // удалить <defs>
            { removeViewBox: false }, // удалить ViewBox
            { removeComments: true }, // удалить комментарии
            { removeUselessStrokeAndFill: false }, // удалить атрибуты stroke и fill
            { inlineStyles: true }, // поддержка встроенных стилей <style></style>
            {
              removeAttrs: {
                attrs: ['class', 'data-name'], // удалить указанные атрибуты
              },
            },
          ],
        },
      }),
    )
    .pipe(dest(config.src.assets.icons.root)) // исходящий файл

// Так как спрайты будут подключаться в pug разметку, то важно чтобы на момент компиляции
// файл со спрайтом существовал физически иначе pug выкинет ошибку и не соберется в html.
// Поэтому если у нас нет ни каких svg иконок для создания спрайта мы просто создаем пустой файл.
const clearSprite = file => {
  const filePath = `${config.src.assets.icons.root}/${file}.svg`

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, '') // всегда сбрасываем файл перед пересборкой
}

// Очистка спрайтов
const removeSprites = done => {
  clearSprite('sprite-mono')
  clearSprite('sprite-multi')

  done()
}

const removeMonoSprite = done => {
  clearSprite('sprite-mono')
  done()
}

const removeMultiSprite = done => {
  clearSprite('sprite-multi')
  done()
}

// Копирование отдельных спрайтов
const copyMonoSprite = () => src(`${config.src.assets.icons.root}/sprite-mono.svg`).pipe(dest(config.build.images))
const copyMultiSprite = () => src(`${config.src.assets.icons.root}/sprite-multi.svg`).pipe(dest(config.build.images))

// Создание спрайтов
const createSprites = parallel(spriteMono, spriteMulti)

// Сборка всех тасков
export const spritesBuild = series(removeSprites, parallel(spriteMono, spriteMulti), parallel(copyMonoSprite, copyMultiSprite))

// Слежение за изменением файлов
export const spritesWatch = () => {
  watch(
    `${config.src.assets.icons.mono}/**/*.svg`,
    series(removeMonoSprite, spriteMono, copyMonoSprite, onSpriteChanged),
  )
  watch(
    `${config.src.assets.icons.multi}/**/*.svg`,
    series(removeMultiSprite, spriteMulti, copyMultiSprite, onSpriteChanged),
  )
}
