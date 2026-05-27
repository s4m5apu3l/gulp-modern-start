/* eslint-disable @typescript-eslint/no-require-imports */
import Base from '@/components/Base'

const DAY_NAMES = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]
const MONTHS_AHEAD = 2

interface MonthGroup {
  name: string
  dates: Date[]
}

export default class AfishaCalendar extends Base {
  private container!: HTMLElement
  private swiperEl!: HTMLElement
  private swiperInstance: unknown = null
  private today!: Date
  private rangeStart: Date | null = null
  private rangeEnd: Date | null = null

  private readonly selectors = {
    root: '[data-js-afisha-calendar]',
    prevBtn: '[data-js-calendar-prev]',
    nextBtn: '[data-js-calendar-next]',
  }

  constructor() {
    super()
    this.init()
    this.bindEvents()
  }

  protected init(): void {
    const root = document.querySelector<HTMLElement>(this.selectors.root)
    if (!root) return

    this.container = root
    this.swiperEl = root.querySelector<HTMLElement>('.swiper')!
    this.today = new Date()
    this.today.setHours(0, 0, 0, 0)

    this.render()
    this.initSwiper()
  }

  protected bindEvents(): void {
    if (!this.container) return
    
    // Слушаем событие сброса от FilterReset
    this.container.addEventListener('calendarReset', () => {
      this.reset()
    })
  }

  // ─── Группировка дат по месяцам ──────────────────────────────────────────

  private getMonthGroups(): MonthGroup[] {
    const end = new Date(this.today)
    end.setMonth(end.getMonth() + MONTHS_AHEAD)

    const groups: MonthGroup[] = []
    const cursor = new Date(this.today)

    while (cursor <= end) {
      const monthIndex = cursor.getMonth()
      const year = cursor.getFullYear()
      const key = `${year}-${monthIndex}`

      let group = groups.find(g => g.name === key)
      if (!group) {
        group = { name: key, dates: [] }
        groups.push(group)
      }
      group.dates.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }

    return groups.map(g => {
      const [, monthIdx] = g.name.split('-').map(Number)
      return { name: MONTH_NAMES[monthIdx], dates: g.dates }
    })
  }

  // ─── Рендер ───────────────────────────────────────────────────────────────

  private render(): void {
    const groups = this.getMonthGroups()

    const slides = groups
      .map(group => {
        const days = group.dates
          .map(date => {
            const isPast = date < this.today
            const isToday = this.isSameDay(date, this.today)
            const isWeekend = this.isWeekend(date)

            const classes = [
              'afisha__calendar-day',
              isPast ? 'is-past' : '',
              isToday ? 'is-today' : '',
              isWeekend ? 'is-weekend' : '',
            ]
              .filter(Boolean)
              .join(' ')

            const dateAttr = date.toISOString().split('T')[0]
            const dayName = DAY_NAMES[date.getDay()]
            const dayNum = String(date.getDate()).padStart(2, '0')

            return `<div class="${classes}" data-date="${dateAttr}" data-js-calendar-day>
          <span class="afisha__calendar-day-name">${dayName}</span>
          <span class="afisha__calendar-day-num">${dayNum}</span>
        </div>`
          })
          .join('')

        return `<div class="swiper-slide afisha__calendar-slide">
        <span class="afisha__calendar-month">${group.name}</span>
        <div class="afisha__calendar-days">${days}</div>
      </div>`
      })
      .join('')

    const wrapper = this.swiperEl.querySelector('.swiper-wrapper')!
    wrapper.innerHTML = slides

    // Делегирование кликов
    wrapper.addEventListener('click', (e: Event) => {
      const day = (e.target as HTMLElement).closest<HTMLElement>('[data-js-calendar-day]')
      if (!day || day.classList.contains('is-past')) return

      const clickedDate = new Date(day.getAttribute('data-date')!)
      this.handleDateClick(clickedDate, day)
    })
  }

  // ─── Обработка клика по дате ──────────────────────────────────────────────

  private handleDateClick(date: Date, dayElement: HTMLElement): void {
    // Если нет начала диапазона или уже есть конец - начинаем новый выбор
    if (!this.rangeStart || this.rangeEnd) {
      this.rangeStart = date
      this.rangeEnd = null
      this.updateCalendarView()
      this.dispatchChangeEvent()
      return
    }

    // Если кликнули на ту же дату (одиночный выбор) - снимаем выбор
    if (this.isSameDay(date, this.rangeStart)) {
      this.rangeStart = null
      this.rangeEnd = null
      this.updateCalendarView()
      this.dispatchChangeEvent()
      return
    }

    // Устанавливаем конец диапазона
    if (date < this.rangeStart) {
      // Если выбрали дату раньше начала - меняем местами
      this.rangeEnd = this.rangeStart
      this.rangeStart = date
    } else {
      this.rangeEnd = date
    }

    this.updateCalendarView()
    this.dispatchChangeEvent()
  }

  // ─── Обновление визуального состояния календаря ───────────────────────────

  private updateCalendarView(): void {
    const allDays = this.container.querySelectorAll<HTMLElement>('[data-js-calendar-day]')

    allDays.forEach(day => {
      day.classList.remove('is-active', 'is-range-start', 'is-range-end', 'is-in-range')

      const dayDate = new Date(day.getAttribute('data-date')!)

      if (!this.rangeStart) return

      // Одиночная дата
      if (!this.rangeEnd) {
        if (this.isSameDay(dayDate, this.rangeStart)) {
          day.classList.add('is-active')
        }
        return
      }

      // Диапазон
      if (this.isSameDay(dayDate, this.rangeStart)) {
        day.classList.add('is-active', 'is-range-start')
      } else if (this.isSameDay(dayDate, this.rangeEnd)) {
        day.classList.add('is-active', 'is-range-end')
      } else if (dayDate > this.rangeStart && dayDate < this.rangeEnd) {
        day.classList.add('is-in-range')
      }
    })
  }

  // ─── Отправка события изменения ───────────────────────────────────────────

  private dispatchChangeEvent(): void {
    const detail = {
      startDate: this.rangeStart ? this.rangeStart.toISOString().split('T')[0] : null,
      endDate: this.rangeEnd ? this.rangeEnd.toISOString().split('T')[0] : null,
      isRange: !!this.rangeEnd,
    }

    this.container.dispatchEvent(
      new CustomEvent('calendarDateSelect', {
        bubbles: true,
        detail,
      }),
    )

    // Для совместимости с FilterReset
    document.dispatchEvent(new CustomEvent('afishaCalendarChange', { detail }))
  }

  // ─── Swiper ───────────────────────────────────────────────────────────────

  private initSwiper(): void {
    try {
      const { Swiper } = require('swiper')
      const { Navigation, FreeMode } = require('swiper/modules')

      const prevBtn = this.container.querySelector<HTMLElement>(this.selectors.prevBtn)
      const nextBtn = this.container.querySelector<HTMLElement>(this.selectors.nextBtn)

      this.swiperInstance = new Swiper(this.swiperEl, {
        modules: [Navigation, FreeMode],
        slidesPerView: 'auto',
        freeMode: { enabled: true, sticky: false },
        spaceBetween: 2,
        watchOverflow: true,
        navigation: prevBtn && nextBtn ? { prevEl: prevBtn, nextEl: nextBtn } : false,
      })
    } catch (error) {
      console.error('AfishaCalendar: ошибка инициализации свайпера:', error)
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private isWeekend(date: Date): boolean {
    const d = date.getDay()
    return d === 0 || d === 6
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  // ─── Публичный метод сброса ───────────────────────────────────────────────

  public reset(): void {
    this.rangeStart = null
    this.rangeEnd = null
    this.updateCalendarView()
  }

  public destroy(): void {
    if (this.swiperInstance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this.swiperInstance as any).destroy(true, true)
      this.swiperInstance = null
    }
  }
}
