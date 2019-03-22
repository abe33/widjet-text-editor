import widgets from 'widjet';
import {asArray, when} from 'widjet-utils';
import {CompositeDisposable, DisposableEvent} from 'widjet-disposables';

import {collectMatches, wrapSelection, lineAtCursor, insertText} from './utils';
import utils from './utils';
import KeyStroke from './key-stroke';
import Markdown from './markdown';

export {Markdown, KeyStroke};

const escapeRegExp = (s) => s.replace(/[$^\[\]().+?*]/g, '\\$1');

const eachPair = (o, block) => { for (let k in o) { block(k, o[k]); } };

widgets.define('text-editor', (options) => {
  const collectTokens = options.collectTokens || ((tokens) => {
    return new Promise((resolve) => {
      resolve(tokens.reduce((memo, token) => {
        memo[token] = window.prompt(token.replace('$', ''));
        return memo;
      }, {}));
    });
  });

  return (el) => {
    const textarea = el.querySelector('textarea');
    const keystrokes = [];
    const wrapButtons = asArray(el.querySelectorAll('[data-wrap]'));
    const nodesWithRepeater = el.querySelectorAll('[data-next-line-repeater]');
    const repeaters = asArray(nodesWithRepeater).map((n) => {
      const s = n.getAttribute('data-next-line-repeater');
      if (options[s]) {
        return options[s];
      } else {
        return [
          (line) => line.match(new RegExp(`^${escapeRegExp(s)}`)),
          (line) => s,
        ];
      }
    });
    repeaters.push([a => true, a => undefined]);

    const repeater = when(repeaters);

    const subscriptions = new CompositeDisposable();

    wrapButtons.forEach((button) => {
      const wrap = button.getAttribute('data-wrap');

      if (button.hasAttribute('data-keystroke')) {
        keystrokes.push(KeyStroke.parse(button.getAttribute('data-keystroke'), button));
      }

      subscriptions.add(new DisposableEvent(button, 'click', (e) => {
        textarea.focus();

        if (options[wrap]) {
          insertText(textarea, ...options[wrap](textarea, utils));
        } else {
          defaultWrap(textarea, wrap);
        }

        widgets.dispatch(textarea, 'input');
        widgets.dispatch(textarea, 'change');
      }));
    });

    if (keystrokes.length > 0) {
      subscriptions.add(new DisposableEvent(textarea, 'keydown', (e) => {
        const match = keystrokes.filter(ks => ks.matches(e))[0];

        if (match) {
          e.preventDefault();
          widgets.dispatch(match.trigger, 'click');
        }

        if (e.keyCode === 13) {
          checkLineRepeater(e, textarea, repeater);
        }
      }));
    }

    return subscriptions;
  };

  function defaultWrap(textarea, wrap) {
    const [start, end] = wrap.replace(/\\\|/g, '[__PIPE__]').split('|').map(s => s.replace(/\[__PIPE__\]/g, '|'));
    const tokens = collectMatches(wrap, /\$\w+/g);

    if (tokens.length) {
      let newStart = start;
      let newEnd = end;

      collectTokens(tokens).then((results) => {
        eachPair(results, (token, value) => {
          const re = new RegExp(token.replace('$', '\\$'), 'g');
          newStart = newStart.replace(re, value);
          newEnd = newEnd.replace(re, value);
        });

        wrapSelection(textarea, newStart, newEnd);
      });
    } else {
      wrapSelection(textarea, start, end);
    }
  }
});

function checkLineRepeater(event, textarea, repeater) {
  const line = lineAtCursor(textarea);
  const next = line && repeater(line);

  if (next) {
    event.preventDefault();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    insertText(textarea, start, end, `\n${next}`);
    textarea.selectionEnd = end + next.length + 1;
    widgets.dispatch(textarea, 'input');
    widgets.dispatch(textarea, 'change');
  }
}
