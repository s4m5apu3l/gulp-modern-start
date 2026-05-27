export default function copyText() {
    const clipboard = document.querySelectorAll('.clipboard')

    if (!clipboard) return

    clipboard.forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault()
            e.stopPropagation()
            
            const target = e.currentTarget as HTMLElement
            
            // Получаем URL из data-атрибута или из дочернего элемента .text
            const url = target.getAttribute('data-url')
            const text = url || target.querySelector('.text')?.textContent
            
            if (text) {
                navigator.clipboard.writeText(text)
                target.classList.add('copied')
                setTimeout(() => {
                    target.classList.remove('copied')
                }, 2000)
            }
        })
    })
}
