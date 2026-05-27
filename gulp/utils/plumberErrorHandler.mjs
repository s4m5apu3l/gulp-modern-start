export const createPlumberErrorHandler = title =>
  function plumberErrorHandler(err) {
    const message = err?.message ?? String(err)
    console.error(`[${title}] ${message}`)
    this.emit('end')
  }
