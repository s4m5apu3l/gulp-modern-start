# Конвенции проекта

## TypeScript / JavaScript

### Строгая типизация
- Всегда указывай типы, избегай `any`
- Используй `const` по умолчанию, `let` только при необходимости
- ESNext синтаксис: arrow functions, destructuring, optional chaining
- Модули ES6: `import/export`

### Импорты
- Алиас `@/` → `src/scripts/`
- ✅ `import Header from '@/components/Header'`
- ❌ `import Header from '../../../components/Header'`

### Архитектура компонентов

Все компоненты наследуются от `Base`:

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
        // Events
    }
}
```

### Правила компонентов
1. **Селекторы**: `data-js-*` атрибуты для JS, НЕ классы стилей
2. **Проверка существования**: всегда проверяй элемент перед использованием
3. **Типизация DOM**: явно указывай `HTMLElement`, `HTMLButtonElement` и т.д.
4. **Обязательные методы**: `init()` и `bindEvents()`
5. **Приватность**: `private` для внутренних, `protected` для переопределяемых
6. **Readonly**: селекторы объявляй как `readonly`

### Обработка событий
- Сохраняй ссылки на обработчики для cleanup
- Удаляй слушатели при уничтожении компонента

```typescript
private resizeHandler = this.onResize.bind(this)

init() {
    window.addEventListener('resize', this.resizeHandler)
}

destroy() {
    window.removeEventListener('resize', this.resizeHandler)
}
```

## SCSS

### Импорты
- ✅ `@use 'base/fonts'`
- ❌ `@import 'base/fonts'` — устарело

### BEM-подобное именование

```scss
// Блок
.header { }

// Элемент
.header__menu { }

// Вложенный элемент (через дефис)
.header__lang-flag { }
.header__lang-menu { }

// Модификатор
.header__menu-link--active { }

// Состояние блока
.header.is-active { }
.header.is-hidden { }
```

**Правило вложенности**: если элемент является частью другого элемента, используй `-`:
- `&__parent` → `&-child` = `.block__parent-child`

### Вложенность
- Максимум 3 уровня
- Никогда не используй ID-селекторы (`#header`)
- Избегай `!important`

### JS-хуки
- Префикс `js-` для классов, используемых в JavaScript
- `.js-tab-btn`, `.js-dropdown`, `.js-swiper`

### Состояния
- `.is-active`, `.is-hidden`, `.is-lock` (блокировка скролла)

## Pug

### Данные
- JSON из `src/markup/data/*.json` доступны как `jsonData.имя_файла`
- Храни данные в JSON, не хардкодь в шаблонах

### Миксины
- Используй для переиспользуемых элементов
- Комментарии: `//-` (не попадут в HTML)

### Иконки
- Всегда префикс `icon-` в названии
- Обязательно указывай `width` и `height`
- Добавляй `style="fill: transparent"`

```pug
//- ✅ Правильно
+icon('icon-search')(width="20" height="20" style="fill: transparent")

//- ❌ Неправильно
+icon('search')                    // Нет префикса
+icon('icon-search')               // Нет размеров
```

### Страницы
- Все страницы расширяют `layouts/_default.pug`
- Блоки: `block variables`, `block content`, `block header`, `block footer`, `block scripts`

## Git

### Что коммитить
- Только исходники (`src/`, конфиги, доки)
- НЕ коммитить `build/`, `node_modules/`, `.webpack-cache/`, `modernizr.js`

### Сообщения коммитов
- Информативные: `Fix header menu dropdown on mobile`
- ❌ `fix`, `update`, `changes`
