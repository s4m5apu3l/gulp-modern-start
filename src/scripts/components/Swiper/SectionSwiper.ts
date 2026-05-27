/* eslint-disable @typescript-eslint/no-require-imports */
import { Navigation, Pagination, FreeMode } from 'swiper/modules'

type SwiperInstance = {
  destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void
}

class SectionSwiper {
  private swipers: Map<HTMLElement, unknown> = new Map()
  private containers: NodeListOf<HTMLElement>
  private mobileOnlyBindings = new Map<HTMLElement, { mq: MediaQueryList; handler: () => void }>()

  constructor() {
    this.containers = document.querySelectorAll('.js-swiper-section')
    this.init()
  }

  private init(): void {
    if (this.containers.length > 0) {
      this.initSwipers()
    }
  }

  private initSwipers(): void {
    this.containers.forEach(container => {
      this.createSwiper(container)
    })
  }

  private createSwiper(container: HTMLElement): void {
    const mobileOnlyAttr = container.getAttribute('data-swiper-mobile-only')
    const mobileOnly = mobileOnlyAttr === '1' || mobileOnlyAttr === 'true'

    if (mobileOnly) {
      if (this.mobileOnlyBindings.has(container)) {
        return
      }

      const mq = window.matchMedia('(max-width: 1023px)')
      const handler = () => {
        if (mq.matches) {
          if (this.swipers.has(container)) {
            return
          }
          const existingSwiper = (
            container as HTMLElement & { swiper?: SwiperInstance }
          ).swiper
          if (existingSwiper && typeof existingSwiper.destroy === 'function') {
            return
          }
          try {
            const { Swiper } = require('swiper')
            const swiper = new Swiper(container, this.getSwiperOptions(container))
            this.swipers.set(container, swiper)
          } catch (error) {
            console.error('Ошибка при создании свайпера секции:', error)
          }
        } else {
          const swiper = this.swipers.get(container) as SwiperInstance | undefined
          if (swiper && typeof swiper.destroy === 'function') {
            swiper.destroy(true, true)
            this.swipers.delete(container)
          }
        }
      }

      mq.addEventListener('change', handler)
      this.mobileOnlyBindings.set(container, { mq, handler })
      handler()
      return
    }

    // Проверяем, не создан ли уже свайпер для этого контейнера
    if (this.swipers.has(container)) {
      return
    }

    const existingSwiper = (
      container as HTMLElement & { swiper?: SwiperInstance }
    ).swiper
    if (existingSwiper && typeof existingSwiper.destroy === 'function') {
      return
    }

    try {
      const { Swiper } = require('swiper')
      const swiper = new Swiper(container, this.getSwiperOptions(container))
      this.swipers.set(container, swiper)
    } catch (error) {
      console.error('Ошибка при создании свайпера секции:', error)
    }
  }

  private getSwiperOptions(container: HTMLElement) {
    // Универсальный поиск навигации: ищем в ближайшем общем родителе
    // Поддерживаем разные структуры: .swiper-section и .main__section
    const parentSection =
      container.closest('.swiper-section') || container.closest('.main__section') || container.parentElement

    const nav = parentSection?.querySelector('.swiper-section__nav') || null

    const prevButton = nav?.querySelector('.swiper-section__nav-btn--prev') as HTMLElement | null
    const nextButton = nav?.querySelector('.swiper-section__nav-btn--next') as HTMLElement | null

    // Поиск пагинации
    const pagination = container.querySelector('.swiper-pagination') as HTMLElement | null

    const dataSwipes = container.getAttribute('data-swipes')
    const mobileSlides = parseFloat(container.dataset.swipesMobile || '1.2')

    // Проверка на auto режим
    const isAutoMode = dataSwipes === 'auto'

    if (isAutoMode) {
      // Режим auto: slidesPerView: 'auto' + freeMode
      return {
        modules: [Navigation, Pagination, FreeMode],
        slidesPerView: 'auto',
        spaceBetween: 8,
        freeMode: true,
        navigation: prevButton && nextButton ? { prevEl: prevButton, nextEl: nextButton } : false,
        pagination: pagination
          ? {
              el: pagination,
              clickable: true,
            }
          : false,
        // watchOverflow: true,
        // observer: true,
        // observeParents: true,
      }
    }

    // Обычный режим с фиксированным количеством слайдов
    const maxSlides = dataSwipes ? parseInt(dataSwipes, 10) : 5

    return {
      modules: [Navigation, Pagination],
      spaceBetween: 8,
      navigation: prevButton && nextButton ? { prevEl: prevButton, nextEl: nextButton } : false,
      pagination: pagination
        ? {
            el: pagination,
            clickable: true,
          }
        : false,
      breakpoints: {
        320: { slidesPerView: Math.min(mobileSlides, maxSlides) },
        640: { slidesPerView: Math.min(2, maxSlides) },
        768: { slidesPerView: Math.min(3, maxSlides) },
        1024: { slidesPerView: Math.min(4, maxSlides) },
        1280: { slidesPerView: maxSlides },
      },
    }
  }

  public destroy(): void {
    this.mobileOnlyBindings.forEach(({ mq, handler }) => {
      mq.removeEventListener('change', handler)
    })
    this.mobileOnlyBindings.clear()

    // Уничтожаем все свайперы
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.swipers.forEach((swiper: any) => {
      if (swiper) {
        swiper.destroy(true, true)
      }
    })
    this.swipers.clear()
  }

  // public updateAll(): void {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     this.swipers.forEach((swiper: any) => {
  //         if (swiper) {
  //             swiper.update()
  //         }
  //     })
  // }

  public getSwipers(): Map<HTMLElement, unknown> {
    return this.swipers
  }
}

export default SectionSwiper

