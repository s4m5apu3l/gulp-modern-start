export default function initAccordion() {
  const body = document.body as HTMLBodyElement & { __accordionDelegatedInited?: boolean }
  if (!body || body.__accordionDelegatedInited) return
  body.__accordionDelegatedInited = true

  body.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement | null
    if (!target) return

    const accordion = target.closest<HTMLElement>('.accordion__button')
    if (!accordion) return

    accordion.classList.toggle('is-active')

    const content = accordion.nextElementSibling as HTMLElement | null
    if (!content) return

    if (content.style.maxHeight) {
      content.style.maxHeight = ''
    } else {
      content.style.maxHeight = `${content.scrollHeight}px`
    }
  })
}
