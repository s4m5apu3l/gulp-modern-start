import { BaseDropdown } from './BaseDropdown'
import { SimpleDropdown } from './SimpleDropdown'
import { MultipleDropdown } from './MultipleDropdown'
import { PriceRangeDropdown } from './PriceRangeDropdown'
import { LanguageDropdown } from './LanguageDropdown'

export class DropdownFactory {
    static create(dropdown: Element): BaseDropdown | null {
        // Проверяем тип дропдауна по атрибутам и классам
        if (dropdown.hasAttribute('data-dropdown-multiple')) {
            return new MultipleDropdown(dropdown)
        }

        if (dropdown.hasAttribute('data-dropdown-price')) {
            return new PriceRangeDropdown(dropdown)
        }

        if (dropdown.classList.contains('language-dropdown')) {
            return new LanguageDropdown(dropdown)
        }

        // По умолчанию — простой дропдаун
        return new SimpleDropdown(dropdown)
    }
}
