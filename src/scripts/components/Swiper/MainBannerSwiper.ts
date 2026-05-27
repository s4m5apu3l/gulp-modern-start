// import { SwiperOptions } from 'swiper'
import { Navigation, Autoplay, Controller, EffectCards, Pagination } from 'swiper/modules'
import Swiper from 'swiper'
import BaseSwiper from './BaseSwiper'

class MainBannerSwiper extends BaseSwiper {
  private contentSwiper: Swiper | null = null

  constructor() {
    super('.swiper-main-banner')
  }

  protected getSwiperOptions() {
    const root =
      (this.container?.closest('.main__banner-inner') as HTMLElement | null) ??
      (this.container?.closest('.main__banner') as HTMLElement | null)

    const nextEl = root?.querySelector<HTMLElement>('.main__banner-nav-btn--next') ?? null
    const prevEl = root?.querySelector<HTMLElement>('.main__banner-nav-btn--prev') ?? null
    const paginationEl = root?.querySelector<HTMLElement>('.main__banner-pagination') ?? null

    return {
      modules: [Navigation, Autoplay, Controller, EffectCards, Pagination],
      effect: 'cards',
      grabCursor: true,
      cardsEffect: {
        perSlideOffset: 10,
        perSlideRotate: 3,
        rotate: false,
        slideShadows: false,
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      navigation: nextEl && prevEl ? { nextEl, prevEl } : false,
      pagination: paginationEl
        ? {
            el: paginationEl,
            bulletClass: 'main__banner-pagination-bullet',
            bulletActiveClass: 'main__banner-pagination-bullet--active',
          }
        : false,
    }
  }

  protected bindEvents(): void {
    if (this.container) {
      this.container.addEventListener('mouseenter', this.pauseAutoplay.bind(this))
      this.container.addEventListener('mouseleave', this.resumeAutoplay.bind(this))
    }

    // Инициализируем контент свайпер после основного
    this.initContentSwiper()
  }

  private initContentSwiper(): void {
    const root =
      (this.container?.closest('.main__banner-inner') as HTMLElement | null) ??
      (this.container?.closest('.main__banner') as HTMLElement | null)
    const contentContainer = root?.querySelector('.swiper-main-banner-content') ?? null

    if (!contentContainer || !this.swiper) {
      console.error('Content swiper container not found or main swiper not initialized')
      return
    }

    this.contentSwiper = new Swiper(contentContainer as unknown as HTMLElement, {
      modules: [Controller],
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: false,
      speed: 300,
      roundLengths: true,
      watchOverflow: true,
    })

    // Связываем свайперы через controller
    if (this.swiper && this.contentSwiper) {
      this.swiper.controller.control = this.contentSwiper
      this.contentSwiper.controller.control = this.swiper
    }
  }

  private pauseAutoplay(): void {
    if (this.swiper && this.swiper.autoplay) {
      this.swiper.autoplay.stop()
    }
  }

  private resumeAutoplay(): void {
    if (this.swiper && this.swiper.autoplay) {
      this.swiper.autoplay.start()
    }
  }

  public destroy(): void {
    if (this.contentSwiper) {
      this.contentSwiper.destroy(true, true)
      this.contentSwiper = null
    }
    super.destroy()
  }
}

export default MainBannerSwiper
