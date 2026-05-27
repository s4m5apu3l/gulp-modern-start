/* eslint-disable @typescript-eslint/no-require-imports */
import { Navigation } from 'swiper/modules'

class NewsTabsSwiper {
  private swiper: unknown = null
  private container: HTMLElement | null

  constructor(container: HTMLElement) {
    this.container = container
    this.init()
  }

  private init(): void {
    if (this.container) {
      this.createSwiper()
    }
  }

  private createSwiper(): void {
    if (!this.container) return

    try {
      const { Swiper } = require('swiper')
      const existingSwiper = (
        this.container as HTMLElement & {
          swiper?: { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void }
        }
      ).swiper
      if (existingSwiper) {
        existingSwiper.destroy(true, true)
      }
      this.swiper = new Swiper(this.container, this.getSwiperOptions())
      this.updateNavigationVisibility()
    } catch (error) {
      console.error('Ошибка при создании свайпера табов:', error)
    }
  }

  private getNavigationButtons(): { prevButton: HTMLElement | null; nextButton: HTMLElement | null } {
    const wrapper = this.container?.closest('.news__tabs-wrapper')
    return {
      prevButton: wrapper?.querySelector<HTMLElement>('.news__tabs-nav--prev') ?? null,
      nextButton: wrapper?.querySelector<HTMLElement>('.news__tabs-nav--next') ?? null,
    }
  }

  private updateNavigationVisibility(): void {
    if (!this.container) return

    const { prevButton, nextButton } = this.getNavigationButtons()
    if (!prevButton || !nextButton) return

    const swiperWrapper = this.container.querySelector<HTMLElement>('.swiper-wrapper')
    if (!swiperWrapper) return

    const hasOverflow = swiperWrapper.scrollWidth > this.container.clientWidth + 1

    prevButton.classList.toggle('swiper-button-disabled', !hasOverflow)
    nextButton.classList.toggle('swiper-button-disabled', !hasOverflow)
    prevButton.style.display = hasOverflow ? '' : 'none'
    nextButton.style.display = hasOverflow ? '' : 'none'
  }

  private getSwiperOptions() {
    const { prevButton, nextButton } = this.getNavigationButtons()

    return {
      modules: [Navigation],
      slidesPerView: 'auto',
      spaceBetween: 0,
      watchOverflow: true,
      observer: true,
      observeParents: true,
      on: {
        init: () => this.updateNavigationVisibility(),
        resize: () => this.updateNavigationVisibility(),
        update: () => this.updateNavigationVisibility(),
      },
      navigation:
        prevButton && nextButton
          ? {
              prevEl: prevButton,
              nextEl: nextButton,
            }
          : false,
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

export default NewsTabsSwiper
