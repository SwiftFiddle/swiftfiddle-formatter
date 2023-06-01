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
  editor.setSize("100%", `calc(100% - 18px)`);

  editor.on("cursorActivity", () => {
    const cursor = editor.getCursor();
    const line = cursor.line + 1;
    const col = cursor.ch + 1;
    statusbar.textContent = `Ln ${line}, Col ${col}`;
  });

  return editor;
}
