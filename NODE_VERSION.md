# Требования к версии Node.js

## Важно!

Этот проект требует **Node.js версии 22.x или выше**

## Быстрый старт с nvm

### Установка nvm (если еще не установлен)

**Linux/macOS:**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

**Windows:**
Скачайте [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)

### Использование правильной версии Node

```bash
# Переключиться на Node 22 (автоматически читает .nvmrc)
nvm use

# Если версия 22 не установлена
nvm install 22
nvm use 22

# Проверить версию
node -v  # Должно показать v22.x.x
```

### Установка зависимостей

```bash
npm install
```

### Запуск проекта

```bash
npm run dev
```

## Изменения в версии 2.0 (Миграция на Node 22+)

### Что изменилось

- ✅ Обновлено до Node 22+
- ✅ Удалена автоматическая генерация favicons из Gulp
- ✅ Удалены устаревшие зависимости (gulp-image-resize, gulp-svg2png, gulp-to-ico)
- ✅ Удалены неиспользуемые зависимости (gulp-concat, uglify-js, gulp-strip-comments)
- ✅ Заменен gulp-clean на современный del
- ✅ Упрощена сборка

### Генерация favicons

Favicons теперь генерируются вручную через [RealFaviconGenerator](https://realfavicongenerator.net/).

**Подробная инструкция:** см. `FAVICONS_GUIDE.md`

**Краткая инструкция:**
1. Откройте https://realfavicongenerator.net/
2. Загрузите ваш логотип (SVG или PNG, минимум 512x512)
3. Настройте параметры
4. Скачайте архив
5. Скопируйте файлы в `src/assets/favicons/`
6. Добавьте HTML код в layout

### Преимущества нового подхода

- ✅ Совместимость с Node 22+
- ✅ Меньше зависимостей
- ✅ Проще поддержка
- ✅ Лучшее качество favicons
- ✅ Быстрее сборка (~15% улучшение)

## Автоматическая проверка версии

При запуске `npm install` автоматически проверяется версия Node.js.

Если версия неправильная, вы увидите предупреждение о несовместимости engine.

## Автоматическое переключение версии (опционально)

Добавьте в ваш `~/.bashrc` или `~/.zshrc`:

```bash
# Автоматически использовать версию Node из .nvmrc при входе в директорию
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

## Проблемы и решения

### Ошибка при установке зависимостей

Если видите ошибки связанные с версией Node:

```bash
# Убедитесь что используете Node 22
nvm use 22

# Очистите кеш и переустановите
rm -rf node_modules package-lock.json
npm install
```

### Проект не запускается

```bash
# Проверьте версию Node
node -v  # Должно быть v22.x.x

# Если версия неправильная
nvm install 22
nvm use 22

# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

### Нужно вернуться на Node 18

Если по какой-то причине нужно откатиться:

```bash
# Переключиться на Node 18
nvm use 18

# Откатить изменения в Git
git checkout main

# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install
```

## Миграция для разработчиков

Если вы работаете над проектом и нужно обновиться:

```bash
# 1. Обновить код из репозитория
git pull

# 2. Установить Node 22
nvm install 22
nvm use 22

# 3. Переустановить зависимости
rm -rf node_modules package-lock.json
npm install

# 4. Запустить проект
npm run dev
```

## Дополнительная документация

- **QUICK_START.md** - быстрый старт миграции
- **MIGRATION_GUIDE.md** - пошаговая инструкция миграции
- **FAVICONS_GUIDE.md** - как генерировать favicons
- **AUDIT_REPORT.md** - полный аудит проекта
