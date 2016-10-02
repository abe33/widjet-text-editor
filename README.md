# widjet-text-editor [![Build Status](https://travis-ci.org/abe33/widjet-text-editor.svg?branch=master)](https://travis-ci.org/abe33/widjet-text-editor) [![codecov](https://codecov.io/gh/abe33/widjet-text-editor/branch/master/graph/badge.svg)](https://codecov.io/gh/abe33/widjet-text-editor)

A simple text editor widget for [widjet](https://github.com/abe33/widjet)

## Install

```sh
npm install widjet-text-editor --save
```

## Usage

```js
import widgets from 'widjet'
import 'widjet-text-editor'

widgets('text-editor', '.text-editor', {on: 'load'})
```

```html
<div class='text-editor'>
  <button data-wrap='**|**'
          data-keystroke='ctrl-b'>Bold</button>

  <button data-wrap='- |'
          data-keystroke='ctrl-l'
          data-next-line-repeater='- '>Unordered List</button>

  <textarea></textarea>
</div>
```

The `text-editor` widget looks for a `textarea` in its target and will build controls based on the action descriptors provided in data attributes.

Three types of controls can be defined:

- wrapping patterns, defined using the `data-wrap` attribute. It's basically a string with a `|` character marking the cursor position. When executed, the action will wrap the current selection in the textarea with that string. For instance, if the pattern is `_|_` and the word `foo` is selected, the result will be `_foo_`. The initial selection is preserved at the end of the operation.
If you want to escape a `|` character in your pattern so that it is not used as a cursor mark, prefix it with `\\`.
- keystrokes, defined using the `data-keystroke` attribute, allow to trigger an action using a keyboard shortcut when the `textarea` has the focus. Keystrokes are defined using a string such as `ctrl+a` of `shift-c`. Obviously, as we are in a browser context, many keyboard shortcuts aren't available as they are already used by the browser or the system.
- next line repeaters, defined using the `data-next-line-repeater` attribute, allow a pattern to be repeated on the new line when pressing enter. For instance, in the example above, if the cursor is on a line that starts with `- `, pressing the enter key will make the new line also prefixed with `- `.

## Markdown Utility

```html
<div class='text-editor'>
  <button data-wrap='**|**'
          data-keystroke='ctrl-b'>Bold</button>

  <button data-wrap='*|*'
          data-keystroke='ctrl-i'>Italic</button>

  <button data-wrap='[|]($url "$title")'
          data-keystroke='ctrl-shift-a'>Link</button>

  <button data-wrap='![|]($url)'
          data-keystroke='ctrl-shift-i'>Image</button>

  <button data-wrap='blockquote'
          data-keystroke='ctrl-b'
          data-next-line-repeater='> '>Blockquote</button>

  <button data-wrap='codeBlock'
          data-keystroke='ctrl-k'
          data-next-line-repeater='    '>Code Block</button>

  <button data-wrap='unorderedList'
          data-keystroke='ctrl-u'
          data-next-line-repeater='- '>Unordered List</button>

  <button data-wrap='orderedList'
          data-keystroke='ctrl-o'
          data-next-line-repeater='repeatOrderedList'>Ordered List</button>

  <textarea></textarea>
</div>
```

```js
import widgets from 'widjet'
import {Markdown} from 'widjet-text-editor'

widgets('text-editor', '.text-editor', {
  on: 'load',

  // functions to wrap a selection in markdown blocks
  blockquote: Markdown.blockquote,
  codeBlock: Markdown.codeBlock,
  unorderedList: Markdown.unorderedList,
  orderedList: Markdown.orderedList,

  // function to increment automatically the list bullet in ordered lists
  repeatOrderedList: Markdown.repeatOrderedList
})
```
