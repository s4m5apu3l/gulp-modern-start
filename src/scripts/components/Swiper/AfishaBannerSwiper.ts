/* eslint-disable @typescript-eslint/no-require-imports */
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

class AfishaBannerSwiper {
  private swiper: unknown = null

  constructor() {
    this.init()
  }

  private init(): void {
    const container = document.querySelector<HTMLElement>('.js-swiper-afisha-banner')

    if (!container) {
      console.error('AfishaBannerSwiper: container not found')
      return
    }

    try {
      const { Swiper } = require('swiper')

      const prevButton = container.querySelector<HTMLElement>('.company__gallery-nav-btn--prev')
      const nextButton = container.querySelector<HTMLElement>('.company__gallery-nav-btn--next')
      const pagination = container.querySelector<HTMLElement>('.swiper-pagination')

      this.swiper = new Swiper(container, {
        modules: [Navigation, Pagination, Autoplay],
        spaceBetween: 16,
        slidesPerView: 1,
        autoplay: { delay: 6000, disableOnInteraction: false },
        navigation: prevButton && nextButton ? { prevEl: prevButton, nextEl: nextButton } : false,
        pagination: pagination ? { el: pagination, clickable: true } : false,
      })
    } catch (error) {
      console.error('AfishaBannerSwiper: ошибка при создании свайпера:', error)
    }
  }

  public destroy(): void {
    if (this.swiper) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this.swiper as any).destroy(true, true)
      this.swiper = null
    }
  }
}

export default AfishaBannerSwiper
