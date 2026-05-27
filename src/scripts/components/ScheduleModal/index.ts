import Base from '@/components/Base'

interface ScheduleData {
    name: string
    phone: string
    email: string
    address: string
    time: string
    mapCoordinates: string
}

export default class ScheduleModal extends Base {
    private modal!: HTMLElement
    private overlay!: HTMLElement
    private closeBtn!: HTMLElement
    private triggers!: NodeListOf<HTMLElement>

    private mapIframe!: HTMLIFrameElement
    private phoneLink!: HTMLAnchorElement
    private emailLink!: HTMLAnchorElement
    private addressSpan!: HTMLElement
    private timeSpan!: HTMLElement

    private readonly selectors = {
        modal: '[data-js-schedule-modal]',
        overlay: '.schedule-modal__overlay',
        closeBtn: '.schedule-modal__close',
        trigger: '.js-schedule-btn',
        mapIframe: '[data-schedule-map-iframe]',
        phoneLink: '[data-schedule-phone]',
        emailLink: '[data-schedule-email]',
        addressSpan: '[data-schedule-address]',
        timeSpan: '[data-schedule-time]',
    }

    constructor() {
        super()
        this.init()
        this.bindEvents()
    }

    protected init(): void {
        this.modal = document.querySelector(this.selectors.modal) as HTMLElement
        
        if (!this.modal) {
            return
        }

        this.overlay = this.modal.querySelector(this.selectors.overlay) as HTMLElement
        this.closeBtn = this.modal.querySelector(this.selectors.closeBtn) as HTMLElement
        this.triggers = document.querySelectorAll(this.selectors.trigger)

        this.mapIframe = this.modal.querySelector(this.selectors.mapIframe) as HTMLIFrameElement
        this.phoneLink = this.modal.querySelector(this.selectors.phoneLink) as HTMLAnchorElement
        this.emailLink = this.modal.querySelector(this.selectors.emailLink) as HTMLAnchorElement
        this.addressSpan = this.modal.querySelector(this.selectors.addressSpan) as HTMLElement
        this.timeSpan = this.modal.querySelector(this.selectors.timeSpan) as HTMLElement
    }

    protected bindEvents(): void {
        if (!this.modal) return

        this.triggers.forEach(trigger => {
            trigger.addEventListener('click', e => {
                e.preventDefault()
                this.open(trigger)
            })
        })

        this.closeBtn?.addEventListener('click', () => this.close())
        this.overlay?.addEventListener('click', () => this.close())

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.modal.classList.contains('is-open')) {
                this.close()
            }
        })
    }

    private open(trigger: HTMLElement): void {
        const data: ScheduleData = {
            name: trigger.dataset.name || '',
            phone: trigger.dataset.phone || '',
            email: trigger.dataset.email || '',
            address: trigger.dataset.address || '',
            time: trigger.dataset.time || '',
            mapCoordinates: trigger.dataset.mapCoordinates || '52.401752,55.743512',
        }

        this.updateContent(data)
        this.modal.classList.add('is-open')
        document.body.style.overflow = 'hidden'
    }

    private close(): void {
        this.modal.classList.remove('is-open')
        document.body.style.overflow = ''
    }

    private updateContent(data: ScheduleData): void {
        // Обновляем iframe с Яндекс.Картой
        if (this.mapIframe && data.mapCoordinates) {
            const [lon, lat] = data.mapCoordinates.split(',')
            const mapUrl = `https://yandex.ru/map-widget/v1/?ll=${lon},${lat}&z=16&l=map&pt=${lon},${lat},pm2rdm`
            this.mapIframe.src = mapUrl
        }

        if (this.phoneLink) {
            this.phoneLink.href = `tel:${data.phone.replace(/\s/g, '')}`
            this.phoneLink.textContent = data.phone
        }

        if (this.emailLink) {
            this.emailLink.href = `mailto:${data.email}`
            this.emailLink.textContent = data.email
        }

        if (this.addressSpan) {
            this.addressSpan.textContent = data.address
        }

        if (this.timeSpan) {
            this.timeSpan.textContent = data.time
        }
    }
}
