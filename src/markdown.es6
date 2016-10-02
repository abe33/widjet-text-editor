import {insertText, wholeLinesAtCursor, patchLines} from './utils'

export default {
  blockquote: (textarea) => {
    const [start, end, string] = wholeLinesAtCursor(textarea)
    const newSelection = patchLines(string, line => `> ${line}`)

    insertText(textarea, newSelection, start, end)
  },

  codeBlock: (textarea) => {
    const [start, end, string] = wholeLinesAtCursor(textarea)
    const newSelection = patchLines(string, line => `    ${line}`)

    insertText(textarea, newSelection, start, end)
  },

  orderedList: (textarea) => {
    const [start, end, string] = wholeLinesAtCursor(textarea)
    const newSelection = patchLines(string, (line, i) =>
      i === 0 ? `1. ${line}` : `  ${line}`
    )

    insertText(textarea, newSelection, start, end)
  },

  unorderedList: (textarea) => {
    const [start, end, string] = wholeLinesAtCursor(textarea)
    const newSelection = patchLines(string, (line, i) =>
      i === 0 ? `- ${line}` : `  ${line}`
    )

    insertText(textarea, newSelection, start, end)
  },

  // Repeaters
  repeatOrderedList: [
    (line) => line.match(/^\d\. /),
    (line) => `${parseInt(line.match(/^\d/)[0], 10) + 1}. `
  ]
}
