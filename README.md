# Проект НЧ

![Gulp сборка](https://raw.githubusercontent.com/eliofery/gulp-template/main/src/assets/images/build-logo.svg)
[Страница документации](https://eliofery.github.io/gulp-template-docs/)

### Основа сборки

Сборка содержит шаблонизатор **Pug**, препроцессор **SCSS**, сборщик модулей **Webpack**.

### Особенности сборки

- Оптимизация под Page Speed

  - Отложенная загрузка
  - Критические стили

- Базовая SEO оптимизация

  - Open Graph / Twitter Cards
  - JSON-LD микроразметка
  - Google Analytics / Yandex Metrika

- Pug шаблонизатор

  - Улучшенный фильтр markdown-it
  - Возможность добавлять свои фильтры на примере фильтра special-chars
  - Работа с json данными

- SCSS препроцессор

- Webpack сборщик

  - Возможность использовать новый формат JS по максимуму
  - Оптимизация кода через Babel
  - Поддержка Typescript

- SVG спрайты

  - Цветные
  - Черно-белые

- Оптимизированные изображения

  - Генерация webp и avif форматов

- Настроенные линтеры

  - Stylelint
  - Pug-lint
  - ES-Lint
  - Prettier
  - Editorconfig

- Modernizr
- Отдельная директория `/favicons/` для фавиконок

## Инструкция по установке

### Шаг 0 (Важно!)

**Проект требует Node.js версии 22.x или выше**

Если вы используете nvm (Node Version Manager):

```bash
# Автоматически переключиться на нужную версию Node
nvm use

# Если версия 22 не установлена, установите её
nvm install 22
nvm use 22
```

Проверьте версию Node:

```bash
node -v  # Должно быть v22.x.x
```

**Подробная информация:** см. `NODE_VERSION.md`

### Шаг 1

Установить зависимости.

```bash
npm install
```

### Шаг 2

Сгенерировать favicons через [RealFaviconGenerator](https://realfavicongenerator.net/).

1. Откройте https://realfavicongenerator.net/
2. Загрузите ваш логотип (SVG или PNG, минимум 512x512)
3. Настройте параметры для разных платформ
4. Скачайте архив с favicons
5. Скопируйте файлы в `./src/assets/favicons/`

**Подробная инструкция:** см. `FAVICONS_GUIDE.md`

### Шаг 3

Теперь вы готовы приступить к верстке своего проекта.

Запуск проекта в режиме разработки.

```bash
npm run dev
```

Сборка проекта.

```bash
npm run build
```

Только запуск виртуального сервера для просмотра проекта в браузере.

```bash
npm run proxy
```

## Примеры верстки с Pug

### Json данные в Pug

Хранятся в каталоге **./src/pug/data**. Например файл **mainNav.json**.

Чтобы получить доступ к его значениям, нужно обратиться к глобальной переменной **jsonData**, которая отвечает за вывод данных из **json** файлов, хранящихся в каталоге **data**.

```
jsonData.имя_файла
```

Получение содержимого из файла **mainNav.json** будет выглядеть следующим образом:

```
jsonData.mainNav
```

### Вывода навигации

Рассмотрим пример вывода навигации на основе **json** данных из файла **mainNav.json**.

Ознакомиться с содержимым файла **mainNav.json** можно по пути **./src/pug/data/mainNav.json**.

```pug
ul
  each item, index in jsonData.mainNav.items
    li #{ index }
    li #{ item.title }

    if item.links
      ul
      each link in item.links
        li #{ link.title }
        li #{ link.link }
```

### Вывод code

Рассмотрим пример вывода разметки в теге code.

**Внимание**: символ **\\** здесь исключительно для экранирования, не используйте его в коде.

````pug
pre
  code
    :special-chars
      <div>
        Тут разметка которая экранируется
      </div>

// Короткая версия конструкции выше
:markdown-it
  \```html
  <div>
    Тут разметка которая экранируется
  </div>
  \```
````

### Markdown разметка

Рассмотрим пример вывода Markdown разметки.

**Внимание**: символ **\\** здесь исключительно для экранирования, не используйте его в коде.

````pug
:markdown-it(inline) **текст**

:markdown-it
  Многострочный **текст**

include:markdown-it ../markdown/docs.md

:markdown-it
  \```js
  var codeBlocks;
  \```
````
