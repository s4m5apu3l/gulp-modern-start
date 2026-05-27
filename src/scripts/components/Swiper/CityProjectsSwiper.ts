/* eslint-disable @typescript-eslint/no-require-imports */
import { Thumbs, Navigation, Pagination } from 'swiper/modules'

class CityProjectsSwiper {
  private mainSwiper: unknown = null
  private thumbsSwiper: unknown = null

  constructor() {
    this.init()
  }

  private init(): void {
    const mainContainer = document.querySelector('.js-city-projects-main')
    const thumbsContainer = document.querySelector('.js-city-projects-thumbs')

    if (!mainContainer || !thumbsContainer) {
      console.error('CityProjectsSwiper: контейнеры не найдены')
      return
    }

    this.createSwipers(mainContainer as HTMLElement, thumbsContainer as HTMLElement)
  }

  private createSwipers(mainContainer: HTMLElement, thumbsContainer: HTMLElement): void {
    try {
      const { Swiper } = require('swiper')
      const section = mainContainer.closest('.main__section')
      const prevButton = section?.querySelector('.swiper-section__nav-btn--prev')
      const nextButton = section?.querySelector('.swiper-section__nav-btn--next')
      const pagination = mainContainer.querySelector('.main__projects-pagination')

      this.thumbsSwiper = new Swiper(thumbsContainer, {
        spaceBetween: 0,
        slidesPerView: 'auto',
        freeMode: false,
        watchSlidesProgress: false,
      })

      this.mainSwiper = new Swiper(mainContainer, {
        modules: [Thumbs, Navigation, Pagination],
        spaceBetween: 0,
        thumbs: {
          swiper: this.thumbsSwiper,
        },
        navigation: {
          nextEl: nextButton,
          prevEl: prevButton,
        },
        pagination: {
          el: pagination,
          clickable: false,
          bulletClass: 'main__projects-pagination-bullet',
          bulletActiveClass: 'main__projects-pagination-bullet--active',
        },
      })
    } catch (error) {
      console.error('Ошибка при создании свайпера проектов города:', error)
    }
  }

  public destroy(): void {
    if (this.mainSwiper) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this.mainSwiper as any).destroy(true, true)
    }
    if (this.thumbsSwiper) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this.thumbsSwiper as any).destroy(true, true)
    }
  }
}

export default CityProjectsSwiper
