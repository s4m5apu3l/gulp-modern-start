import { series, parallel } from 'gulp'

import clear from './gulp/tasks/clear.mjs'
import server from './gulp/tasks/server.mjs'
import { assetsBuild, assetsWatch } from './gulp/tasks/assets.mjs'
import { imagesBuild, imagesWatch } from './gulp/tasks/images.mjs'
import { spritesBuild, spritesWatch } from './gulp/tasks/sprites.mjs'
import { pugBuild, pugWatch } from './gulp/tasks/pug.mjs'
import { stylesBuild, stylesWatch, criticalBuild } from './gulp/tasks/styles.mjs'
import { webpackBuild, webpackWatch } from './gulp/tasks/webpack.mjs'

import config from './gulp/config.mjs'

config.setEnv()

export const build = series(
  clear,
  spritesBuild,
  // ОПТИМИЗАЦИЯ: Параллельная сборка независимых задач
  parallel(
    imagesBuild,
    stylesBuild,
    criticalBuild, // ОПТИМИЗАЦИЯ: Собираем critical.css отдельно для dev режима
    webpackBuild,
  ),
  pugBuild, // Pug последним, так как зависит от спрайтов
  assetsBuild, // Assets копирует favicons и другие ресурсы
)

export const watch = series(
  build,
  server,

  parallel(
    spritesWatch,
    imagesWatch,
    stylesWatch,
    webpackWatch,
    pugWatch,
    assetsWatch, // Assets следит за изменениями в favicons
  ),
)

export default watch
