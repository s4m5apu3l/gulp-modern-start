import { Swiper } from 'swiper'
import Base from '../Base'

export default abstract class BaseSwiper extends Base {
  protected swiper: Swiper | null = null
  protected container: HTMLElement | null = null
  protected swiperSelector: string

  constructor(swiperSelector: string) {
    super()
    this.swiperSelector = swiperSelector
    this.init()
  }

  init(): void {
    this.container = document.querySelector(this.swiperSelector)

    if (this.container) {
      this.createSwiper()
      this.bindEvents()
    }
  }

  protected bindEvents(): void {
    // Переопределяется в дочерних классах при необходимости
  }

  protected updateUI(): void {
    // Переопределяется в дочерних классах при необходимости
  }

  protected createSwiper(): void {
    if (this.container) {
      this.swiper = new Swiper(this.container, this.getSwiperOptions())
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract getSwiperOptions(): any

  public destroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true)
      this.swiper = null
    }
  }

  public getSwiper(): Swiper | null {
    return this.swiper
  }
}
