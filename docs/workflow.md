# Workflow: как добавлять элементы

## Добавить страницу

1. Создать `src/markup/pages/my-page.pug`
2. Расширить layout:

```pug
extends ../layouts/_default.pug

block variables
    - const pageTitle = 'Моя страница';
    - const pageDescription = 'Описание страницы';

block content
    .container
        h1.h1 Моя страница
```

3. `npm run dev` — страница автоматически скомпилируется в `build/my-page.html`

## Добавить компонент TypeScript

1. Создать `src/scripts/components/MyComponent/index.ts`
2. Наследоваться от `Base`:

```typescript
import Base from '@/components/Base'

export default class MyComponent extends Base {
    private rootElement!: HTMLElement
    private readonly selectors = {
        root: '[data-js-my-component]',
    }

    constructor() {
        super()
        this.init()
        this.bindEvents()
    }

    protected init(): void {
        this.rootElement = document.querySelector(this.selectors.root) as HTMLElement
        if (!this.rootElement) {
            console.error('MyComponent: root element not found')
            return
        }
    }

    protected bindEvents(): void {
        // Ваши события
    }
}
```

3. Импортировать и инициализировать в `src/scripts/main.ts`:

```typescript
import MyComponent from '@/components/MyComponent'
new MyComponent()
```

## Добавить стили

1. Создать `src/styles/blocks/_my-block.scss`
2. Импортировать в `src/styles/main.scss`:

```scss
@use 'blocks/my-block';
```

### Пример блока

```scss
@use '../base/helpers' as *;

.my-block {
    padding: rem(40) 0;

    &__title {
        font-size: rem(24);
        font-weight: 600;
    }

    @include tablet {
        padding: rem(24) 0;
    }
}
```

## Добавить иконку SVG

### Чёрно-белая (mono)
1. Положить SVG в `src/assets/icons/mono/icon-my-icon.svg`
2. Gulp генерирует спрайт автоматически
3. Использовать в Pug:

```pug
+icon('icon-my-icon')(width="24" height="24")
```

### Цветная (multi)
1. Положить SVG в `src/assets/icons/multi/icon-my-icon.svg`
2. Использовать аналогично

**Требования к SVG:**
- ViewBox обязателен
- Не использовать inline `<style>` для mono (удаляется при сборке спрайта)
- Для multi inline `<style>` поддерживается

## Добавить изображение

1. Положить файл в `src/assets/images/my-image.jpg`
2. Gulp автоматически оптимизирует оригинал (imagemin)
3. Для простых случаев:

```pug
+img('my-image.jpg', 'Описание', 800, 600)
```

Для адаптивных изображений (art direction / WebP / AVIF):

```pug
+picture('images/my-image.jpg')(width="800" height="600")
```

При этом требуется заранее подготовить ресайзы (mobile/tablet/desktop @1x/@2x). Для генерации WebP и AVIF:

```bash
npx gulp imagesConvert
```

## Добавить шрифт

1. Положить WOFF2 в `src/assets/fonts/MyFont-Regular.woff2`
2. Подключить в `src/styles/base/_fonts.scss`:

```scss
@include font-face('MyFont', '../fonts/MyFont-Regular');
@include font-face('MyFont', '../fonts/MyFont-Bold', 700);
```

3. Использовать в CSS:

```scss
:root {
    --font-family-base: 'MyFont', sans-serif;
}
```

## Добавить JSON-данные

1. Создать `src/markup/data/navigation.json`
2. Использовать в Pug:

```pug
each item in jsonData.navigation.items
    a(href=item.link)= item.title
```

## Добавить favicon

См. `FAVICONS_GUIDE.md` в корне проекта.

1. Подготовить файлы: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`
2. Положить в `src/assets/favicons/`
3. Gulp скопирует в `build/favicons/`
4. Подключение уже есть в `src/markup/parts/_head.pug`

## Работа с Critical CSS

- Важные стили для первого экрана — в `src/styles/critical.scss`
- В dev: подключаются как отдельный файл (быстрее)
- В production: инлайнятся в `<head>`
- Не дублируй стили между `critical.scss` и `main.scss`
