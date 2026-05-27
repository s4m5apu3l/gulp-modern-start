# VacanciesFilter - Работа с AJAX

## Проблема

После AJAX обновления DOM события на элементах теряются, потому что обработчики были привязаны к старым элементам.

## Решение

Используется **делегирование событий** - события привязываются к `document.body`, который никогда не обновляется.

## Как это работает

### 1. Делегирование событий (Event Delegation)

```typescript
// ❌ ПЛОХО - события потеряются после AJAX
button.addEventListener('click', handler)

// ✅ ХОРОШО - события работают всегда
document.body.addEventListener('click', e => {
  if (e.target.matches('.button')) {
    handler()
  }
})
```

### 2. Автоматическая работа после AJAX

**Для списка вакансий:**

```typescript
// Обновляем список - события продолжают работать!
document.querySelector('.vacancies__list').innerHTML = newHTML
// Ничего дополнительно делать не нужно
```

**Для самих фильтров:**

```typescript
import { reinitVacanciesFilter } from '@/components/VacanciesFilter'

// Обновляем фильтры
document.querySelector('.vacancies__filter').innerHTML = newHTML

// Вызываем реинициализацию
reinitVacanciesFilter()
```

## Примеры использования

### Пример 1: Отправка фильтров на сервер

```typescript
import { getVacanciesFilterData } from '@/components/VacanciesFilter'

const filterData = getVacanciesFilterData()

fetch('/api/vacancies', {
  method: 'POST',
  body: JSON.stringify(filterData),
})
```

### Пример 2: Обновление списка вакансий

```typescript
fetch('/api/vacancies')
  .then(res => res.json())
  .then(data => {
    // Обновляем HTML
    document.querySelector('.vacancies__list').innerHTML = data.html

    // События продолжают работать автоматически!
  })
```

### Пример 3: Обновление фильтров

```typescript
import { reinitVacanciesFilter } from '@/components/VacanciesFilter'

fetch('/api/filters')
  .then(res => res.json())
  .then(data => {
    // Обновляем HTML фильтров
    document.querySelector('.vacancies__filter').innerHTML = data.html

    // ВАЖНО: Реинициализируем
    reinitVacanciesFilter()
  })
```

### Пример 4: Автоматическая отправка при изменении

```typescript
import { initAutoSubmit } from '@/components/VacanciesFilter/ajax-example'

// Автоматически отправляет фильтры при каждом изменении
initAutoSubmit()
```

## Тестирование

### Тест 1: Проверка работы после AJAX

```javascript
// 1. Откройте консоль браузера
// 2. Выполните:
document.querySelector('.vacancies__filter').innerHTML = document.querySelector('.vacancies__filter').innerHTML

// 3. Попробуйте кликнуть на кнопки фильтров
// Результат: Все должно работать!
```

### Тест 2: Проверка получения данных

```javascript
import { getVacanciesFilterData } from '@/components/VacanciesFilter'

// Выберите несколько фильтров, затем:
console.log(getVacanciesFilterData())
// Должен вывести объект с выбранными фильтрами
```

### Тест 3: Проверка реинициализации

```javascript
import { reinitVacanciesFilter } from '@/components/VacanciesFilter'

// Обновите HTML фильтров
document.querySelector('.vacancies__filter').innerHTML = '...'

// Реинициализируйте
reinitVacanciesFilter()

// Проверьте что кнопки "Выбрать ещё" и "Все фильтры" работают
```

## API

### `initVacanciesFilter()`

Основная функция инициализации. Вызывается автоматически при загрузке страницы.

### `getVacanciesFilterData()`

Возвращает объект с данными всех выбранных фильтров.

**Возвращает:**

```typescript
{
  excludeWords: string,
  salaryFrom: string,
  график_работы: string,
  рабочие_часы_в_день: string,
  категория_прав: string,
  checkboxFilters: string[],
  education: string,
  experience: string
}
```

### `reinitVacanciesFilter()`

Реинициализирует кнопки "Выбрать ещё" и "Все фильтры" после обновления HTML.

**Когда вызывать:**

- После AJAX обновления контейнера `.vacancies__filter`
- После динамического добавления новых секций фильтров

**Когда НЕ нужно вызывать:**

- После обновления списка вакансий (`.vacancies__list`)
- После изменения значений в существующих фильтрах

## Структура данных для бэкенда

### Дропдауны

Значение хранится в `data-selected-value`:

```html
<span data-dropdown-current data-selected-value="full-time"> Полный день </span>
```

### Чекбоксы и радио

Стандартные HTML элементы:

```html
<input type="checkbox" checked /> <input type="radio" name="education" checked />
```

### Текстовые поля

Стандартные HTML элементы:

```html
<input class="vacancies__filter-input" type="text" value="..." />
<input class="vacancies__filter-input" type="number" value="50000" />
```

## Преимущества подхода

✅ События работают после любых AJAX обновлений
✅ Не нужно отслеживать и удалять старые обработчики
✅ Меньше памяти (один обработчик вместо сотен)
✅ Проще поддерживать и тестировать
✅ Работает с динамически добавленными элементами

## Важные замечания

1. **Делегирование инициализируется только один раз** при первом вызове `initVacanciesFilter()`
2. **Кнопки создаются через JS**, не нужно добавлять их в HTML
3. **После обновления списка вакансий** ничего делать не нужно
4. **После обновления фильтров** нужно вызвать `reinitVacanciesFilter()`
