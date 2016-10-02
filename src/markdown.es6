import {insertText, wholeLinesAtCursor, patchLines} from './utils'

export default {
  blockquote: (textarea) => {
    const [start, end, string] = wholeLinesAtCursor(textarea)
    const newSelection = patchLines(string, line => `> ${line}`)

    return [start, end, newSelection]
  },

  codeBlock: (textarea) => {
    const [start, end, string] = wholeLinesAtCursor(textarea)
    const newSelection = patchLines(string, line => `    ${line}`)

    return [start, end, newSelection]
  },

  orderedList: (textarea) => {
    const [start, end, string] = wholeLinesAtCursor(textarea)
    const newSelection = patchLines(string, (line, i) =>
      i === 0 ? `1. ${line}` : `  ${line}`
    )

    return [start, end, newSelection]
  },

  unorderedList: (textarea) => {
    const [start, end, string] = wholeLinesAtCursor(textarea)
    const newSelection = patchLines(string, (line, i) =>
      i === 0 ? `- ${line}` : `  ${line}`
    )

    return [start, end, newSelection]
  },

  // Repeaters
  repeatOrderedList: [
    (line) => line.match(/^\d\. /),
    (line) => `${parseInt(line.match(/^\d/)[0], 10) + 1}. `
  ]
}
