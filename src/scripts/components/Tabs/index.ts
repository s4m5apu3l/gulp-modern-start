interface ITabsOptions {
  tabButtonsSelector: string
  tabContentsSelector: string
  closeTabButtonsSelector?: string
  activeClass?: string
}

/**
 * унивеrsальный таб
 * <button class="l-tab-btn js-tab-btn" data-tab="tab-1">Кнопка 1</button>
 * <button class="l-tab-btn js-tab-btn" data-tab="tab-2">Кнопка 2</button>
 *
 * <div class="l-tab-content js-tab-content" data-tab-content="tab-1">Контент 1</div>
 * <div class="l-tab-content js-tab-content" data-tab-content="tab-2">Контент 2</div>
 *
 *
 * @param {string} options.tabButtonsSelector - CSS selector for the tab buttons.
 * @param {string} options.tabContentsSelector - CSS selector for the tab contents.
 * @param {string} [options.closeTabButtonsSelector] - CSS selector for the close tab buttons.
 * @param {string} [options.activeClass='active'] - По умолчанию класс для активного состояния. стоит active
 */

export default function initTabs({
  tabButtonsSelector,
  tabContentsSelector,
  closeTabButtonsSelector = 'js-tab-close',
  activeClass = 'active',
}: ITabsOptions): void {
  const tabInitAttr = 'tabsInitialized'
  const closeInitAttr = 'tabsCloseInitialized'
  const tabButtons = document.querySelectorAll(tabButtonsSelector)
  const tabContents = document.querySelectorAll(tabContentsSelector)

  if (!tabButtons.length || !tabContents.length) return

  tabButtons.forEach(button => {
    const tabButton = button as HTMLElement
    if (tabButton.dataset[tabInitAttr] === 'Y') {
      return
    }

    tabButton.dataset[tabInitAttr] = 'Y'
    tabButton.addEventListener('click', () => {
      const targetTab = (button as HTMLElement).dataset.tab
      
      const parentElement = (button as HTMLElement).parentElement?.parentElement || document

      const siblingButtons = parentElement.querySelectorAll(tabButtonsSelector)
      const siblingContents = parentElement.querySelectorAll(tabContentsSelector)

      siblingButtons.forEach(btn => btn.classList.remove(activeClass))
      siblingContents.forEach(content => {
        content.classList.remove(activeClass)
      })

      button.classList.add(activeClass)
      const targetContent = parentElement.querySelector(`${tabContentsSelector}[data-tab-content="${targetTab}"]`)
      if (targetContent) {
        targetContent.classList.add(activeClass)
      }
    })
  })

  // Добавляем обработчики для кнопок закрытия табов
  const closeButtons = document.querySelectorAll(`.${closeTabButtonsSelector}`)

  closeButtons.forEach(closeButton => {
    const closeTabButton = closeButton as HTMLElement
    if (closeTabButton.dataset[closeInitAttr] === 'Y') {
      return
    }

    closeTabButton.dataset[closeInitAttr] = 'Y'
    closeTabButton.addEventListener('click', e => {
      e.stopPropagation()
      const parentTabContent = (closeButton as HTMLElement).closest(tabContentsSelector)

      if (parentTabContent) {
        parentTabContent.classList.remove(activeClass)
        // const tabId = (parentTabContent as HTMLElement).dataset.tabContent;

        // Находим соответствующую кнопку таба и контент
        // const tabButton = document.querySelector(`${tabButtonsSelector}[data-tab="${tabId}"]`);
      }
    })
  })
}
