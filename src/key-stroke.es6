export default class KeyStroke {
  static parse (str, button) {
    const strokes = str.split(/-|\+/)
    const key = strokes.pop()
    const modifiers = {
      ctrl: false,
      shift: false,
      alt: false,
      meta: false
    }

    strokes.forEach((stroke) => modifiers[stroke.toLowerCase()] = true)

    return new KeyStroke(key, modifiers, button)
  }
  constructor (key, modifiers, trigger) {
    this.key = key
    this.modifiers = modifiers
    this.trigger = trigger
  }
  matches (event) {
    const key = event.char || event.key || String.fromCharCode(event.keyCode)

    return key === this.key &&
           event.ctrlKey === this.modifiers.ctrl &&
           event.shiftKey === this.modifiers.shift &&
           event.altKey === this.modifiers.alt &&
           event.metaKey === this.modifiers.meta
  }
}
