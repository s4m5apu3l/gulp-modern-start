import fs from 'node:fs'
import path from 'node:path'

const files = process.argv.slice(2)

if (files.length === 0) {
  process.exit(0)
}

for (const filePath of files) {
  if (!fs.existsSync(filePath) || path.extname(filePath).toLowerCase() !== '.php') {
    continue
  }

  const source = fs.readFileSync(filePath, 'utf8')
  const transformed = convertArraySyntax(source)

  if (transformed !== source) {
    fs.writeFileSync(filePath, transformed, 'utf8')
  }
}

function convertArraySyntax(code) {
  let result = ''
  const stack = []
  let i = 0
  let state = 'normal'

  while (i < code.length) {
    const ch = code[i]
    const next = code[i + 1] ?? ''

    if (state === 'single') {
      result += ch
      if (ch === '\\') {
        i += 1
        if (i < code.length) result += code[i]
      } else if (ch === "'") {
        state = 'normal'
      }
      i += 1
      continue
    }

    if (state === 'double') {
      result += ch
      if (ch === '\\') {
        i += 1
        if (i < code.length) result += code[i]
      } else if (ch === '"') {
        state = 'normal'
      }
      i += 1
      continue
    }

    if (state === 'line_comment') {
      result += ch
      if (ch === '\n') state = 'normal'
      i += 1
      continue
    }

    if (state === 'block_comment') {
      result += ch
      if (ch === '*' && next === '/') {
        result += next
        i += 2
        state = 'normal'
      } else {
        i += 1
      }
      continue
    }

    if (ch === "'") {
      state = 'single'
      result += ch
      i += 1
      continue
    }

    if (ch === '"') {
      state = 'double'
      result += ch
      i += 1
      continue
    }

    if (ch === '/' && next === '/') {
      state = 'line_comment'
      result += ch + next
      i += 2
      continue
    }

    if (ch === '#') {
      state = 'line_comment'
      result += ch
      i += 1
      continue
    }

    if (ch === '/' && next === '*') {
      state = 'block_comment'
      result += ch + next
      i += 2
      continue
    }

    if (isArrayKeyword(code, i)) {
      const openIndex = skipWs(code, i + 5)
      if (code[openIndex] === '(') {
        result += '['
        stack.push('array')
        i = openIndex + 1
        continue
      }
    }

    if (ch === '(') {
      stack.push('paren')
      result += ch
      i += 1
      continue
    }

    if (ch === ')') {
      const top = stack.pop()
      result += top === 'array' ? ']' : ')'
      i += 1
      continue
    }

    result += ch
    i += 1
  }

  return result
}

function isArrayKeyword(code, i) {
  if (code.slice(i, i + 5).toLowerCase() !== 'array') return false
  const prev = code[i - 1] ?? ''
  const next = code[i + 5] ?? ''
  return !isWordChar(prev) && !isWordChar(next)
}

function isWordChar(ch) {
  return /[A-Za-z0-9_]/.test(ch)
}

function skipWs(code, i) {
  let j = i
  while (j < code.length && /\s/.test(code[j])) j += 1
  return j
}
