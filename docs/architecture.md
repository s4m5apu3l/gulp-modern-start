# Архитектура сборки

## Стек

| Технология | Роль |
|---|---|
| Gulp 5 | Оркестратор задач |
| Pug | Шаблонизатор HTML |
| SCSS (Dart Sass) | Препроцессор стилей |
| PostCSS | Автопрефиксер, сортировка media queries, минификация |
| TypeScript | Язык скриптов |
| Webpack + SWC | Сборка и транспиляция JS/TS |
| Browser-sync | Dev-сервер с hot-reload |

## Структура gulp-задач

```
gulpfile.mjs
├── build = series(
│   clear,
│   spritesBuild,
│   parallel(imagesBuild, stylesBuild, criticalBuild, webpackBuild),
│   pugBuild,
│   assetsBuild
│)
└── watch = series(build, server, parallel(spritesWatch, imagesWatch, stylesWatch, webpackWatch, pugWatch, assetsWatch))
```

### Задачи

| Задача | Что делает | Время (dev) |
|---|---|---|
| `clear` | Удаляет `build/` | 20 мс |
| `spritesBuild` | Генерирует SVG-спрайты из `icons/mono/` и `icons/multi/` | 500 мс |
| `imagesBuild` | Оптимизация картинок, копирование фавиконов | 1-2 с |
| `stylesBuild` | Компиляция `main.scss` → `css/main.css` | 1-2 с |
| `criticalBuild` | Компиляция `critical.scss` → `css/critical.css` | 100 мс |
| `webpackBuild` | Сборка TS через SWC → `js/main.js` | 2-3 с |
| `pugBuild` | Компиляция страниц из `markup/pages/` | 0.5-1 с |
| `assetsBuild` | Копирование шрифтов, видео, libs, robots.txt, manifest.json | 20 мс |

### Кэширование и оптимизации

**Pug**
- `getData()` кэширует JSON на 1 секунду (TTL) — предотвращает повторное чтение при batch-компиляции
- `gulp-newer` в `changeIncludes` — пересобирает только страницы старше изменённых зависимостей
- `pretty: false` в dev — HTML минифицирован, но браузер парсит идентично
- Session cache для `compiledFnCache` — pug-функции кэшируются по mtime

**Webpack**
- Filesystem cache в `.webpack-cache/` — TS компилируется только при изменениях
- SWC вместо Babel — в 5-10× быстрее
- `eval-cheap-module-source-map` в dev — самый быстрый source map

**Styles**
- `sortMediaQueries` только в production — отключён в dev для скорости
- `cssnano` + `postcss-discard-comments` только в production
- CSS inject через Browser-sync без перезагрузки страницы

### Критический CSS

- В dev: подключается как отдельный файл `<link rel="stylesheet" href="css/critical.css">`
- В production: инлайнится в `<head>` через Pug-фильтр `:critical-css`
- Фильтр использует `jstransformer-scss` + `jstransformer-clean-css` для компиляции и минификации
- Путь к critical SCSS задаётся через `@import 'src/styles/critical'`

### Environment

- `config.isDev = !process.argv.includes('--production')`
- `config.isProd = process.argv.includes('--production')`
- Sourcemaps в dev: внешние файлы `.css.map` и `.js.map`
- Sourcemaps в prod: отключены

## Пути

```javascript
// gulp/config.mjs
src: {
  root: 'src',
  markup: {
    root: 'src/markup',
    data: 'src/markup/data',
    pages: 'src/markup/pages',
  },
  style: 'src/styles',
  script: { root: 'src/scripts' },
  assets: {
    root: 'src/assets',
    images: 'src/assets/images',
    favicons: 'src/assets/favicons',
    icons: {
      root: 'src/assets/icons',
      mono: 'src/assets/icons/mono',
      multi: 'src/assets/icons/multi',
    },
    fonts: 'src/assets/fonts',
    videos: 'src/assets/videos',
    libs: 'src/assets/libs',
  },
},
build: {
  root: 'build',
  style: 'build/css',
  script: 'build/js',
  images: 'build/img',
  favicons: 'build/favicons',
  fonts: 'build/fonts',
  videos: 'build/videos',
  libs: 'build/libs',
}
```

## Browser-sync

- Dev-server: `http://localhost:3000`
- Статика из `build/`
- CSS inject без перезагрузки
- Авто-открытие браузера
