"use strict";

import CodeMirror from "codemirror";

export function initResultView(container, statusbar) {
  const editor = CodeMirror.fromTextArea(container, {
    mode: "swift",
    lineNumbers: true,
    lineWrapping: false,
    readOnly: true,
    screenReaderLabel: "Result Pane",
    matchBrackets: true,
    showTrailingSpace: true,
  });
  editor.setSize("100%", "100%");

  editor.on("cursorActivity", () => {
    const cursor = editor.getCursor();
    statusbar.textContent = `Ln ${cursor.line}, Col ${cursor.ch}`;
  });

  return editor;
}
