type ExtendedDocument = Document & {
  __servicesLoadMoreInited?: boolean
}

declare const BX:
  | undefined
  | {
      showWait?: (id: string) => string
      closeWait?: (id: string, obMsg?: string) => void
    }

export default function initServicesLoadMore(): void {
  const extendedDocument = document as ExtendedDocument
  if (extendedDocument.__servicesLoadMoreInited) return
  extendedDocument.__servicesLoadMoreInited = true

  document.body?.addEventListener('click', async (event: Event) => {
    const target = event.target as HTMLElement | null
    if (!target) return

    const button = target.closest<HTMLAnchorElement>('.pagination__load-more:not(.loaded)')
    if (!button) return

    event.preventDefault()

    const nextHref = button.dataset.next || button.getAttribute('href')
    if (!nextHref) return

    button.classList.add('loaded')

    const wait = BX?.showWait ? BX.showWait('pagination__load') : ''
    const servicesMain = button.closest<HTMLElement>('.services__main')
    const listContainer = servicesMain?.querySelector<HTMLElement>('.services__list')
    const navigationContainer = servicesMain?.querySelector<HTMLElement>('.bx-navigation-container')

    if (!listContainer) {
      button.classList.remove('loaded')
      if (BX?.closeWait) BX.closeWait('pagination__load', wait)
      return
    }

    try {
      const response = await fetch(nextHref, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      const html = await response.text()
      const parser = new DOMParser()
      const documentFromResponse = parser.parseFromString(html, 'text/html')

      const nextListContainer = documentFromResponse.querySelector<HTMLElement>('.services__list')
      if (!nextListContainer) {
        button.remove()
        return
      }

      const nextItems = nextListContainer.querySelectorAll<HTMLElement>('.services__list-item')
      nextItems.forEach(item => listContainer.append(item))

      const nextNavigationContainer = documentFromResponse.querySelector<HTMLElement>('.bx-navigation-container')
      if (navigationContainer) {
        navigationContainer.innerHTML = nextNavigationContainer?.innerHTML || ''
      }

      if (window.history?.pushState) {
        window.history.pushState({}, '', nextHref)
      }

      document.dispatchEvent(new Event('init:dynamic-ui'))
    } catch (error) {
      console.error('Ошибка при подгрузке услуг:', error)
      button.classList.remove('loaded')
    } finally {
      if (BX?.closeWait) BX.closeWait('pagination__load', wait)
    }
  })
}
