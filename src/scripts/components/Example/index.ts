import Base from '@/components/Base'

export default class Example extends Base {
    private root!: HTMLElement
    private readonly selectors = {
        root: '[data-js-example]',
    }

    constructor() {
        super()
        this.init()
        this.bindEvents()
    }

    protected init(): void {
        this.root = document.querySelector(this.selectors.root) as HTMLElement
        if (!this.root) {
            console.warn('Example: root element not found')
            return
        }
    }

    protected bindEvents(): void {
        if (!this.root) return
        this.root.addEventListener('click', this.onClick.bind(this))
    }

    private onClick(): void {
        this.root.classList.toggle('is-active')
    }

    protected updateUI(): void {
        // Не используется — компонент stateless
    }
}
