import widgets from 'widjet'
import {asArray, when} from 'widjet-utils'

import {collectMatches, wrapText, lineAtCursor, insertText, scanLines} from './utils'
import KeyStroke from './key-stroke'

const escapeRegExp = (s) => s.replace(/[$^\[\]().+?*]/g, '\\$1')

const eachPair = (o, block) => { for (let k in o) { block(k, o[k]) } }

widgets.define('text-editor', (options) => {
  const collectTokens = options.collectTokens || ((tokens) => {
    return new Promise((resolve) => {
      resolve(tokens.reduce((memo, token) => {
        memo[token] = window.prompt(token.replace('$', ''))
        return memo
      }, {}))
    })
  })

  return (el) => {
    const textarea = el.querySelector('textarea')
    const keystrokes = []
    const wrapButtons = asArray(el.querySelectorAll('[data-wrap]'))
    const nodesWithRepeater = el.querySelectorAll('[data-next-line-repeater]')
    const repeaters = asArray(nodesWithRepeater).map((n) => {
      const s = n.getAttribute('data-next-line-repeater')
      if (options[s]) {
        return options[s]
      } else {
        return [
          (line) => line.match(new RegExp(`^${escapeRegExp(s)}`)),
          (line) => s
        ]
      }
    })
    repeaters.push([a => true, a => undefined])

    const repeater = when(repeaters)

    wrapButtons.forEach((button) => {
      const wrap = button.getAttribute('data-wrap')

      if (button.hasAttribute('data-keystroke')) {
        keystrokes.push(KeyStroke.parse(button.getAttribute('data-keystroke'), button))
      }

      button.addEventListener('click', (e) => {
        textarea.focus()

        if (options[wrap]) {
          options[wrap](textarea, {
            wrapText, lineAtCursor, insertText, scanLines
          })
        } else {
          defaultWrap(textarea, wrap)
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
          checkLineRepeater(e, textarea, repeater)
        }
      })
    }
  }

  function defaultWrap (textarea, wrap) {
    const [start, end] = wrap.replace(/\\\|/g, '[__PIPE__]').split('|').map(s => s.replace(/\[__PIPE__\]/g, '|'))
    const tokens = collectMatches(wrap, /\$\w+/g)

    if (tokens.length) {
      let newStart = start
      let newEnd = end

      collectTokens(tokens).then((results) => {
        eachPair(results, (token, value) => {
          const re = new RegExp(token.replace('$', '\\$'), 'g')
          newStart = newStart.replace(re, value)
          newEnd = newEnd.replace(re, value)
        })

        wrapText(textarea, newStart, newEnd)
      })
    } else {
      wrapText(textarea, start, end)
    }
  }
})

function checkLineRepeater (event, textarea, repeater) {
  const line = lineAtCursor(textarea)
  const next = line && repeater(line)

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
