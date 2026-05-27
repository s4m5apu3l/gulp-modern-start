/* eslint-disable @typescript-eslint/no-require-imports */
import { Thumbs, Navigation } from 'swiper/modules'

class CompanyGallerySwiper {
  private mainSwiper: unknown = null
  private thumbsSwiper: unknown = null

  constructor(galleryRoot: HTMLElement) {
    const mainContainer = galleryRoot.querySelector<HTMLElement>('.company__gallery-main')
    const thumbsContainer = galleryRoot.querySelector<HTMLElement>('.company__gallery-thumbs')

    if (!mainContainer || !thumbsContainer) {
      return
    }

    this.createSwipers(mainContainer, thumbsContainer, galleryRoot)
  }

  private createSwipers(mainContainer: HTMLElement, thumbsContainer: HTMLElement, galleryRoot: HTMLElement): void {
    try {
      const { Swiper } = require('swiper')

      type SwiperHost = HTMLElement & { swiper?: { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void } }
      const mainEl = mainContainer as SwiperHost
      const thumbsEl = thumbsContainer as SwiperHost
      if (mainEl.swiper) {
        mainEl.swiper.destroy(true, true)
      }
      if (thumbsEl.swiper) {
        thumbsEl.swiper.destroy(true, true)
      }

      // Поиск кнопок навигации
      const prevButton = galleryRoot.querySelector('.company__gallery-nav-btn--prev') as HTMLElement | null
      const nextButton = galleryRoot.querySelector('.company__gallery-nav-btn--next') as HTMLElement | null

      this.thumbsSwiper = new Swiper(thumbsContainer, {
        spaceBetween: 8,
        slidesPerView: 'auto',
        freeMode: true,
        watchSlidesProgress: true,
      })

      this.mainSwiper = new Swiper(mainContainer, {
        modules: [Thumbs, Navigation],
        spaceBetween: 0,
        navigation: prevButton && nextButton ? {
          prevEl: prevButton,
          nextEl: nextButton,
        } : false,
        thumbs: {
          swiper: this.thumbsSwiper,
        },
      })
    } catch (error) {
      console.error('Ошибка при создании галереи компании:', error)
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

export default CompanyGallerySwiper
