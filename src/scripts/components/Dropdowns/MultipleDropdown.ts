import { BaseDropdown } from './BaseDropdown'

export class MultipleDropdown extends BaseDropdown {
    private readonly MAX_TEXT_LENGTH = 32

    protected handleItemClick(item: Element): void {
        const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement

        // Переключаем состояние
        item.classList.toggle('is-active')

        // Синхронизируем чекбокс
        if (checkbox) {
            checkbox.checked = item.classList.contains('is-active')
        }

        // Обновляем текст кнопки
        this.updateButtonText()

        // Отправляем событие
        const selectedValues = Array.from(this.items)
            .filter(i => i.classList.contains('is-active'))
            .map(i => i.getAttribute('data-value'))
            .filter(Boolean) as string[]

        const selectedTexts = Array.from(this.items)
            .filter(i => i.classList.contains('is-active'))
            .map(i => i.querySelector('span:not(.vacancies__filter-count)')?.textContent?.trim() || '')
            .filter(Boolean)

        this.dispatchChangeEvent({
            value: null,
            values: selectedValues,
            text: selectedTexts.join(', '),
            isMultiple: true,
        })

        // НЕ закрываем дропдаун при множественном выборе
    }

    protected updateButtonText(): void {
        const currentText = this.btn.querySelector('[data-dropdown-current]')
        if (!currentText) return

        const defaultText = currentText.getAttribute('data-default-text') || 'Все типы'
        const selectedItems = Array.from(this.items).filter(i => i.classList.contains('is-active'))

        if (selectedItems.length === 0) {
            currentText.textContent = defaultText
            this.dropdown.classList.remove('has-selection')
            return
        }

        // Собираем текст выбранных через запятую
        const texts = selectedItems.map(i => i.querySelector('span:not(.vacancies__filter-count)')?.textContent?.trim() || '')
        const joined = texts.join(', ')

        currentText.textContent = joined.length > this.MAX_TEXT_LENGTH 
            ? joined.slice(0, this.MAX_TEXT_LENGTH).trimEnd() + '...' 
            : joined

        this.dropdown.classList.add('has-selection')
    }
}
