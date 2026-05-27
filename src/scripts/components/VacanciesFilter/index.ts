// Флаг для предотвращения повторной инициализации делегирования
let isDelegationInitialized = false

export default function initVacanciesFilter() {
  // Инициализируем делегирование событий только один раз
  if (!isDelegationInitialized) {
    initEventDelegation()
    isDelegationInitialized = true
  }

  // Эти функции можно вызывать после каждого AJAX
  initFilterSectionsToggle()
  initFilterItemsToggle()
  initMobileFilters()
}

// Делегирование событий - работает даже после AJAX
function initEventDelegation() {
  const body = document.body

  // Делегирование для кнопки "Все фильтры"
  body.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('vacancies__filter-show-all')) {
      const filterContainer = target.closest('.vacancies__filter')
      if (!filterContainer) return

      const filterSections = filterContainer.querySelectorAll('.vacancies__filter-section')
      filterSections.forEach((section, index) => {
        if (index >= 3) {
          ;(section as HTMLElement).style.display = 'flex'
        }
      })
      target.remove()
    }
  })

  // Делегирование для кнопки "Выбрать ещё"
  body.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('vacancies__filter-more')) {
      const section = target.closest('.vacancies__filter-section')
      if (!section) return

      const filterList = section.querySelector('.vacancies__filter-list')
      if (!filterList) return

      const filterItems = filterList.querySelectorAll('.vacancies__filter-checkbox, .vacancies__filter-radio')
      const isExpanded = target.classList.contains('is-expanded')

      filterItems.forEach((item, index) => {
        if (index >= 4) {
          ;(item as HTMLElement).style.display = isExpanded ? 'none' : 'flex'
        }
      })

      target.classList.toggle('is-expanded')
      target.textContent = isExpanded ? 'Выбрать ещё' : 'Скрыть'
    }
  })

  // Делегирование для кнопки "Сбросить всё"
  body.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('vacancies__filter-reset-all')) {
      resetAllFilters()
    }
  })

  // Делегирование для кнопки открытия фильтров (мобильная)
  body.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('vacancies__filter-toggle') || target.closest('.vacancies__filter-toggle')) {
      toggleMobileFilters()
    }
  })

  // Делегирование для кнопки закрытия фильтров (мобильная)
  body.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('vacancies__filter-close') || target.closest('.vacancies__filter-close')) {
      closeMobileFilters()
    }
  })

  // Делегирование для overlay
  body.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('vacancies__overlay')) {
      closeMobileFilters()
    }
  })
}

// Логика раскрытия секций фильтров (показать первые 3)
function initFilterSectionsToggle() {
  const filterContainer = document.querySelector('.vacancies__filter')
  if (!filterContainer) return

  // Удаляем старую кнопку если есть
  const oldBtn = filterContainer.querySelector('.vacancies__filter-show-all')
  if (oldBtn) oldBtn.remove()

  const filterSections = filterContainer.querySelectorAll('.vacancies__filter-section')
  if (filterSections.length <= 3) return

  // Скрываем секции после 3-й
  filterSections.forEach((section, index) => {
    if (index >= 3) {
      ;(section as HTMLElement).style.display = 'none'
    }
  })

  // Создаем кнопку "Все фильтры"
  const showAllBtn = document.createElement('button')
  showAllBtn.className = 'vacancies__filter-show-all'
  showAllBtn.type = 'button'
  showAllBtn.textContent = 'Все фильтры'

  // Вставляем кнопку после 3-й секции
  const thirdSection = filterSections[2]
  thirdSection.after(showAllBtn)
}

// Логика раскрытия элементов внутри секций (показать первые 4)
function initFilterItemsToggle() {
  const filterSections = document.querySelectorAll('.vacancies__filter-section')
  if (!filterSections.length) return

  filterSections.forEach(section => {
    const filterList = section.querySelector('.vacancies__filter-list')
    if (!filterList) return

    const filterItems = filterList.querySelectorAll('.vacancies__filter-checkbox, .vacancies__filter-radio')

    // Если элементов 4 или меньше - ничего не делаем
    if (filterItems.length <= 4) return

    // Удаляем старую кнопку если есть
    const oldBtn = section.querySelector('.vacancies__filter-more')
    if (oldBtn) oldBtn.remove()

    // Создаем кнопку через JS
    const filterMoreBtn = document.createElement('button')
    filterMoreBtn.className = 'vacancies__filter-more'
    filterMoreBtn.type = 'button'
    filterMoreBtn.textContent = 'Выбрать ещё'

    // Вставляем кнопку после списка
    section.appendChild(filterMoreBtn)

    // Скрываем элементы после 4-го
    filterItems.forEach((item, index) => {
      if (index >= 4) {
        ;(item as HTMLElement).style.display = 'none'
      }
    })
  })
}

// Функция сброса всех фильтров
function resetAllFilters() {
  // Сбрасываем все чекбоксы
  const checkboxes = document.querySelectorAll('.vacancies__filter input[type="checkbox"]')
  checkboxes.forEach(checkbox => {
    ;(checkbox as HTMLInputElement).checked = false
  })

  // Сбрасываем все радио
  const radios = document.querySelectorAll('.vacancies__filter input[type="radio"]')
  radios.forEach(radio => {
    ;(radio as HTMLInputElement).checked = false
  })

  // Сбрасываем текстовые поля
  const inputs = document.querySelectorAll('.vacancies__filter-input')
  inputs.forEach(input => {
    ;(input as HTMLInputElement).value = ''
  })

  // Сбрасываем дропдауны
  const dropdowns = document.querySelectorAll('.vacancies__filter [data-dropdown]')
  dropdowns.forEach(dropdown => {
    const currentText = dropdown.querySelector('[data-dropdown-current]')
    const items = dropdown.querySelectorAll('[data-dropdown-item]')

    items.forEach(item => item.classList.remove('is-active'))

    if (currentText) {
      currentText.textContent = 'Выберите из списка'
      currentText.removeAttribute('data-selected-value')
    }
  })
}

// Функция для получения данных фильтров (для отправки на бэкенд)
// export function getVacanciesFilterData() {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const filterData: Record<string, any> = {}

//     // Получаем значения из текстовых полей
//     const excludeWords = document.querySelector(
//         '.vacancies__filter-input[placeholder*="Исключить"]',
//     ) as HTMLInputElement
//     if (excludeWords?.value) {
//         filterData.excludeWords = excludeWords.value
//     }

//     const salaryFrom = document.querySelector('.vacancies__filter-input[type="number"]') as HTMLInputElement
//     if (salaryFrom?.value) {
//         filterData.salaryFrom = salaryFrom.value
//     }

//     // Получаем значения из дропдаунов (через data-selected-value)
//     const dropdownCurrents = document.querySelectorAll('.vacancies__filter [data-dropdown-current]')
//     dropdownCurrents.forEach(current => {
//         const value = current.getAttribute('data-selected-value')
//         const label = current
//             .closest('.vacancies__filter-section')
//             ?.querySelector('.vacancies__filter-label')
//             ?.textContent?.trim()

//         if (label && value) {
//             const key = label.toLowerCase().replace(/\s+/g, '_')
//             filterData[key] = value
//         }
//     })

//     // Получаем отмеченные чекбоксы
//     const checkboxes = document.querySelectorAll('.vacancies__filter-checkbox input:checked')
//     const checkedValues: string[] = []
//     checkboxes.forEach(checkbox => {
//         const label = checkbox.parentElement?.querySelector('span:not(.vacancies__filter-count)')?.textContent?.trim()
//         if (label) {
//             checkedValues.push(label)
//         }
//     })
//     if (checkedValues.length) {
//         filterData.checkboxFilters = checkedValues
//     }

//     // Получаем выбранные радио
//     const radios = document.querySelectorAll('.vacancies__filter-radio input:checked')
//     radios.forEach(radio => {
//         const name = (radio as HTMLInputElement).name
//         const label = radio.parentElement?.querySelector('span:not(.vacancies__filter-count)')?.textContent?.trim()
//         if (name && label) {
//             filterData[name] = label
//         }
//     })

//     return filterData
// }

// Функция для реинициализации после AJAX
// Вызывайте её после обновления контента
export function reinitVacanciesFilter() {
  initFilterSectionsToggle()
  initFilterItemsToggle()
}

// Мобильная логика фильтров
function initMobileFilters() {
  // Создаем overlay если его нет
  if (!document.querySelector('.vacancies__overlay')) {
    const overlay = document.createElement('div')
    overlay.className = 'vacancies__overlay'
    document.body.appendChild(overlay)
  }
}

function toggleMobileFilters() {
  const aside = document.querySelector('.vacancies__aside')
  const overlay = document.querySelector('.vacancies__overlay')

  if (aside && overlay) {
    aside.classList.toggle('is-open')
    overlay.classList.toggle('is-active')

    // Блокируем скролл body
    if (aside.classList.contains('is-open')) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
}

function closeMobileFilters() {
  const aside = document.querySelector('.vacancies__aside')
  const overlay = document.querySelector('.vacancies__overlay')

  if (aside && overlay) {
    aside.classList.remove('is-open')
    overlay.classList.remove('is-active')
    document.body.style.overflow = ''
  }
}
