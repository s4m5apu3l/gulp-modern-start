import { BaseDropdown } from './BaseDropdown'

export class LanguageDropdown extends BaseDropdown {
    protected handleItemClick(item: Element): void {
        // Снимаем активность со всех элементов
        this.items.forEach(i => i.classList.remove('is-active'))
        item.classList.add('is-active')

        // Обновляем флаг и текст
        this.updateLanguageButton(item)

        // Закрываем дропдаун
        this.close()

        // Отправляем событие
        const itemValue = item.getAttribute('data-value')
        const itemText = item.querySelector('span')?.textContent || ''

        this.dispatchChangeEvent({
            value: itemValue,
            text: itemText,
            isLanguageChange: true,
            isMultiple: false,
        })
    }

    protected updateLanguageButton(item: Element): void {
        const currentLang = this.btn.querySelector('[data-dropdown-current]')
        const selectedFlag = item.querySelector('.header__lang-flag')
        const selectedText = item.querySelector('span')?.textContent || ''
        const currentFlag = this.btn.querySelector('.header__lang-flag')

        // Обновляем флаг
        if (currentFlag && selectedFlag) {
            currentFlag.className = selectedFlag.className
        }

        // Обновляем текст
        if (currentLang) {
            currentLang.textContent = selectedText
        }
    }
}
