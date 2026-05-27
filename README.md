# Gulp Modern Start

> Стартовый шаблон для современной вёрстки: Gulp 5 + Pug + SCSS + TypeScript + Webpack. Быстрая сборка, критический CSS, оптимизация изображений и hot-reload из коробки.

## 🚀 Быстрый старт

```bash
# 1. Клонируй шаблон
git clone https://github.com/s4m5apu3l/gulp-modern-start.git my-project
cd my-project

# 2. Установи зависимости
npm install

# 3. Запусти dev-сервер
npm run dev
```

После запуска откроется Browser-sync на `http://localhost:3000`. Изменения в `src/` отображаются мгновенно.

## 📦 Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с hot-reload и source maps |
| `npm run build` | Production сборка: минификация, инлайн critical CSS, оптимизация assets |
| `npm run proxy` | Browser-sync поверх существующего сервера |
| `npm run format` | Форматирование всего проекта через Prettier |

## ✨ Возможности

- **⚡ Gulp 5** — потоковая сборка с минимальной конфигурацией
- **🎨 Pug** — компактный синтаксис шаблонов, JSON-данные, layout-наследование
- **🎯 SCSS + PostCSS** — `@use` вместо deprecated `@import`, autoprefixer, cssnano, сортировка media-запросов
- **🔥 TypeScript + Webpack + SWC** — типобезопасность и скорость компиляции в 5–10× выше Babel
- **🖼️ Изображения** — авто-оптимизация (imagemin), SVG-спрайты. WebP/AVIF по запросу (для picture).
- **📱 Browser-sync** — синхронизация скролла/кликов между устройствами
- **🚀 Critical CSS** — в dev режиме подключается файлом, в production инлайнится в `<head>`
- **🧹 Prettier** — единый code style из коробки

## 📁 Структура проекта

```
src/
├── assets/               # Шрифты, иконки, картинки, видео
│   ├── icons/
│   │   ├── mono/         # Монохромные SVG → спрайт с currentColor
│   │   └── multi/        # Многоцветные SVG → спрайт
│   ├── images/
│   └── fonts/
├── markup/               # Pug-шаблоны
│   ├── data/             # JSON-данные (доступны как jsonData.filename)
│   ├── layouts/          # Базовые layouts
│   ├── mixins/           # Переиспользуемые миксины
│   ├── pages/            # Страницы
│   └── parts/            # Шапка, подвал, head
├── scripts/              # TypeScript
│   ├── components/       # Компоненты (наследуют Base)
│   └── main.ts           # Точка входа
└── styles/               # SCSS
    ├── base/             # Helpers, миксины, сброс, переменные
    ├── blocks/           # Блоки проекта (BEM)
    ├── critical.scss     # Above-the-fold стили
    └── main.scss         # Точка входа
```

## 🛠️ Архитектура

### Pug
- JSON из `markup/data/` доступен в шаблонах как `jsonData.имяФайла`
- Layouts с блоками: `block content`, `block header`, `block footer`

### Изображения

Два подхода — выбирай по задаче:

**Простая картинка (рекомендуется):**
```pug
+img('photo.jpg', 'Описание', 800, 600)
```
Генерирует `<img>` с `loading="lazy"`, `decoding="async"`, `srcset` для retina. Исходник оптимизируется imagemin, дополнительных файлов не требуется.

**Адаптивная картинка (art direction / форматы):**
```pug
+picture('img/photo.jpg', isMobile=true, isTablet=true, isLaptop=true)
```
Требует заранее подготовить ресайзы и retina (`photo-mobile@1x.jpg`, `photo-mobile@2x.jpg`, `photo-tablet...`, `photo-desktop...`). Дополнительно сгенерирует WebP и AVIF:
```bash
npx gulp imagesConvert
```

### SCSS
- **Только `@use`** — `@import` запрещён
- **BEM** нотация: `.block`, `.block__element`, `.block__parent-child`
- **Хелперы:** `rem()`, `z()`, медиа-миксины (`tablet`, `mobile`, `hover`)
- **Состояния:** `.is-active`, `.is-hidden`
- **JS-хуки:** `.js-*` префикс для селекторов, которые используются в скриптах

### TypeScript
- Все компоненты **наследуют** `Base` из `@/components/Base`
- Селекторы **только** через `data-js-*` атрибуты
- Путь `@/` → `src/scripts/`
- События навешиваются в `bindEvents()`, очищаются в `destroy()`

## ➕ Добавление новых сущностей

**Новая страница:**
1. Создать `src/markup/pages/page-name.pug`
2. Унаследовать от `layouts/_default.pug`
3. Добавить в `gulpfile.mjs` в таску `pug` (или если используется glob — автоматически)

**Новый компонент:**
1. `src/scripts/components/ComponentName/index.ts`
2. Наследовать `Base`, реализовать `init()` и `bindEvents()`
3. Импортировать в `src/scripts/main.ts`

**Новый SCSS-блок:**
1. `src/styles/blocks/_block-name.scss`
2. Импортировать в `src/styles/main.scss` через `@use 'blocks/block-name'`

## ⚙️ Требования

- **Node.js** ≥ 22.0.0
- **npm** ≥ 10.0.0

## 🐛 Troubleshooting

| Проблема | Решение |
|----------|---------|
| `Error: Cannot find module` | `rm -rf node_modules && npm install` |
| Порт 3000 занят | Изменить `port` в `gulpfile.mjs` (Browser-sync опция) |
| SCSS не компилируется после добавления `@import` | Замени на `@use` и проверь namespace |
| Изображения не оптимизируются | Убедись, что `imagemin-pngquant` установлен корректно (требует libpng) |

## 📜 Лицензия

MIT © [Oroku Slav](https://github.com/s4m5apu3l)
