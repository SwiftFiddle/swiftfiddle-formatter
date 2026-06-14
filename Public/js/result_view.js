"use strict";

import { EditorView, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
  StreamLanguage,
  syntaxHighlighting,
  bracketMatching,
} from "@codemirror/language";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { cm5HighlightStyle, baseTheme } from "./cm_theme.js";

export function initResultView(textarea, statusbar) {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.selectionSet || update.docChanged) {
      const head = update.state.selection.main.head;
      const line = update.state.doc.lineAt(head);
      statusbar.textContent = `Ln ${line.number}, Col ${head - line.from + 1}`;
    }
  });

  const extensions = [
    lineNumbers(),
    StreamLanguage.define(swift),
    syntaxHighlighting(cm5HighlightStyle),
    bracketMatching(),
    EditorState.readOnly.of(true),
    EditorView.contentAttributes.of({ "aria-label": "Result Pane" }),
    updateListener,
    baseTheme,
  ];

  textarea.style.display = "none";
  const view = new EditorView({
    state: EditorState.create({ doc: "", extensions }),
  });
  // Keep the editor above the status bar by inserting it where the textarea was,
  // instead of appending it to the end of the container.
  textarea.parentNode.insertBefore(view.dom, textarea);

  return {
    view,
    setValue(text) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
      });
    },
  };
}
