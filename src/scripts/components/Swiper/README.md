# Swiper Components

Организованная система слайдеров для проекта на основе Swiper.js.

## Структура

```
src/scripts/components/Swiper/
├── BaseSwiper.ts          # Базовый класс для всех слайдеров
├── MainBannerSwiper.ts    # Слайдер главного баннера
├── ProductsSwiper.ts      # Слайдер товаров (пример)
├── index.ts              # Экспорты и инициализация
└── README.md             # Документация
```

## Использование

### Создание нового слайдера

1. Создайте новый файл, например `MySwiper.ts`
2. Наследуйтесь от `BaseSwiper`
3. Реализуйте метод `getSwiperOptions()`

```typescript
import { SwiperOptions } from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'
import BaseSwiper from './BaseSwiper'

class MySwiper extends BaseSwiper {
  constructor() {
    super('.my-swiper') // CSS селектор
  }

  protected getSwiperOptions(): SwiperOptions {
    return {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      spaceBetween: 20,
      // ... другие опции
    }
  }
}

export default MySwiper
```

### Инициализация

1. Добавьте экспорт в `index.ts`
2. Добавьте инициализацию в функцию `initSwipers`
3. Импортируйте и используйте в `main.ts`

```typescript
// В main.ts
import { MySwiper } from '@/components/Swiper'
new MySwiper()
```

### HTML разметка

```pug
.my-swiper.swiper
    .swiper-wrapper
        .swiper-slide Слайд 1
        .swiper-slide Слайд 2
    .swiper-pagination
    .swiper-button-prev
    .swiper-button-next
```

## Доступные методы

- `getSwiper()` - получить экземпляр Swiper
- `destroy()` - уничтожить слайдер
- `bindEvents()` - переопределить для добавления событий

## Стили

Базовые стили находятся в `src/styles/blocks/_swiper.scss`
