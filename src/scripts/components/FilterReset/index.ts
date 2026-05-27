import Base from '@/components/Base'

export default class FilterReset extends Base {
  private resetButtons!: NodeListOf<HTMLButtonElement>
  private filterContainers!: NodeListOf<HTMLElement>

  constructor() {
    super()
    this.init()
    this.bindEvents()
  }

  protected init(): void {
    this.resetButtons = document.querySelectorAll('[data-filter-reset]')
    this.filterContainers = document.querySelectorAll('[data-filter-container]')

    if (!this.resetButtons.length || !this.filterContainers.length) {
      return
    }

    // Проверяем начальное состояние
    this.checkFilters()
  }

  protected bindEvents(): void {
    // Клик на кнопку сброса
    this.resetButtons.forEach(btn => {
      btn.addEventListener('click', () => this.resetAllFilters())
    })

    // Слушаем события изменения фильтров
    document.addEventListener('dropdownChange', () => this.checkFilters())
    
    // Слушаем изменения чекбоксов
    document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-filter-container]')) {
        this.checkFilters()
      }
    })

    // Слушаем изменения календаря
    document.addEventListener('afishaCalendarChange', () => this.checkFilters())

    // Слушаем изменения датапикера
    this.filterContainers.forEach(container => {
      const datepickerInputs = container.querySelectorAll('.datepicker-range')
      datepickerInputs.forEach(input => {
        input.addEventListener('change', () => this.checkFilters())
      })
    })
  }

  private checkFilters(): void {
    let hasActiveFilters = false

    this.filterContainers.forEach(container => {
      // Проверяем дропдауны с выбранными значениями
      const activeDropdowns = container.querySelectorAll('.news__filter.has-selection')
      if (activeDropdowns.length > 0) {
        hasActiveFilters = true
      }

      // Проверяем отмеченные чекбоксы
      const checkedCheckboxes = container.querySelectorAll('input[type="checkbox"]:checked')
      if (checkedCheckboxes.length > 0) {
        hasActiveFilters = true
      }

      // Проверяем активные элементы календаря (одиночные или диапазон)
      const activeCalendarDays = container.querySelectorAll(
        '.afisha__calendar-day.is-active, .afisha__calendar-day.is-in-range',
      )
      if (activeCalendarDays.length > 0) {
        hasActiveFilters = true
      }

      // Проверяем датапикер
      const datepickerInputs = container.querySelectorAll('.datepicker-range')
      datepickerInputs.forEach(input => {
        const inputElement = input as HTMLInputElement
        if (inputElement.value && inputElement.value.trim() !== '') {
          hasActiveFilters = true
        }
      })
    })

    // Показываем/скрываем кнопки сброса
    this.resetButtons.forEach(btn => {
      if (hasActiveFilters) {
        btn.style.display = 'flex'
        btn.classList.add('is-visible')
      } else {
        btn.style.display = 'none'
        btn.classList.remove('is-visible')
      }
    })
  }

  private resetAllFilters(): void {
    this.filterContainers.forEach(container => {
      // Сбрасываем дропдауны
      const dropdowns = container.querySelectorAll('[data-dropdown]')
      dropdowns.forEach(dropdown => {
        // Убираем has-selection
        dropdown.classList.remove('has-selection')

        // Сбрасываем текст кнопки
        const btn = dropdown.querySelector('[data-dropdown-btn]')
        const currentText = btn?.querySelector('[data-dropdown-current]')
        if (currentText) {
          const defaultText = currentText.getAttribute('data-default-text')
          if (defaultText) {
            currentText.textContent = defaultText
          }
        }

        // Снимаем выбор с элементов
        const items = dropdown.querySelectorAll('[data-dropdown-item]')
        items.forEach(item => {
          item.classList.remove('is-active')
          const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement
          if (checkbox) {
            checkbox.checked = false
          }
        })

        // Сбрасываем price range
        if (dropdown.hasAttribute('data-dropdown-price')) {
          const inputFrom = dropdown.querySelector('[data-price-from]') as HTMLInputElement
          const inputTo = dropdown.querySelector('[data-price-to]') as HTMLInputElement
          if (inputFrom) inputFrom.value = ''
          if (inputTo) inputTo.value = ''
        }
      })

      // Сбрасываем чекбоксы вне дропдаунов
      const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked')
      checkboxes.forEach(checkbox => {
        ;(checkbox as HTMLInputElement).checked = false
      })

      // Сбрасываем календарь (все классы диапазона)
      const calendarDays = container.querySelectorAll(
        '.afisha__calendar-day.is-active, .afisha__calendar-day.is-range-start, .afisha__calendar-day.is-range-end, .afisha__calendar-day.is-in-range',
      )
      calendarDays.forEach(day => {
        day.classList.remove('is-active', 'is-range-start', 'is-range-end', 'is-in-range')
      })

      // Сбрасываем внутреннее состояние календаря
      const calendarRoot = container.querySelector('[data-js-afisha-calendar]')
      if (calendarRoot) {
        const resetEvent = new CustomEvent('calendarReset')
        calendarRoot.dispatchEvent(resetEvent)
      }

      // Сбрасываем датапикер
      const datepickerInputs = container.querySelectorAll('.datepicker-range')
      datepickerInputs.forEach(input => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const $input = (window as any).$(input)
        
        // Пробуем разные методы сброса
        try {
          // Метод 1: clearRange из API плагина
          if ($input.daterangepicker && typeof $input.daterangepicker === 'function') {
            $input.daterangepicker('clearRange')
          }
          
          // Метод 2: Прямой доступ к data
          const picker = $input.data('daterangepicker')
          if (picker && picker.clearRange) {
            picker.clearRange()
          }
          
          // Метод 3: Очищаем input напрямую
          ;(input as HTMLInputElement).value = ''
          
          // Метод 4: Триггерим событие change
          $input.trigger('change')
        } catch (e) {
          console.warn('DatePicker reset error:', e)
          // Fallback: просто очищаем input
          ;(input as HTMLInputElement).value = ''
        }
      })
    })

    // Проверяем состояние после сброса
    this.checkFilters()

    // Отправляем событие о сбросе фильтров
    const event = new CustomEvent('filtersReset')
    document.dispatchEvent(event)
  }
}
