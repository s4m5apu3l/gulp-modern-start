import MainBannerSwiper from './MainBannerSwiper'
import SectionSwiper from './SectionSwiper'
import NewsTabsSwiper from './NewsTabsSwiper'
import CompanyGallerySwiper from './CompanyGallerySwiper'
import CityProjectsSwiper from './CityProjectsSwiper'
import AfishaBannerSwiper from './AfishaBannerSwiper'
import AfishaEventsGridSwiper from './AfishaEventsGridSwiper'

/** Инициализация галерей компании внутри контейнера (например, попап карты организаций). */
export function initCompanyGallerySwipersIn(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>('.company__gallery').forEach((gallery) => {
    new CompanyGallerySwiper(gallery)
  })
}

export const initSwipers = () => {
  if (document.querySelector('.swiper-main-banner')) {
    new MainBannerSwiper()
  }
  if (document.querySelector('.js-swiper-section')) {
    new SectionSwiper()
  }
  const tabsSwipers = document.querySelectorAll<HTMLElement>('.js-swiper-tabs')
  if (tabsSwipers.length > 0) {
    tabsSwipers.forEach(container => new NewsTabsSwiper(container))
  }
  if (document.querySelector('.company__gallery')) {
    initCompanyGallerySwipersIn(document)
  }
  if (document.querySelector('.js-city-projects-main')) {
    new CityProjectsSwiper()
  }
  if (document.querySelector('.js-swiper-afisha-banner')) {
    new AfishaBannerSwiper()
  }
  if (document.querySelector('.js-swiper-afisha-events-grid')) {
    new AfishaEventsGridSwiper()
  }
}
