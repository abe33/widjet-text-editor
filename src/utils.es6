export function insertText (textarea, start, end, text) {
  textarea.value = textarea.value.substring(0, start) +
                   text +
                   textarea.value.substring(end, textarea.value.length)
}

export function wrapSelection (textarea, prefix, suffix) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.substring(start, end)
  const replacement = prefix + selectedText + suffix

  insertText(textarea, start, end, replacement)

  textarea.selectionStart = start + prefix.length
  textarea.selectionEnd = end + prefix.length
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
  return function (textarea, ...args) {
    const lines = textarea.value.split(/\n/)
    let counter = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const result = block({
        textarea, line, lineIndex: i, charIndex: counter
      }, ...args)

      if (result != null) { return result }
      counter += line.length + 1
    }
  }
}

export const lineAt = scanLines(({line, charIndex}, index) =>
  index >= charIndex && index <= charIndex + line.length ? line : undefined
)

export const lineStartIndexAt = scanLines(({line, charIndex}, index) =>
  index >= charIndex && index <= charIndex + line.length ? charIndex : undefined
)

export const lineEndIndexAt = scanLines(({line, charIndex}, index) =>
  index >= charIndex && index <= charIndex + line.length
    ? charIndex + line.length
    : undefined
)

export const lineAtCursor = (textarea) =>
  lineAt(textarea, textarea.selectionStart)

export const lineStartIndexAtCursor = (textarea) =>
  lineStartIndexAt(textarea, textarea.selectionStart)

export const lineEndIndexAtCursor = (textarea) =>
  lineEndIndexAt(textarea, textarea.selectionStart)

export const wholeLinesContaining = (textarea, start, end = start) => {
  const s = Math.min(lineStartIndexAt(textarea, start), start)
  const e = Math.max(lineEndIndexAt(textarea, end), end)
  return [s, e, textarea.value.substring(s, e)]
}

export const wholeLinesAtCursor = (textarea) =>
  wholeLinesContaining(textarea, textarea.selectionStart, textarea.selectionEnd)

export const patchLines = (str, block) => str.split('\n').map(block).join('\n')

export default {
  lineAt,
  lineAtCursor,
  lineEndIndexAt,
  lineEndIndexAtCursor,
  lineStartIndexAt,
  lineStartIndexAtCursor,
  patchLines,
  scanLines,
  wholeLinesAtCursor,
  wholeLinesContaining
}
