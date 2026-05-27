# Dropdowns Component

Универсальный компонент для создания дропдаунов (выпадающих списков) с поддержкой:

- Одиночного выбора (селект)
- Множественного выбора (чекбоксы)
- Языкового переключателя

## Использование

### Одиночный выбор (селект)

```pug
.news__filter(data-dropdown)
    button.news__filter-btn(data-dropdown-btn)
        span(data-dropdown-current) Сначала новые
        +icon('icon-chevron-down')(width="16" height="16" style="fill: transparent")
    .news__filter-menu
        button.news__filter-item.is-active(data-dropdown-item data-value="new")
            span Сначала новые
        button.news__filter-item(data-dropdown-item data-value="old")
            span Сначала старые
```

### Множественный выбор (чекбоксы)

```pug
.news__filter(data-dropdown data-dropdown-multiple)
    button.news__filter-btn(data-dropdown-btn)
        span(data-dropdown-current data-default-text="Все типы") Все типы
        +icon('icon-chevron-down')(width="16" height="16" style="fill: transparent")
    .news__filter-menu
        label.news__filter-item(data-dropdown-item data-value="children")
            input(type="checkbox")
            span Для детей
        label.news__filter-item(data-dropdown-item data-value="outdoor")
            input(type="checkbox")
            span На открытом воздухе
        label.news__filter-item(data-dropdown-item data-value="limited")
            input(type="checkbox")
            span Для лиц с ограниченными возможностями
```

### Языковой переключатель

```pug
.header__lang-dropdown.language-dropdown(data-dropdown)
    button.header__lang(data-dropdown-btn)
        .header__lang-flag.header__lang-flag--tat
        span(data-dropdown-current) ТАТ
    .header__lang-menu
        button.header__lang-item.is-active(data-dropdown-item data-value="tat")
            .header__lang-flag.header__lang-flag--tat
            span ТАТ
        button.header__lang-item(data-dropdown-item data-value="rus")
            .header__lang-flag.header__lang-flag--rus
            span РУС
```

## Атрибуты

### Обязательные

- `data-dropdown` - контейнер дропдауна
- `data-dropdown-btn` - кнопка открытия/закрытия
- `data-dropdown-item` - элемент списка
- `data-value` - значение элемента

### Опциональные

- `data-dropdown-multiple` - включает режим множественного выбора
- `data-dropdown-current` - элемент для отображения текущего значения
- `data-default-text` - текст по умолчанию для множественного выбора
- `.language-dropdown` - класс для языкового переключателя
- `.is-active` - активный элемент по умолчанию

## События

Компонент генерирует событие `dropdownChange` при изменении значения:

```typescript
document.addEventListener('dropdownChange', (e: Event) => {
  const customEvent = e as CustomEvent<DropdownChangeDetail>

  console.log('Dropdown:', customEvent.detail.dropdown)
  console.log('Value:', customEvent.detail.value) // для одиночного выбора
  console.log('Values:', customEvent.detail.values) // для множественного выбора
  console.log('Text:', customEvent.detail.text)
  console.log('Is Multiple:', customEvent.detail.isMultiple)
})
```

## Поведение

### Одиночный выбор

- Клик по элементу выбирает его и закрывает дропдаун
- Текст кнопки обновляется на текст выбранного элемента
- Только один элемент может быть активным

### Множественный выбор

- Клик по элементу переключает чекбокс
- Дропдаун остается открытым
- Текст кнопки показывает:
  - Текст по умолчанию, если ничего не выбрано
  - Название элемента, если выбран один
  - "Выбрано: N", если выбрано несколько

### Общее

- Клик вне дропдауна закрывает все открытые дропдауны
- Открытие одного дропдауна закрывает другие
- Иконка в кнопке поворачивается при открытии

## Стили

Стили находятся в `_news.scss`:

```scss
.news__filter {
  &-btn {
  } // Кнопка
  &-menu {
  } // Выпадающее меню
  &-item {
  } // Элемент списка

  &.is-open {
  } // Открытое состояние
}
```

## Инициализация

Компонент автоматически инициализируется в `main.ts`:

```typescript
import initDropdowns from '@/components/Dropdowns'
initDropdowns()
```
