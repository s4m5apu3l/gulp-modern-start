# API Reference

## Pug миксины

### `+icon(name)`

Вставляет SVG из спрайта. Mono-иконки наследуют цвет через `currentColor`.

**Файл:** `src/markup/mixins/_icon.pug`

```pug
+icon('icon-search')(width="20" height="20")
+icon('icon-arrow')(width="16" height="16").btn__icon
```

**Атрибуты:**
- `width` / `height` — желательны для предотвращения CLS
- Можно добавлять классы: `+icon('icon-close')(width="24" height="24").modal__close-icon`
- Цвет задаётся через `color` родителя (mono) или сохраняется из SVG (multi)

---

### `+img(file, alt, width, height)`

Простое изображение с lazy-loading и retina srcset.

**Файл:** `src/markup/mixins/_img.pug`

```pug
+img('photo.jpg', 'Описание', 800, 600)
+img('subfolder/photo.jpg', 'Описание')
```

**Параметры:**
- `file` — путь относительно `assets/images/` (поддерживаются подпапки)
- `alt` — описание (по умолчанию пустая строка)
- `width` / `height` — размеры (опционально, но рекомендуются для CLS)



---

## SCSS Helpers

### `rem($pixel)`

Конвертирует px в rem (база 16px).

```scss
@use 'base/helpers' as *;

.block {
    padding: rem(24);      // → 1.5rem
    font-size: rem(16);  // → 1rem
}
```

**Важно:** передавай только числа, без единиц измерения.

---

### Медиа-миксины

```scss
@include laptop-above { }    // width > 1440.98px
@include laptop { }          // width <= 1440.98px
@include tablet-above { }    // width > 1023.98px
@include tablet { }          // width <= 1023.98px
@include mobile-above { }   // width > 767.98px
@include mobile { }         // width <= 767.98px
@include mobile-s-above { } // width > 480.98px
@include mobile-s { }       // width <= 480.98px
```

### Кастомные breakpoints

```scss
@include from('md') { }   // min-width: 1023.98px
@include to('sm') { }     // max-width: 767.98px
@include only-mobile { }  // max-width: 766.98px
```

### `z($layer)`

Получает z-index из иерархии.

```scss
@use 'base/helpers' as *;

.modal { z-index: z('modal'); }         // → 500
.overlay { z-index: z('overlay'); }     // → 250
.dropdown { z-index: z('dropdown'); }    // → 21
```

**Слои (из `src/styles/base/_z-index.scss`):**
```
behind: -1
default: 0
content-overlay: 1
content-elevated: 10
dropdown: 21
tooltip: 100
overlay: 250
header: 300
submenu: 280
search: 350
modal: 500
modal-overlay: 450
notification: 900
mobile-filter: 1000
mobile-header: 1003
```

### `hover()`

Обработка hover с fallback на active для touch-устройств.

```scss
@include hover {
    color: rgb(var(--color-accent));
}
```

### `font-face()`

Регистрация шрифта.

```scss
@include font-face('MyFont', '../fonts/MyFont-Regular');
@include font-face('MyFont', '../fonts/MyFont-Bold', 700);
```

---

## CSS Custom Properties

Определены в `src/styles/base/_globals.scss`:

```css
:root {
    --container-width: 1280px;          /* max-width контейнера */
    --container-padding-x: 16px;        /* горизонтальные отступы */
    --scroll-bar: 15px;                 /* ширина скроллбара */
    --100vw: calc(100vw - var(--scroll-bar));

    --font-family-base: system-ui, ...;

    --color-light: #f7f8fa;
    --color-dark: #1f1f1f;
    --color-accent: #2563eb;
    --color-gray: #88919e;

    --border: 1px solid rgb(var(--color-accent));
    --transition-duration: 0.2s;
}
```

---

## TypeScript Base Class

**Файл:** `src/scripts/components/Base.ts`

Все компоненты наследуются от `Base`. Предоставляет:

```typescript
abstract class Base {
    protected abstract init(): void      // Инициализация DOM
    protected abstract bindEvents(): void // Привязка событий
    
    // Реактивное состояние (опционально)
    protected getProxyState<T>(initialState: T): T
    protected updateUI(): void           // Авто-вызов при изменении state
}
```

---

## Webpack Alias

| Alias | Путь |
|---|---|
| `@/` | `src/scripts/` |

```typescript
import Base from '@/components/Base'
import { utils } from '@/utils/helpers'
```

---

## Gulp Config Paths

**Файл:** `gulp/config.mjs`

```javascript
config.src.markup.root      // src/markup
config.src.markup.data      // src/markup/data
config.src.markup.pages     // src/markup/pages
config.src.style            // src/styles
config.src.script.root      // src/scripts
config.src.assets.root      // src/assets
config.src.assets.images    // src/assets/images
config.src.assets.favicons  // src/assets/favicons
config.src.assets.icons.mono   // src/assets/icons/mono
config.src.assets.icons.multi  // src/assets/icons/multi
config.src.assets.fonts     // src/assets/fonts
config.src.assets.videos    // src/assets/videos
config.src.assets.libs      // src/assets/libs

config.build.root           // build
config.build.style          // build/css
config.build.script         // build/js
config.build.images         // build/img
config.build.favicons       // build/favicons
config.build.fonts          // build/fonts
config.build.videos         // build/videos
config.build.libs           // build/libs
```

---

## Environment

```javascript
config.isDev   // true если не --production
config.isProd  // true если --production
config.version // версия из package.json
```
