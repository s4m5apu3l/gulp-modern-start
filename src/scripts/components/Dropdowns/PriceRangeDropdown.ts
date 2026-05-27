import { BaseDropdown } from './BaseDropdown'

export class PriceRangeDropdown extends BaseDropdown {
    private inputFrom!: HTMLInputElement
    private inputTo!: HTMLInputElement
    private applyBtn!: HTMLButtonElement
    private resetBtn!: HTMLButtonElement

    protected init(): void {
        super.init()
        this.initPriceInputs()
    }

    protected bindItemClicks(): void {
        // Price range не использует items
    }

    private initPriceInputs(): void {
        this.inputFrom = this.dropdown.querySelector('[data-price-from]') as HTMLInputElement
        this.inputTo = this.dropdown.querySelector('[data-price-to]') as HTMLInputElement
        this.applyBtn = this.dropdown.querySelector('[data-price-apply]') as HTMLButtonElement
        this.resetBtn = this.dropdown.querySelector('[data-price-reset]') as HTMLButtonElement

        if (!this.inputFrom || !this.inputTo || !this.applyBtn || !this.resetBtn) {
            return
        }

        this.bindPriceEvents()
    }

    private bindPriceEvents(): void {
        if (!this.inputFrom || !this.inputTo || !this.applyBtn || !this.resetBtn) {
            return
        }

        // Сохраняем ссылки на элементы в замыкании для предотвращения перезаписи
        const inputFrom = this.inputFrom
        const inputTo = this.inputTo
        const dropdown = this.dropdown
        const btn = this.btn

        // Применить фильтр
        this.applyBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation()

            const from = inputFrom.value.trim()
            const to = inputTo.value.trim()

            const currentText = btn.querySelector('[data-dropdown-current]')
            if (!currentText) return

            const defaultText = currentText.getAttribute('data-default-text') || 'Цена'

            if (!from && !to) {
                currentText.textContent = defaultText
                dropdown.classList.remove('has-selection')
                dropdown.classList.remove('is-open')
                return
            }

            let priceText = 'Цена: '
            if (from && to) {
                priceText += `${from} – ${to} ₽`
            } else if (from) {
                priceText += `от ${from} ₽`
            } else if (to) {
                priceText += `до ${to} ₽`
            }

            currentText.textContent = priceText
            dropdown.classList.add('has-selection')
            dropdown.classList.remove('is-open')

            this.dispatchChangeEvent({
                value: null,
                values: [from, to].filter(Boolean),
                text: priceText,
                isMultiple: false,
            })
        })

        // Сбросить фильтр
        this.resetBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation()

            inputFrom.value = ''
            inputTo.value = ''

            const currentText = btn.querySelector('[data-dropdown-current]')
            if (!currentText) return

            const defaultText = currentText.getAttribute('data-default-text') || 'Цена'
            currentText.textContent = defaultText
            dropdown.classList.remove('has-selection')
            dropdown.classList.remove('is-open')

            this.dispatchChangeEvent({
                value: null,
                values: [],
                text: defaultText,
                isMultiple: false,
            })
        })

        // Предотвращаем закрытие при клике на инпуты
        inputFrom.addEventListener('click', (e: Event) => e.stopPropagation())
        inputTo.addEventListener('click', (e: Event) => e.stopPropagation())
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleItemClick(_item: Element): void {
        // Не используется в price range
    }
}
