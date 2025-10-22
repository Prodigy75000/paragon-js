export class Input {
  constructor() {
    /** @type {function(string):void} */
    this.onAction = null;
    // Keyboard mappings
    this.keyMap = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      Enter: "CONFIRM",
      Escape: "CANCEL",
      KeyN: "NEW",
      KeyL: "LOAD",
      KeyO: "OPTIONS",
      KeyC: "INTERACT",
    };
    // Attach event listeners
    window.addEventListener("keydown", (e) => this.handleKey(e));
  }
  // Handle keydown events
  handleKey(event) {
    const action = this.keyMap[event.code];
    if (action && this.onAction) {
      this.onAction(action);
      event.preventDefault();
    }
  }
}
