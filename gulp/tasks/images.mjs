/**
 * Оптимизация изображений
 *
 * Уменьшает размер изображений через imagemin.
 *
 * ОПТИМИЗАЦИИ:
 * - gulp-newer для обработки только измененных файлов
 * - Оптимизация только в production режиме
 * - Favicons копируются в отдельную папку /favicons/
 */

// Сторонние библиотеки
import { src, dest, watch, parallel } from 'gulp'
import gulpif from 'gulp-if'
import newer from 'gulp-newer'
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin'
import pngQuant from 'imagemin-pngquant'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'

// Конфиги
import config from '../config.mjs'

// Оптимизация изображений (без favicons)
export const imageOptim = () =>
  src([`${config.src.assets.images}/**/*`], {
    encoding: false,
  })
    .pipe(
      plumber({
        errorHandler: notify.onError(err => ({
          title: 'Ошибка в задаче imageOptim',
          sound: false,
          message: err.message,
        })),
      }),
    )
    .pipe(newer(config.build.images))
    .pipe(
      gulpif(
        config.isProd,
        imagemin(
          [
            gifsicle({ interlaced: true }),
            optipng({ optimizationLevel: 5 }),
            pngQuant({ quality: [0.8, 0.9] }),
            mozjpeg({ quality: 75, progressive: true }),
            svgo({
              plugins: [
                { name: 'cleanupIDs', active: true },
                { name: 'removeUselessDefs', active: true },
                { name: 'removeViewBox', active: false },
                { name: 'removeComments', active: true },
                { name: 'mergePaths', active: true },
                { name: 'minifyStyles', active: false },
              ],
            }),
          ],
          { verbose: config.isProd },
        ),
      ),
    )
    .pipe(dest(config.build.images))

// Оптимизация и копирование favicons в отдельную папку
export const faviconsCopy = () =>
  src([`${config.src.assets.favicons}/**/*`], {
    encoding: false,
  })
    .pipe(
      plumber({
        errorHandler: notify.onError(err => ({
          title: 'Ошибка в задаче faviconsCopy',
          sound: false,
          message: err.message,
        })),
      }),
    )
    .pipe(newer(config.build.favicons))
    .pipe(
      gulpif(
        config.isProd,
        imagemin(
          [
            optipng({ optimizationLevel: 5 }),
            pngQuant({ quality: [0.8, 0.9] }),
            svgo({
              plugins: [
                { name: 'cleanupIDs', active: true },
                { name: 'removeUselessDefs', active: true },
                { name: 'removeViewBox', active: false },
                { name: 'removeComments', active: true },
                { name: 'mergePaths', active: true },
                { name: 'minifyStyles', active: false },
              ],
            }),
          ],
          { verbose: config.isProd },
        ),
      ),
    )
    .pipe(dest(config.build.favicons))

// Основная сборка: оптимизация исходников + favicons
export const imagesBuild = parallel(imageOptim, faviconsCopy)

// Слежение за изменением файлов
export const imagesWatch = () => {
  watch([`${config.src.assets.images}/**/*`], { ignoreInitial: true }, imagesBuild)
  watch([`${config.src.assets.favicons}/**/*`], { ignoreInitial: true }, faviconsCopy)
}
