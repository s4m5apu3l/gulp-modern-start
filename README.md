# Gulp Starter

Стартовый шаблон для вёрстки с Gulp 5, Pug, SCSS, TypeScript и Webpack.

## Быстрый старт

```bash
npm install
npm run dev
```

## Скрипты

- `npm run dev` — запуск dev-сервера с hot-reload
- `npm run build` — продакшен-сборка
- `npm run proxy` — browser-sync с прокси
- `npm run format` — форматирование Prettier

## Структура

```
src/
├── assets/          # Шрифты, иконки, картинки, видео
├── markup/          # Pug-шаблоны
│   ├── data/        # JSON-данные для шаблонов
│   ├── layouts/     # Базовые layouts
│   ├── mixins/      # Переиспользуемые миксины
│   ├── pages/       # Страницы
│   └── parts/       # Шапка, подвал, head
├── scripts/         # TypeScript
│   └── components/  # Компоненты
└── styles/          # SCSS
    ├── base/        # Helpers, миксины, сброс
    └── blocks/      # Блоки проекта
```

## Стек

- **Шаблонизатор:** Pug с `gulp-pug` (оптимизированная версия)
- **Стили:** SCSS + PostCSS (autoprefixer, cssnano, sort-media-queries)
- **Скрипты:** TypeScript через Webpack + SWC (в 5–10× быстрее Babel)
- **Dev-сервер:** Browser-sync
- **Изображения:** Оптимизация (imagemin), генерация WebP/AVIF, SVG-спрайты
- **Критический CSS:** Инлайнинг в `<head>` для production

## Архитектура

### Pug
- JSON-данные из `markup/data/` доступны в шаблонах как `jsonData.имяФайла`
- Миксины: `+icon('icon-name')`, `+picture('img/photo.jpg')`
- Layouts с блоками `block content`, `block header`, `block footer`

### SCSS
- `@use` вместо устаревшего `@import`
- Система хелперов: `rem()`, media-миксины, `z()`
- BEM: `.block`, `.block__element`, `.block__parent-child`

### TypeScript
- Все компоненты наследуются от `Base`
- Селекторы через `data-js-*` атрибуты
- Alias `@/` → `src/scripts/`

## Требования

- Node.js ≥ 22
- npm ≥ 10
