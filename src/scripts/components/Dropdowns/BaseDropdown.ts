export interface DropdownChangeDetail {
    dropdown: Element
    value: string | null
    values?: string[]
    text: string
    isLanguageChange: boolean
    isMultiple: boolean
}

export abstract class BaseDropdown {
    protected dropdown: Element
    protected btn: Element
    protected items: NodeListOf<Element>
    protected menu: HTMLElement | null

    constructor(dropdown: Element) {
        this.dropdown = dropdown
        this.btn = dropdown.querySelector('[data-dropdown-btn]')!
        this.items = dropdown.querySelectorAll('[data-dropdown-item]')
        this.menu = dropdown.querySelector<HTMLElement>('[class*="-menu"]')

        if (!this.btn) {
            console.error('BaseDropdown: button not found', dropdown)
            return
        }

        this.init()
    }

    protected init(): void {
        this.bindButtonClick()
        this.bindItemClicks()
    }

    protected bindButtonClick(): void {
        this.btn.addEventListener('click', (e: Event) => {
            e.stopPropagation()
            this.toggle()
        })
    }

    protected bindItemClicks(): void {
        this.items.forEach(item => {
            item.addEventListener('click', (e: Event) => {
                e.stopPropagation()
                
                // Проверяем, является ли элемент ссылкой с реальным href
                const isLink = item.tagName === 'A' && item.getAttribute('href') && item.getAttribute('href') !== '#'
                
                // Предотвращаем переход только если это НЕ ссылка или ссылка с #
                if (!isLink) {
                    e.preventDefault()
                }
                
                this.handleItemClick(item)
            })
        })
    }

    protected toggle(): void {
        // Закрываем все другие дропдауны
        document.querySelectorAll('[data-dropdown]').forEach(otherDropdown => {
            if (otherDropdown !== this.dropdown) {
                otherDropdown.classList.remove('is-open')
            }
        })

        this.dropdown.classList.toggle('is-open')

        if (this.dropdown.classList.contains('is-open')) {
            this.adjustMenuPosition()
        }
    }

    protected adjustMenuPosition(): void {
        if (!this.menu) return

        // Сбрасываем предыдущий класс
        this.dropdown.classList.remove('is-left')

        const rect = this.menu.getBoundingClientRect()

        if (rect.right > window.innerWidth) {
            this.dropdown.classList.add('is-left')
        } else if (rect.left < 0) {
            this.dropdown.classList.remove('is-left')
        }
    }

    protected close(): void {
        this.dropdown.classList.remove('is-open')
    }

    protected dispatchChangeEvent(detail: Partial<DropdownChangeDetail>): void {
        const event = new CustomEvent<DropdownChangeDetail>('dropdownChange', {
            detail: {
                dropdown: this.dropdown,
                value: detail.value ?? null,
                values: detail.values,
                text: detail.text ?? '',
                isLanguageChange: detail.isLanguageChange ?? false,
                isMultiple: detail.isMultiple ?? false,
            },
        })
        document.dispatchEvent(event)
    }

    protected abstract handleItemClick(item: Element): void
}
