# widjet-text-editor [![Build Status](https://travis-ci.org/abe33/widjet-text-editor.svg?branch=master)](https://travis-ci.org/abe33/widjet-text-editor) [![codecov](https://codecov.io/gh/abe33/widjet-text-editor/branch/master/graph/badge.svg)](https://codecov.io/gh/abe33/widjet-text-editor)

A simple text editor widget for [widjet](https://github.com/abe33/widjet). **It is not a WYSIWYG editor, just an utility to manipulate text in a text area.**

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

1. wrapping patterns, defined using the `data-wrap` attribute. It's basically a string with a `|` character marking the cursor position. When executed, the action will wrap the current selection in the textarea with that string. For instance, if the pattern is `_|_` and the word `foo` is selected, the result will be `_foo_`. The initial selection is preserved at the end of the operation.
If you want to escape a `|` character in your pattern so that it is not used as a cursor mark, prefix it with `\\`.
2. key strokes, defined using the `data-keystroke` attribute, allow to trigger a wrapping action using a keyboard shortcut when the `textarea` has the focus. Keystrokes are defined using a string such as `ctrl+a` of `shift-c`. Obviously, as we are in a browser context, many keyboard shortcuts aren't available as they are already used by the browser or the system.
3. next line repeaters, defined using the `data-next-line-repeater` attribute, allow a pattern to be repeated on the new line when pressing enter. For instance, in the example above, if the cursor is on a line that starts with `- `, pressing the enter key will make the new line also prefixed with `- `.

These are for the basics, but sometimes you want more control about how you wrap a selection or how you repeat a pattern line after line.

A typical example is with ordered list. When the selection spans only a part of the current line, running the wrapping action should prefix the whole line and not just the selected part. And when pressing enter, the next line bullet number should have been incremented.

For that purpose, instead of a using pattern in the `data-wrap` and `data-next-line-repeater` attributes, you can pass the name of a property defined on the options object passed to the widget.

### Custom Wrapper Function

The value for a custom `data-wrap` must be a function with the following signature:

```js
wrapper = (textarea, utils) => [start:Number, end:Number, String]
```

It receives the target textarea and an `utils` object with some functions to manipulate the textarea value and must returns an array with the start and end positions of insertion and the string to insert.

#### Utilities

The `utils` object passed to the wrapper function contains the following functions:

##### scanLines

```js
scanLines = (func) => (textarea) => *
// where
func = ({textarea, line, lineIndex, charIndex}) => *
```

The `scanLines` function is used to generate a function that iterates over the lines of the textarea's value. Whenever the `func` function returns a value, that value is returned by the generated function and the scan is stopped.

The `lineAtCursor` and `lineEndIndexAtCursor` are built using this function.

##### lineAtCursor

```js
lineAtCursor = (textarea) => String
```

Returns the whole line content where the textarea's `selectionStart` lies in.

##### lineStartIndexAtCursor

```js
lineStartIndexAtCursor = (textarea) => Number
```

Returns the index of the first char of the line where the textarea's `selectionStart` lies in.


##### lineEndIndexAtCursor

```js
lineEndIndexAtCursor = (textarea) => Number
```

Returns the index of the last char of the line where the textarea's `selectionStart` lies in.

##### wholeLinesAtCursor

```js
wholeLinesAtCursor = (textarea) => [start:Number, end:Number, String]
```

Returns the start and end position of the lines spanned by the textarea's selection, as well as the text of these lines.

##### patchLines

```js
patchLines = (string, func) => String
// where
func = (line, index) => String
```

Iterates over all the lines in `string` and replaces them with the value returned by `func`.

### Custom Repeaters

Repeaters are a bit more complex to setup that wrapper. A repeater is an array containing two functions. The first function is the predicate that is used to determine whether the repeater can be applied to the current line while the second function is used to compute the prefix for the new line.

Let's take the ordered list implmentation provided by the widget as an example:

```js
repeatOrderedList = [
  (line) => line.match(/^\d+\. /),
  (line) => `${parseInt(line.match(/^\d+/)[0], 10) + 1}. `
]
```

The first function checks whether the line starts with a number followed by a dot and the second parses the number value of the current bullet then increment it by one and returns it followed by a dot and a space.

## Markdown Utility

The widget also provides an object that offers implementation for common Markdown constructs such as lists, links and images, or inline styles.

You can find below a basic HTML skeleton of a Markdown editor as well as the widget setup to use.

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
