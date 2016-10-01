# widjet-text-editor [![Build Status](https://travis-ci.org/abe33/widjet-text-editor.svg?branch=master)](https://travis-ci.org/abe33/widjet-text-editor) [![codecov](https://codecov.io/gh/abe33/widjet-text-editor/branch/master/graph/badge.svg)](https://codecov.io/gh/abe33/widjet-text-editor)

A drag and drop widget for [widjet](https://github.com/abe33/widjet)

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
  <button data-wrap='**|**' data-key='ctrl-b'></button>
  <button data-wrap='[|]($url)' data-key='ctrl-u'></button>
  <button data-wrap='- |' data-key='ctrl-u' data-next-line-continuation='- '></button>
  <button data-wrap='1. |' data-key='ctrl-o' data-next-line-continuation='orderedList'></button>

  <textarea></textarea>
</div>
```
