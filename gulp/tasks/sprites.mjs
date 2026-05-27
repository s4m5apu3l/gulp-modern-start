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
import filesExist from 'files-exist' // проверяет файл на существование
import svgSprite from 'gulp-svg-symbol-view' // создает спрайт

// Конфиги
import config from '../config.mjs'
import fs from 'fs'
import path from 'path'
import { invalidateFilesAndRebuild } from './pug.mjs'

const onSpriteChanged = () => invalidateFilesAndRebuild()

// Создание черно-белого svg спрайта
const spriteMono = () =>
  // входящие файлы
  src(
    filesExist(`${config.src.assets.icons.mono}/**/icon-*.svg`, {
      exceptionMessage: 'Нет ни одного файла svg',
    }),
  )
    .pipe(
      svgSprite({
        name: 'sprite-mono',
        svgo: {
          plugins: [
            { cleanupIDs: true }, // удалить id
            { removeRasterImages: true }, // удалить растровые изображения
            { removeStyleElement: true }, // удалить <style>
            { removeUselessDefs: true }, // удалить <defs>
            { removeViewBox: false }, // удалить ViewBox
            { removeComments: true }, // удалить комментарии
            {
              removeAttrs: {
                // attrs: ['class', 'data-name', 'fill', 'stroke.*'], // удалить указанные атрибуты
                attrs: ['class', 'data-name'], // удалить указанные атрибуты
              },
            },
          ],
        },
      }),
    )
    .pipe(dest(config.src.assets.icons.root)) // исходящий файл

// Создание цветного svg спрайта
const spriteMulti = () =>
  // входящие файлы
  src(
    filesExist(`${config.src.assets.icons.multi}/**/icon-*.svg`, {
      exceptionMessage: 'Нет ни одного файла svg',
    }),
  )
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

// Создание спрайтов
const createSprites = parallel(spriteMono, spriteMulti)

// Копирование спрайтов в build
const copySprites = () => src([`${config.src.assets.icons.root}/sprite-*.svg`]).pipe(dest(config.build.images))

// Сборка всех тасков
export const spritesBuild = series(removeSprites, createSprites, copySprites)

// Слежение за изменением файлов
export const spritesWatch = () => {
  watch(`${config.src.assets.icons.mono}/**/*.svg`, series(removeSprites, spriteMono, copySprites, onSpriteChanged))
  watch(`${config.src.assets.icons.multi}/**/*.svg`, series(removeSprites, spriteMulti, copySprites, onSpriteChanged))
}
