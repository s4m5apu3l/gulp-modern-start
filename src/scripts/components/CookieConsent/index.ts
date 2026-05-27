import Base from '@/components/Base'

export default class CookieConsent extends Base {
    private rootElement!: HTMLElement | null
    private acceptButton!: HTMLElement | null
    private readonly cookieName = 'cookie_consent'

    private readonly selectors = {
        root: '[data-js-cookie-consent]',
        acceptButton: '[data-js-cookie-accept]',
    }

    constructor() {
        super()
        this.init()
        this.bindEvents()
    }

    protected init(): void {
        this.rootElement = document.querySelector(this.selectors.root)
        if (!this.rootElement) return

        this.acceptButton = this.rootElement.querySelector(this.selectors.acceptButton)

        if (!this.getCookie(this.cookieName)) {
            setTimeout(() => this.rootElement?.classList.add('is-visible'), 500)
        }
    }

    protected bindEvents(): void {
        this.acceptButton?.addEventListener('click', () => this.handleAccept())
    }

    private handleAccept(): void {
        this.setCookie(this.cookieName, 'accepted', 365)
        this.rootElement?.classList.remove('is-visible')
    }

    private setCookie(name: string, value: string, days: number): void {
        const date = new Date()
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`
    }

    private getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
        return match ? match[2] : null
    }
}
