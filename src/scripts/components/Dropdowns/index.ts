import { DropdownFactory } from './DropdownFactory'
import { BaseDropdown } from './BaseDropdown'

// Экспортируем типы для использования в других модулях
export type { DropdownChangeDetail } from './BaseDropdown'

function initDropdowns(): void {
    const dropdowns = document.querySelectorAll('[data-dropdown]')

    if (!dropdowns.length) {
        console.warn('Dropdowns: no dropdowns found')
        return
    }

    // Создаем экземпляры дропдаунов через фабрику
    const instances: BaseDropdown[] = []

    dropdowns.forEach(dropdown => {
        const instance = DropdownFactory.create(dropdown)
        if (instance) {
            instances.push(instance)
        }
    })

    // Закрываем все дропдауны при клике вне их
    document.addEventListener('click', () => {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('is-open')
        })
    })

    // Опционально: можно вернуть instances для управления извне
    // return instances
}

export default initDropdowns
