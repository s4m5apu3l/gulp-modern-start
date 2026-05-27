import IBase from '@/components/Base'

const ClassName = {
  ACTIVE: 'is-active',
  OPEN: 'is-open',
} as const

const SELECTORS = {
  megaMenu: '[data-js-mega-menu]',
  menuToggle: '[data-js-menu-toggle]',
  searchMenu: '[data-js-search-menu]',
  searchToggle: '[data-js-search-toggle]',
  overlayClose: '[data-js-overlay-close]',
  searchClose: '[data-js-search-close]',
} as const

export default class Header extends IBase {
  private megaMenu: HTMLElement | null = null
  private searchMenu: HTMLElement | null = null
  private menuToggleButtons!: NodeListOf<HTMLElement>
  private searchToggleButtons!: NodeListOf<HTMLElement>
  private overlayCloseButtons!: NodeListOf<HTMLElement>
  private searchCloseButtons!: NodeListOf<HTMLElement>

  private readonly boundHandlers = {
    menuToggle: this.onMenuToggle.bind(this),
    searchToggle: this.onSearchToggle.bind(this),
    overlayClose: this.closeAll.bind(this),
    searchClose: this.closeSearch.bind(this),
    keydown: this.onKeydown.bind(this),
  }

  constructor() {
    super()
    this.init()
    this.bindEvents()
  }

  protected init(): void {
    this.megaMenu = document.querySelector(SELECTORS.megaMenu)
    this.searchMenu = document.querySelector(SELECTORS.searchMenu)
    this.menuToggleButtons = document.querySelectorAll(SELECTORS.menuToggle)
    this.searchToggleButtons = document.querySelectorAll(SELECTORS.searchToggle)
    this.overlayCloseButtons = document.querySelectorAll(SELECTORS.overlayClose)
    this.searchCloseButtons = document.querySelectorAll(SELECTORS.searchClose)
  }

  protected bindEvents(): void {
    const { boundHandlers: h } = this

    this.menuToggleButtons.forEach(btn => btn.addEventListener('click', h.menuToggle))
    this.searchToggleButtons.forEach(btn => btn.addEventListener('click', h.searchToggle))
    this.overlayCloseButtons.forEach(btn => btn.addEventListener('click', h.overlayClose))
    this.searchCloseButtons.forEach(btn => btn.addEventListener('click', h.searchClose))
    document.addEventListener('keydown', h.keydown)

    // Предотвращаем закрытие меню при клике на языковой дропдаун
    const langDropdown = document.querySelector('.header__mobile .header__lang-dropdown')
    if (langDropdown) {
      langDropdown.addEventListener('click', e => {
        e.stopPropagation()
      })
    }
  }

  public destroy(): void {
    const { boundHandlers: h } = this

    this.menuToggleButtons.forEach(btn => btn.removeEventListener('click', h.menuToggle))
    this.searchToggleButtons.forEach(btn => btn.removeEventListener('click', h.searchToggle))
    this.overlayCloseButtons.forEach(btn => btn.removeEventListener('click', h.overlayClose))
    this.searchCloseButtons.forEach(btn => btn.removeEventListener('click', h.searchClose))
    document.removeEventListener('keydown', h.keydown)
  }

  private onMenuToggle(): void {
    if (this.megaMenu?.classList.contains(ClassName.OPEN)) {
      this.closeMenu()
    } else {
      this.closeSearch() // Закрываем поиск если открыт
      this.openMenu()
    }
  }

  private onSearchToggle(): void {
    if (this.searchMenu?.classList.contains(ClassName.OPEN)) {
      this.closeSearch()
    } else {
      this.closeMenu() // Закрываем меню если открыто
      this.openSearch()
    }
  }

  private openMenu(): void {
    this.megaMenu?.classList.add(ClassName.OPEN)
    this.menuToggleButtons.forEach(btn => btn.classList.add(ClassName.ACTIVE))
    document.body.style.overflow = 'hidden'

    const header = document.querySelector('.header')
    header?.classList.add('header--menu-open')
  }

  private closeMenu(): void {
    this.megaMenu?.classList.remove(ClassName.OPEN)
    this.menuToggleButtons.forEach(btn => btn.classList.remove(ClassName.ACTIVE))

    const header = document.querySelector('.header')
    header?.classList.remove('header--menu-open')

    // Восстанавливаем скролл только если поиск тоже закрыт
    if (!this.searchMenu?.classList.contains(ClassName.OPEN)) {
      document.body.style.overflow = ''
    }
  }

  private openSearch(): void {
    this.searchMenu?.classList.add(ClassName.OPEN)
    this.searchToggleButtons.forEach(btn => btn.classList.add(ClassName.ACTIVE))
    document.body.style.overflow = 'hidden'

    const header = document.querySelector('.header')
    header?.classList.add('header--search-open')

    // Фокус на поле ввода
    const searchInput = this.searchMenu?.querySelector('.header__search-input') as HTMLInputElement
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100)
    }
  }

  private closeSearch(): void {
    this.searchMenu?.classList.remove(ClassName.OPEN)
    this.searchToggleButtons.forEach(btn => btn.classList.remove(ClassName.ACTIVE))

    const header = document.querySelector('.header')
    header?.classList.remove('header--search-open')

    // Восстанавливаем скролл только если меню тоже закрыто
    if (!this.megaMenu?.classList.contains(ClassName.OPEN)) {
      document.body.style.overflow = ''
    }
  }

  private closeAll(): void {
    this.closeMenu()
    this.closeSearch()
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.searchMenu?.classList.contains(ClassName.OPEN)) {
        this.closeSearch()
      } else if (this.megaMenu?.classList.contains(ClassName.OPEN)) {
        this.closeMenu()
      }
    }
  }
}
