import Base from '@/components/Base'

interface FileData {
    file: File
    id: string
}

export default class FileUpload extends Base {
    private containers: NodeListOf<HTMLElement> | null = null
    private readonly maxFiles = 5
    private readonly maxFileSize = 5 * 1024 * 1024 // 5MB
    private readonly allowedExtensions = [
        'doc',
        'docx',
        'xls',
        'xlsx',
        'pdf',
        'txt',
        'jpg',
        'jpeg',
        'png',
        'pptx',
    ]

    private readonly selectors = {
        container: '[data-js-file-upload]',
        input: '.js-file-upload-input',
        list: '[data-file-list]',
    }

    private filesMap = new Map<HTMLElement, FileData[]>()

    constructor() {
        super()
        this.init()
        this.bindEvents()
    }

    protected init(): void {
        this.containers = document.querySelectorAll(this.selectors.container)

        if (!this.containers || this.containers.length === 0) {
            return
        }

        this.containers.forEach(container => {
            this.filesMap.set(container, [])
        })
    }

    protected bindEvents(): void {
        if (!this.containers) return

        this.containers.forEach(container => {
            const input = container.querySelector(this.selectors.input) as HTMLInputElement

            if (!input) {
                console.error('FileUpload: input not found')
                return
            }

            input.addEventListener('change', (e: Event) => this.handleFileSelect(e, container))
        })
    }

    private handleFileSelect(e: Event, container: HTMLElement): void {
        const input = e.target as HTMLInputElement
        const files = input.files

        if (!files || files.length === 0) return

        const currentFiles = this.filesMap.get(container) || []

        if (currentFiles.length + files.length > this.maxFiles) {
            alert(`Вы можете загрузить максимум ${this.maxFiles} файлов`)
            input.value = ''
            return
        }

        Array.from(files).forEach(file => {
            if (!this.validateFile(file)) {
                return
            }

            const fileData: FileData = {
                file,
                id: this.generateId(),
            }

            currentFiles.push(fileData)
        })

        this.filesMap.set(container, currentFiles)
        this.renderFileList(container)
        input.value = ''
    }

    private validateFile(file: File): boolean {
        const extension = file.name.split('.').pop()?.toLowerCase()

        if (!extension || !this.allowedExtensions.includes(extension)) {
            alert(`Файл ${file.name} имеет недопустимый формат`)
            return false
        }

        if (file.size > this.maxFileSize) {
            alert(`Файл ${file.name} превышает максимальный размер 5 МБ`)
            return false
        }

        return true
    }

    private renderFileList(container: HTMLElement): void {
        const list = container.querySelector(this.selectors.list)

        if (!list) {
            console.error('FileUpload: file list container not found')
            return
        }

        const files = this.filesMap.get(container) || []

        list.innerHTML = files
            .map(
                fileData => `
            <div class="mayor__form-file-item" data-file-id="${fileData.id}">
                <span class="mayor__form-file-item-name">${fileData.file.name}</span>
                <button type="button" class="mayor__form-file-item-remove" data-remove="${fileData.id}">
                    ✕
                </button>
            </div>
        `,
            )
            .join('')

        this.bindRemoveButtons(container)
    }

    private bindRemoveButtons(container: HTMLElement): void {
        const removeButtons = container.querySelectorAll('[data-remove]')

        removeButtons.forEach(button => {
            button.addEventListener('click', (e: Event) => {
                const target = e.currentTarget as HTMLElement
                const fileId = target.getAttribute('data-remove')

                if (fileId) {
                    this.removeFile(container, fileId)
                }
            })
        })
    }

    private removeFile(container: HTMLElement, fileId: string): void {
        const files = this.filesMap.get(container) || []
        const updatedFiles = files.filter(f => f.id !== fileId)

        this.filesMap.set(container, updatedFiles)
        this.renderFileList(container)
    }


    private generateId(): string {
        return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
}
