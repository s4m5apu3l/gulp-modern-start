export default function initTextExpand(): void {
  document.addEventListener('click', (e: Event) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-text-expand]')
    if (!button) return

    const content = button.previousElementSibling as HTMLElement
    if (!content) return

    const isExpanded = content.classList.contains('is-expanded')
    const textSpan = button.querySelector('span')
    const icon = button.querySelector('svg')
    
    content.classList.toggle('is-expanded')
    
    if (textSpan) {
      textSpan.textContent = isExpanded ? 'Развернуть' : 'Свернуть'
    }
    
    if (icon) {
      icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)'
    }
  })
}
