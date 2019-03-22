import expect from 'expect.js';
import jsdom from 'mocha-jsdom';
import sinon from 'sinon';

import {
  lineAt, lineAtCursor,
  lineStartIndexAt, lineEndIndexAt,
  lineStartIndexAtCursor, lineEndIndexAtCursor,
  wholeLinesAtCursor, wholeLinesContaining,
  patchLines,
} from '../src/utils';

describe('utils', () => {
  jsdom({url: 'http://localhost'});

  let textarea;

  beforeEach(() => {
    textarea = document.createElement('textarea');
    textarea.value = '1 some text content\n2 some text content\n3 some text content';
    textarea.selectionStart = 27;
    textarea.selectionEnd = 31;
  });

  describe('lineAt()', () => {
    it('returns the line that contains the specified char index', () => {
      expect(lineAt(textarea, -1)).to.be(undefined);
      expect(lineAt(textarea, 0)).to.eql('1 some text content');
      expect(lineAt(textarea, 19)).to.eql('1 some text content');
      expect(lineAt(textarea, 20)).to.eql('2 some text content');
      expect(lineAt(textarea, 39)).to.eql('2 some text content');
      expect(lineAt(textarea, 40)).to.eql('3 some text content');
      expect(lineAt(textarea, 59)).to.eql('3 some text content');
      expect(lineAt(textarea, 80)).to.be(undefined);
    });
  });

  describe('lineStartIndexAt()', () => {
    it('returns the start char index of the line that contains the specified char index', () => {
      expect(lineStartIndexAt(textarea, -1)).to.be(undefined);
      expect(lineStartIndexAt(textarea, 0)).to.eql(0);
      expect(lineStartIndexAt(textarea, 19)).to.eql(0);
      expect(lineStartIndexAt(textarea, 20)).to.eql(20);
      expect(lineStartIndexAt(textarea, 39)).to.eql(20);
      expect(lineStartIndexAt(textarea, 40)).to.eql(40);
      expect(lineStartIndexAt(textarea, 59)).to.eql(40);
      expect(lineStartIndexAt(textarea, 80)).to.be(undefined);
    });
  });

  describe('lineEndIndexAt()', () => {
    it('returns the end char index of the line that contains the specified char index', () => {
      expect(lineEndIndexAt(textarea, -1)).to.be(undefined);
      expect(lineEndIndexAt(textarea, 0)).to.eql(19);
      expect(lineEndIndexAt(textarea, 19)).to.eql(19);
      expect(lineEndIndexAt(textarea, 20)).to.eql(39);
      expect(lineEndIndexAt(textarea, 39)).to.eql(39);
      expect(lineEndIndexAt(textarea, 40)).to.eql(59);
      expect(lineEndIndexAt(textarea, 59)).to.eql(59);
      expect(lineEndIndexAt(textarea, 80)).to.be(undefined);
    });
  });

  describe('wholeLinesContaining()', () => {
    it('returns the bounds of the lines containing the passed-in coordinate', () => {
      expect(wholeLinesContaining(textarea, 10)).to.eql([
        0, 19, '1 some text content',
      ]);

      expect(wholeLinesContaining(textarea, 10, 22)).to.eql([
        0, 39, '1 some text content\n2 some text content',
      ]);
    });
  });

  describe('patchLines()', () => {
    it('calls the block for each line of the string', () => {
      const spy = sinon.spy(() => 'foo');

      const res = patchLines(textarea.value, spy);

      expect(spy.callCount).to.eql(3);
      expect(res).to.eql('foo\nfoo\nfoo');
    });
  });

  describe('lineAtCursor()', () => {
    it('returns the line at start index of the textarea selection', () => {
      expect(lineAtCursor(textarea)).to.eql('2 some text content');
    });
  });

  describe('lineStartIndexAtCursor()', () => {
    it('returns the start index of the line that contains the textarea selection start', () => {
      expect(lineStartIndexAtCursor(textarea)).to.eql(20);
    });
  });

  describe('lineEndIndexAtCursor()', () => {
    it('returns the start index of the line that contains the textarea selection start', () => {
      expect(lineEndIndexAtCursor(textarea)).to.eql(39);
    });
  });

  describe('wholeLinesAtCursor()', () => {
    it('returns the bounds of the lines containing the textarea selection', () => {
      expect(wholeLinesAtCursor(textarea)).to.eql([
        20, 39, '2 some text content',
      ]);
    });
  });
});
