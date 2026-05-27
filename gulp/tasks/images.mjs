/**
 * Оптимизация изображений
 *
 * Уменьшает размер изображений и создает webp, avif форматы
 * 
 * ОПТИМИЗАЦИИ:
 * - Используется gulp-newer для обработки только измененных файлов
 * - Параллельная обработка форматов
 * - Оптимизация только в production режиме
 * - Favicons копируются в отдельную папку /favicons/
 */

// Сторонние библиотеки
import { src, dest, watch, series, parallel } from 'gulp' // gulp плагин
import gulpif from 'gulp-if' // вызывает функции по условию
import newer from 'gulp-newer' // пропускает старые файлы
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin' // оптимизирует изображения
import pngQuant from 'imagemin-pngquant' // оптимизирует png изображения
import webp from 'gulp-webp' // создает webp файлы
import avif from 'gulp-avif' // создает avif файлы
import plumber from 'gulp-plumber' // перехватывает ошибки
import notify from 'gulp-notify' // уведомляет об ошибках

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
                { name: 'removeViewBox', active: true },
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
                { name: 'removeViewBox', active: true },
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

// Создание Webp изображения
export const toWebp = () =>
  src(`${config.src.assets.images}/**/*.{jpg,png,jpeg}`, {
    encoding: false,
  })
    .pipe(
      plumber({
        errorHandler: notify.onError(err => ({
          title: 'Ошибка в задаче toWebp',
          sound: false,
          message: err.message,
        })),
      }),
    )
    .pipe(newer({ dest: config.build.images, ext: '.webp' }))
    .pipe(webp({ quality: 80 }))
    .pipe(dest(config.build.images))

// Создание Avif изображения
export const toAvif = () =>
  src(`${config.src.assets.images}/**/*.{jpg,png,jpeg}`, {
    encoding: false,
  })
    .pipe(
      plumber({
        errorHandler: notify.onError(err => ({
          title: 'Ошибка в задаче toAvif',
          sound: false,
          message: err.message,
        })),
      }),
    )
    .pipe(newer({ dest: config.build.images, ext: '.avif' }))
    .pipe(
      avif({
        quality: 80,
        speed: 8,
      }),
    )
    .pipe(dest(config.build.images))

// Основная сборка: только оптимизация исходников + favicons.
// WebP/AVIF отдельно через `imagesConvert` — если нужны для picture.
export const imagesBuild = parallel(imageOptim, faviconsCopy)

// Опционально: генерация WebP и AVIF (для picture-миксина)
export const imagesConvert = parallel(toWebp, toAvif)

// Слежение за изменением файлов
export const imagesWatch = () => {
  watch([`${config.src.assets.images}/**/*`], { ignoreInitial: true }, imagesBuild)
  watch([`${config.src.assets.favicons}/**/*`], { ignoreInitial: true }, faviconsCopy)
}
