import widgets from 'widjet'
import {asArray, when} from 'widjet-utils'

import {collectMatches, wrapText, lineAtCursor, insertText} from './utils'
import KeyStroke from './key-stroke'

const escapeRegExp = (s) => s.replace(/[$^\[\]().+?*]/g, '\\$1')

widgets.define('text-editor', (options) => (el) => {
  const textarea = el.querySelector('textarea')
  const keystrokes = []
  const wrapButtons = asArray(el.querySelectorAll('[data-wrap]'))
  const nodesWithContinuation = el.querySelectorAll('[data-next-line-continuation]')
  const continuations = asArray(nodesWithContinuation).map((n) => {
    const s = n.getAttribute('data-next-line-continuation')
    if (options[s]) {
      return options[s]
    } else {
      return [
        (line) => line.match(new RegExp(`^${escapeRegExp(s)}`)),
        (line) => s
      ]
    }
  })
  continuations.push([a => true, a => undefined])

  const continuation = when(continuations)

  wrapButtons.forEach((button) => {
    const wrap = button.getAttribute('data-wrap')
    const [start, end] = wrap.split('|')
    const tokens = collectMatches(wrap, /\$\w+/g)

    if (button.hasAttribute('data-keystroke')) {
      keystrokes.push(KeyStroke.parse(button.getAttribute('data-keystroke'), button))
    }

    button.addEventListener('click', (e) => {
      textarea.focus()

      if (tokens.length) {
        let newStart = start
        let newEnd = end

        tokens.forEach((token) => {
          const re = new RegExp(token.replace('$', '\\$'), 'g')
          const value = window.prompt(token.replace('$', ''))
          newStart = newStart.replace(re, value)
          newEnd = newEnd.replace(re, value)
        })

        wrapText(textarea, newStart, newEnd)
      } else {
        wrapText(textarea, start, end)
      }
      widgets.dispatch(textarea, 'input')
      widgets.dispatch(textarea, 'change')
    })
  })

  if (keystrokes.length > 0) {
    textarea.addEventListener('keydown', (e) => {
      const match = keystrokes.filter(ks => ks.matches(e))[0]

      if (match) {
        e.preventDefault()
        widgets.dispatch(match.trigger, 'click')
      }

      if (e.keyCode === 13) {
        checkLineContinuation(e, textarea, continuation)
      }
    })
  }
})

function checkLineContinuation (event, textarea, continuation) {
  const line = lineAtCursor(textarea)
  const next = line && continuation(line)

  if (next) {
    event.preventDefault()
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    insertText(textarea, `\n${next}`, start, end)
    textarea.selectionEnd = end + next.length + 1
    widgets.dispatch(textarea, 'input')
    widgets.dispatch(textarea, 'change')
  }
}
