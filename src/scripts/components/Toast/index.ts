import Base from '@/components/Base'

export default class Toast extends Base {
    private rootElement!: HTMLElement | null
    private readonly displayDuration = 5000 // 5 секунд

    private readonly selectors = {
        root: '[data-js-toast]',
    }

    constructor() {
        super()
        this.init()
        this.checkUrlParams()
    }

    protected init(): void {
        this.rootElement = document.querySelector(this.selectors.root)
        if (!this.rootElement) return
    }

    protected bindEvents(): void {
        // События не нужны, тостер автоматически скрывается
    }

    /**
     * Проверяет URL параметры для показа тостера
     * Пример: ?toast=auth_success
     */
    private checkUrlParams(): void {
        const urlParams = new URLSearchParams(window.location.search)
        const toastType = urlParams.get('toast')

        if (toastType) {
            this.show()
            this.cleanUrl()
        }
    }

    public show(): void {
        if (!this.rootElement) return

        setTimeout(() => {
            this.rootElement?.classList.add('is-visible')
        }, 300)

        setTimeout(() => {
            this.hide()
        }, this.displayDuration)
    }


    private hide(): void {
        this.rootElement?.classList.remove('is-visible')
    }


    private cleanUrl(): void {
        const url = new URL(window.location.href)
        url.searchParams.delete('toast')
        window.history.replaceState({}, '', url.toString())
    }
}
