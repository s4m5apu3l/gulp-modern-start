import { BaseDropdown } from './BaseDropdown'

export class SimpleDropdown extends BaseDropdown {
    protected handleItemClick(item: Element): void {
        // Снимаем активность со всех элементов
        this.items.forEach(i => i.classList.remove('is-active'))
        item.classList.add('is-active')

        // Обновляем текст кнопки
        this.updateButtonText(item)

        // Закрываем дропдаун
        this.close()

        // Отправляем событие
        const itemText = item.querySelector('span:not(.vacancies__filter-count)')?.textContent?.trim() || item.textContent?.trim() || ''
        const itemValue = item.getAttribute('data-value')

        this.dispatchChangeEvent({
            value: itemValue,
            text: itemText,
            isMultiple: false,
        })
    }

    protected updateButtonText(item: Element): void {
        const currentText = this.btn.querySelector('[data-dropdown-current]')
        const itemText = item.querySelector('span:not(.vacancies__filter-count)')?.textContent?.trim() || item.textContent?.trim() || ''
        const itemValue = item.getAttribute('data-value')

        if (currentText) {
            currentText.textContent = itemText
            if (itemValue) {
                currentText.setAttribute('data-selected-value', itemValue)
            }
        } else {
            const span = this.btn.querySelector('span')
            if (span) {
                span.textContent = itemText
                if (itemValue) {
                    span.setAttribute('data-selected-value', itemValue)
                }
            }
        }
    }
}
