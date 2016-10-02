export function wrapText (textarea, openTag, closeTag) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.substring(start, end)
  const replacement = openTag + selectedText + closeTag

  insertText(textarea, replacement, start, end)

  textarea.selectionStart = start + openTag.length
  textarea.selectionEnd = end + openTag.length
}

export function insertText (textarea, text, start, end) {
  textarea.value = textarea.value.substring(0, start) +
                   text +
                   textarea.value.substring(end, textarea.value.length)
}

export function collectMatches (string, regex) {
  let match
  const matches = []

  while ((match = regex.exec(string))) {
    matches.push(match[0])
  }

  return matches
}

export function scanLines (block) {
  return function (textarea) {
    const lines = textarea.value.split(/\n/)
    let counter = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const result = block({textarea, line, lineIndex: i, charIndex: counter})

      if (result) { return result }
      counter += line.length + 1
    }
  }
}

export const lineAtCursor = scanLines(({textarea, line, charIndex}) => {
  const start = textarea.selectionStart
  if (start > charIndex && start <= charIndex + line.length) {
    return line
  }
})

export const lineStartIndexAtCursor = scanLines(({textarea, line, charIndex}) => {
  const start = textarea.selectionStart
  if (start > charIndex && start <= charIndex + line.length) {
    return charIndex
  }
})

export const lineEndIndexAtCursor = scanLines(({textarea, line, charIndex}) => {
  const start = textarea.selectionStart
  if (start > charIndex && start <= charIndex + line.length) {
    return charIndex + line.length - 1
  }
})

export const wholeLinesAtCursor = (textarea) => {
  const s = Math.min(lineStartIndexAtCursor(textarea), textarea.selectionStart)
  const e = Math.max(lineEndIndexAtCursor(textarea), textarea.selectionEnd)
  return [s, e, textarea.value.substring(s, e)]
}

export const patchLines = (str, block) => str.split('\n').map(block).join('\n')
