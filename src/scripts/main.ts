import '../../modernizr.js'

import Header from '@/components/Header'
import FilterReset from '@/components/FilterReset'
import { initSwipers, initCompanyGallerySwipersIn } from '@/components/Swiper'
import copyText from '@/components/Clipboard'
import initAccordion from '@/components/Accordion'
import initTabs from '@/components/Tabs'
import initVacanciesFilter from '@/components/VacanciesFilter'
import initCustomDatepicker from '@/components/DateRangePicker'
import CookieConsent from '@/components/CookieConsent'
import Toast from '@/components/Toast'
import AfishaCalendar from '@/components/AfishaCalendar'
import initTextExpand from '@/components/TextExpand'
import ScheduleModal from '@/components/ScheduleModal'
import WeatherCalendar from '@/components/WeatherCalendar'
import FileUpload from '@/components/FileUpload'
import MapSlideover from '@/components/MapSlideover'

declare global {
    interface Window {
        initSwipersUi?: () => void
        initCompanyGallerySwipersIn?: (root: HTMLElement) => void
    }
}

window.initSwipersUi = () => {
    initSwipers()
}

window.initCompanyGallerySwipersIn = (root: HTMLElement) => {
    initCompanyGallerySwipersIn(root)
}

new Header()
new FilterReset()
initSwipers()
copyText()
initAccordion()
initTabs({
    tabButtonsSelector: '.js-tab-btn',
    tabContentsSelector: '.js-tab-content',
})
initVacanciesFilter()
initCustomDatepicker()
new CookieConsent()
new Toast()
new AfishaCalendar()
initTextExpand()
new ScheduleModal()
new WeatherCalendar()
new FileUpload()
new MapSlideover()
