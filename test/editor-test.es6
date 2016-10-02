import expect from 'expect.js'
import jsdom from 'mocha-jsdom'
import sinon from 'sinon'
import widgets from 'widjet'

import {click, inputEvent} from './helpers/events'
import {waitsFor} from './helpers/utils'

import '../src/index'

describe('text-editor', () => {
  jsdom()

  let textarea

  beforeEach(() => {
    document.body.innerHTML = `
      <div class='text-editor'>
        <button data-wrap='**|**'
                data-keystroke='ctrl-b'></button>

        <button data-wrap='[|]($url "$title")'
                data-keystroke='ctrl-u'></button>

        <button data-wrap='wrapCode'></button>

        <button data-wrap='- |'
                data-keystroke='ctrl-u'
                data-next-line-repeater='- '></button>

        <button data-wrap='1. |'
                data-keystroke='ctrl-o'
                data-next-line-repeater='orderedList'></button>

        <textarea></textarea>
      </div>
    `

    textarea = document.querySelector('textarea')

    widgets('text-editor', '.text-editor', {
      on: 'init',
      orderedList: [
        (line) => line.match(/^\d\. /),
        (line) => `${parseInt(line.match(/^\d/)[0], 10) + 1}. `
      ],
      wrapCode: (textarea, api) => {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        const newSelection = textarea.value.substring(start, end).split('\n').map(s => `    ${s}`).join('\n')

        api.insertText(textarea, newSelection, start, end)
      }
    })
  })

  describe('clicking on an action button', () => {
    beforeEach(() => {
      const button = document.querySelector('[data-wrap="**|**"]')
      click(button)
    })

    it('inserts the corresponding text', () => {
      expect(textarea.value).to.eql('****')
    })

    it('places the cursor at the position of the | in the data-wrap value', () => {
      expect(textarea.selectionEnd).to.eql(2)
      expect(textarea.selectionStart).to.eql(2)
    })

    describe('that have a drap-wrap attribute that refer to a function in the options', () => {
      beforeEach(() => {
        textarea.value = 'some text content\nsome text content\nsome text content'
        textarea.selectionStart = 0
        textarea.selectionEnd = textarea.value.length

        const button = document.querySelector('[data-wrap="wrapCode"]')
        click(button)
      })

      it('inserts the corresponding text', () => {
        expect(textarea.value).to.eql('    some text content\n    some text content\n    some text content')
      })
    })
  })

  describe('when the text editor has the focus', () => {
    beforeEach(() => { textarea.focus() })

    describe('using a key stroke', () => {
      describe('when the textarea selection start and end are intricated', () => {
        beforeEach(() => {
          textarea.dispatchEvent(inputEvent('keydown', {ctrlKey: true, key: 'b'}))
        })

        it('inserts the corresponding text', () => {
          expect(textarea.value).to.eql('****')
        })

        it('places the cursor at the position of the | in the data-wrap value', () => {
          expect(textarea.selectionEnd).to.eql(2)
          expect(textarea.selectionStart).to.eql(2)
        })
      })

      describe('when the textarea selection spans several characters', () => {
        beforeEach(() => {
          textarea.value = 'some text content'
          textarea.selectionStart = 5
          textarea.selectionEnd = 9

          textarea.dispatchEvent(inputEvent('keydown', {ctrlKey: true, keyCode: 98}))
        })

        it('wraps the selected text with the data-wrap value', () => {
          expect(textarea.value).to.eql('some **text** content')
        })

        it('moves the selection to follow the wrapped content', () => {
          expect(textarea.selectionStart).to.eql(7)
          expect(textarea.selectionEnd).to.eql(11)
        })
      })

      describe('when the wrap pattern contains a token', () => {
        beforeEach(() => {
          sinon.stub(window, 'prompt').returns('foo')

          textarea.value = 'some text content'
          textarea.selectionStart = 5
          textarea.selectionEnd = 9

          textarea.dispatchEvent(inputEvent('keydown', {ctrlKey: true, key: 'u'}))

          return waitsFor('user prompted', () => window.prompt.called)
        })

        it('prompts the user for input and uses the provided value', () => {
          expect(textarea.value).to.eql('some [text](foo "foo") content')
        })
      })
    })

    describe('pressing enter', () => {
      describe('on a line that matches a repeater pattern', () => {
        describe('that has no custom repeater function', () => {
          beforeEach(() => {
            textarea.value = '- some text content'
            textarea.selectionStart = textarea.value.length

            textarea.dispatchEvent(inputEvent('keydown', {keyCode: 13}))
          })

          it('reproduces the pattern on the next line', () => {
            expect(textarea.value).to.eql('- some text content\n- ')
          })
        })

        describe('that has a repeater function', () => {
          beforeEach(() => {
            textarea.value = '1. some text content'
            textarea.selectionStart = textarea.value.length

            textarea.dispatchEvent(inputEvent('keydown', {keyCode: 13}))
          })

          it('calls the repeater function', () => {
            expect(textarea.value).to.eql('1. some text content\n2. ')
          })
        })
      })

      describe('on a normal line', () => {
        beforeEach(() => {
          textarea.value = '\nsome text content'
          textarea.selectionStart = textarea.value.length

          textarea.dispatchEvent(inputEvent('keydown', {keyCode: 13}))
        })

        it('does not insert anything', () => {
          expect(textarea.value).to.eql('\nsome text content')
        })
      })
    })
  })
})
