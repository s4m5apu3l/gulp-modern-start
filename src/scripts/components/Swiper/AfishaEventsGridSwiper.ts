/* eslint-disable @typescript-eslint/no-require-imports */
import { Navigation } from 'swiper/modules'

class AfishaEventsGridSwiper {
    private swiper: unknown = null

    constructor() {
        this.init()
    }

    private init(): void {
        const container = document.querySelector<HTMLElement>('.js-swiper-afisha-events-grid')

        if (!container) {
            return
        }

        const section = container.closest('.main__section')
        const prevButton = section?.querySelector<HTMLElement>('.swiper-section__nav-btn--prev') ?? null
        const nextButton = section?.querySelector<HTMLElement>('.swiper-section__nav-btn--next') ?? null

        try {
            const { Swiper } = require('swiper')

            this.swiper = new Swiper(container, {
                modules: [Navigation],
                slidesPerView: 'auto',
                spaceBetween: 0,
                navigation: prevButton && nextButton ? { prevEl: prevButton, nextEl: nextButton } : false,
                watchOverflow: true,
                observer: true,
                observeParents: true,
            })
        } catch (error) {
            console.error('AfishaEventsGridSwiper: ошибка при создании свайпера:', error)
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

export default AfishaEventsGridSwiper
