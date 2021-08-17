"use strict";

import CodeMirror from "codemirror";

export function initEditor(container, statusbar) {
  const editor = CodeMirror.fromTextArea(container, {
    mode: "swift",
    lineNumbers: true,
    lineWrapping: false,
    tabSize: 2,
    screenReaderLabel: "Editor Pane",
    matchBrackets: true,
    autoCloseBrackets: true,
    showTrailingSpace: true,
    gutters: ["CodeMirror-lint-markers"],
    lint: true,
  });
  editor.setSize("100%", "100%");

  editor.on("cursorActivity", () => {
    const cursor = editor.getCursor();
    statusbar.textContent = `Ln ${cursor.line}, Col ${cursor.ch}`;
  });

  return editor;
}
