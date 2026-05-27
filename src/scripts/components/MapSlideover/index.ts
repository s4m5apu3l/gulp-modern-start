import Base from '@/components/Base'

const ClassName = {
    OPEN: 'is-open',
    ACTIVE: 'is-active',
    HIDDEN: 'is-hidden',
} as const

const SELECTORS = {
    block: '[data-js-map-block]',
    handle: '[data-js-map-handle]',
    overlay: '[data-js-map-overlay]',
    closeBtn: '[data-js-map-close]',
    filterToggle: '[data-js-map-filter-toggle]',
    filterBlock: '[data-js-map-filter-block]',
    filterClose: '[data-js-map-filter-close]',
    filterLinks: '[data-js-map-filter-link]',
    drilldownTrigger: '[data-js-drilldown-trigger]',
    drilldownLevel: '[data-js-drilldown-level]',
    backBtn: '[data-js-map-back]',
    blockTitle: '.map__block-title',
} as const

export default class MapSlideover extends Base {
    private blocks!: NodeListOf<HTMLElement>
    private overlay: HTMLElement | null = null
    private mainElement: HTMLElement | null = null
    private scrollLockCount = 0
    private filterToggle: HTMLElement | null = null
    private filterBlock: HTMLElement | null = null
    private filterClose: HTMLElement | null = null
    private filterLinks!: NodeListOf<HTMLElement>
    private navigationStack: string[] = []
    private blockTitles = new Map<HTMLElement, string>()

    constructor() {
        super()
        this.init()
        this.bindEvents()
    }

    protected init(): void {
        this.blocks = document.querySelectorAll(SELECTORS.block)
        this.overlay = document.querySelector(SELECTORS.overlay)
        this.mainElement = document.querySelector('.wrapper main')
        this.filterToggle = document.querySelector(SELECTORS.filterToggle)
        this.filterBlock = document.querySelector(SELECTORS.filterBlock)
        this.filterClose = document.querySelector(SELECTORS.filterClose)
        this.filterLinks = document.querySelectorAll(SELECTORS.filterLinks)

        if (!this.blocks.length && !this.filterBlock) {
            console.warn('MapSlideover: no blocks or filter found')
        }

        if (this.filterToggle && !this.filterBlock) {
            console.error('MapSlideover: filter toggle found but filter block missing')
        }
    }

    protected bindEvents(): void {
        this.blocks.forEach(block => {
            const handle = block.querySelector(SELECTORS.handle)
            handle?.addEventListener('click', () => this.toggleBlock(block))

            const closeBtn = block.querySelector(SELECTORS.closeBtn)
            closeBtn?.addEventListener('click', () => this.closeBlock(block))

            this.initDrilldown(block)
        })

        this.filterToggle?.addEventListener('click', () => this.toggleFilter())
        this.filterClose?.addEventListener('click', () => this.closeFilter())

        this.filterLinks.forEach(link => {
            link.addEventListener('click', () => this.toggleFilterLink(link))
        })

        this.overlay?.addEventListener('click', () => this.closeAll())
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (this.filterBlock?.classList.contains(ClassName.OPEN)) {
                    this.closeFilter()
                } else {
                    this.closeAll()
                }
            }
        })
    }

    private showBlock(block: HTMLElement): void {
        this.blocks.forEach(b => {
            if (b !== block) {
                this.closeBlock(b)
            }
        })

        block.classList.add(ClassName.ACTIVE)
    }

    private toggleBlock(block: HTMLElement): void {
        if (block.classList.contains(ClassName.OPEN)) {
            block.classList.remove(ClassName.OPEN)
            this.overlay?.classList.remove(ClassName.OPEN)
            this.mainElement?.classList.remove('map-block-open')
            this.unlockScroll()
        } else {
            block.classList.add(ClassName.OPEN)
            this.overlay?.classList.add(ClassName.OPEN)
            this.mainElement?.classList.add('map-block-open')
            this.lockScroll()
        }
    }

    private closeBlock(block: HTMLElement): void {
        block.classList.remove(ClassName.OPEN, ClassName.ACTIVE)

        if (!Array.from(this.blocks).some(b => b.classList.contains(ClassName.OPEN))) {
            this.overlay?.classList.remove(ClassName.OPEN)
            this.mainElement?.classList.remove('map-block-open')
            this.unlockScroll()
        }
    }

    private closeAll(): void {
        if (this.filterBlock?.classList.contains(ClassName.OPEN)) {
            this.closeFilter()
        } else {
            this.blocks.forEach(block => this.closeBlock(block))
        }
    }

    private toggleFilter(): void {
        if (this.filterBlock?.classList.contains(ClassName.OPEN)) {
            this.closeFilter()
        } else {
            this.openFilter()
        }
    }

    private openFilter(): void {
        if (!this.filterBlock) return

        this.blocks.forEach(block => this.closeBlock(block))

        this.filterBlock.classList.add(ClassName.ACTIVE, ClassName.OPEN)
        this.overlay?.classList.add(ClassName.OPEN)
        this.mainElement?.classList.add('map-block-open')
        document.body.classList.add('map-filter-is-open')
        this.lockScroll()
    }

    private closeFilter(): void {
        if (!this.filterBlock) return

        this.filterBlock.classList.remove(ClassName.OPEN, ClassName.ACTIVE)
        this.overlay?.classList.remove(ClassName.OPEN)
        this.mainElement?.classList.remove('map-block-open')
        document.body.classList.remove('map-filter-is-open')
        this.unlockScroll()
    }

    private lockScroll(): void {
        if (this.scrollLockCount === 0) {
            document.body.style.overflow = 'hidden'
        }
        this.scrollLockCount++
    }

    private unlockScroll(): void {
        this.scrollLockCount = Math.max(0, this.scrollLockCount - 1)
        if (this.scrollLockCount === 0) {
            document.body.style.overflow = ''
        }
    }

    private toggleFilterLink(link: HTMLElement): void {
        link.classList.toggle(ClassName.ACTIVE)
    }

    private initDrilldown(block: HTMLElement): void {
        const backBtn = block.querySelector(SELECTORS.backBtn) as HTMLElement
        const titleElement = block.querySelector(SELECTORS.blockTitle) as HTMLElement

        if (titleElement) {
            this.blockTitles.set(block, titleElement.textContent || '')
        }

        this.bindDrilldownTriggers(block)

        backBtn?.addEventListener('click', () => {
            this.navigateBack(block)
        })
    }

    private bindDrilldownTriggers(block: HTMLElement): void {
        const triggers = block.querySelectorAll(SELECTORS.drilldownTrigger)

        triggers.forEach(trigger => {
            if ((trigger as HTMLElement).dataset.bound) return

            trigger.addEventListener('click', e => {
                e.preventDefault()
                const target = (trigger as HTMLElement).dataset.target
                const title = (trigger as HTMLElement).dataset.title

                if (target) {
                    this.navigateToLevel(block, target, title)
                }
            })

            ;(trigger as HTMLElement).dataset.bound = 'true'
        })
    }

    private navigateToLevel(block: HTMLElement, targetId: string, title?: string): void {
        const currentLevel = block.querySelector(
            `${SELECTORS.drilldownLevel}:not(.${ClassName.HIDDEN})`,
        ) as HTMLElement
        const targetLevel = block.querySelector(
            `${SELECTORS.drilldownLevel}[data-id="${targetId}"]`,
        ) as HTMLElement

        if (!targetLevel) {
            console.error(`MapSlideover: target level "${targetId}" not found`)
            return
        }

        if (currentLevel) {
            currentLevel.classList.add(ClassName.HIDDEN)
            const currentId = currentLevel.dataset.id || currentLevel.dataset.level || 'root'
            this.navigationStack.push(currentId)
        }

        targetLevel.classList.remove(ClassName.HIDDEN)

        this.bindDrilldownTriggers(block)

        const backBtn = block.querySelector(SELECTORS.backBtn) as HTMLElement
        const titleElement = block.querySelector(SELECTORS.blockTitle) as HTMLElement

        if (backBtn) {
            backBtn.style.display = 'flex'
        }

        if (titleElement && title) {
            titleElement.textContent = title
        }
    }

    private navigateBack(block: HTMLElement): void {
        if (this.navigationStack.length === 0) return

        const currentLevel = block.querySelector(
            `${SELECTORS.drilldownLevel}:not(.${ClassName.HIDDEN})`,
        ) as HTMLElement
        const previousId = this.navigationStack.pop()
        
        let previousLevel: HTMLElement | null = null
        
        if (previousId === '1') {
            previousLevel = block.querySelector(`${SELECTORS.drilldownLevel}[data-level="1"]`) as HTMLElement
        } else {
            previousLevel = block.querySelector(
                `${SELECTORS.drilldownLevel}[data-id="${previousId}"]`,
            ) as HTMLElement
        }

        if (!previousLevel) {
            console.error(`MapSlideover: previous level "${previousId}" not found`)
            return
        }

        if (currentLevel) {
            currentLevel.classList.add(ClassName.HIDDEN)
        }

        previousLevel.classList.remove(ClassName.HIDDEN)

        const backBtn = block.querySelector(SELECTORS.backBtn) as HTMLElement
        const titleElement = block.querySelector(SELECTORS.blockTitle) as HTMLElement

        if (this.navigationStack.length === 0 && backBtn) {
            backBtn.style.display = 'none'

            if (titleElement) {
                const originalTitle = this.blockTitles.get(block)
                if (originalTitle) {
                    titleElement.textContent = originalTitle
                }
            }
        } else if (titleElement) {
            const previousTitle = previousLevel.dataset.title
            if (previousTitle) {
                titleElement.textContent = previousTitle
            }
        }
    }
}
