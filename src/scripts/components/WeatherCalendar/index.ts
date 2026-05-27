import Base from '@/components/Base'

interface MonthData {
    name: string
    index: number
    year: number
    days: number
}

export default class WeatherCalendar extends Base {
    private rootElement!: HTMLElement
    private monthTabsContainer!: HTMLElement
    private monthContents!: NodeListOf<HTMLElement>
    private currentMonthIndex = 0
    private months: MonthData[] = []

    private readonly selectors = {
        root: '[data-js-weather-calendar]',
        monthTabsContainer: '.weather__month-tabs',
        monthContent: '.weather__month-content',
        calendarGrid: '[data-js-calendar-grid]',
    }

    private readonly monthNames = [
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

    constructor() {
        super()
        this.init()
        this.bindEvents()
    }

    protected init(): void {
        this.rootElement = document.querySelector(this.selectors.root) as HTMLElement

        if (!this.rootElement) {
            return
        }

        this.monthTabsContainer = this.rootElement.querySelector(this.selectors.monthTabsContainer) as HTMLElement
        this.monthContents = this.rootElement.querySelectorAll(this.selectors.monthContent)

        if (!this.monthTabsContainer) {
            console.error('WeatherCalendar: month tabs container not found')
            return
        }

        this.generateMonths()
        this.createMonthTabs()
        this.initializeMonth(0)
    }

    protected bindEvents(): void {}

    private generateMonths(): void {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()

        for (let i = 0; i < 12; i++) {
            const monthIndex = (currentMonth + i) % 12
            const year = currentYear + Math.floor((currentMonth + i) / 12)
            const days = this.getDaysInMonth(monthIndex, year)

            this.months.push({
                name: this.monthNames[monthIndex],
                index: monthIndex,
                year: year,
                days: days,
            })
        }
    }

    private getDaysInMonth(month: number, year: number): number {
        return new Date(year, month + 1, 0).getDate()
    }

    private createMonthTabs(): void {
        const swiperWrapper = this.monthTabsContainer.querySelector('.swiper-wrapper')

        if (!swiperWrapper) {
            console.error('WeatherCalendar: swiper-wrapper not found')
            return
        }

        swiperWrapper.innerHTML = ''

        this.months.forEach((month, index) => {
            const slide = document.createElement('div')
            slide.className = 'swiper-slide'

            const button = document.createElement('button')
            button.className = 'weather__month-tab'
            button.type = 'button'
            button.textContent = month.name
            button.setAttribute('data-month-index', index.toString())

            if (index === 0) {
                button.classList.add('is-active')
            }

            button.addEventListener('click', () => {
                this.switchMonth(index)
            })

            slide.appendChild(button)
            swiperWrapper.appendChild(slide)
        })
    }

    private switchMonth(monthIndex: number): void {
        if (monthIndex === this.currentMonthIndex) return

        const oldButton = this.monthTabsContainer.querySelector(`[data-month-index="${this.currentMonthIndex}"]`)
        oldButton?.classList.remove('is-active')
        this.monthContents[this.currentMonthIndex]?.classList.remove('is-active')

        const newButton = this.monthTabsContainer.querySelector(`[data-month-index="${monthIndex}"]`)
        newButton?.classList.add('is-active')
        this.monthContents[monthIndex]?.classList.add('is-active')

        this.initializeMonth(monthIndex)
        this.currentMonthIndex = monthIndex
    }

    private initializeMonth(monthIndex: number): void {
        const monthContent = this.monthContents[monthIndex]
        if (!monthContent) return

        const calendarGrid = monthContent.querySelector(this.selectors.calendarGrid) as HTMLElement
        if (!calendarGrid) return

        this.resetCalendarGrid(calendarGrid)

        const monthData = this.months[monthIndex]
        const firstDay = new Date(monthData.year, monthData.index, 1).getDay()
        const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1

        for (let i = 0; i < firstDayAdjusted; i++) {
            const emptyCell = document.createElement('div')
            emptyCell.className = 'weather__calendar-cell is-empty'
            calendarGrid.insertBefore(emptyCell, calendarGrid.firstChild)
        }

        const dayCells = calendarGrid.querySelectorAll('.weather__calendar-cell:not(.is-empty)')
        dayCells.forEach((cell, index) => {
            const dayOfWeek = (firstDayAdjusted + index) % 7
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6

            if (isWeekend) {
                cell.classList.add('is-weekend')
            }
        })
    }

    private resetCalendarGrid(calendarGrid: HTMLElement): void {
        const emptyCells = calendarGrid.querySelectorAll('.is-empty')
        emptyCells.forEach(cell => cell.remove())

        const cells = calendarGrid.querySelectorAll('.weather__calendar-cell')
        cells.forEach(cell => {
            cell.classList.remove('is-weekend')
        })
    }
}
