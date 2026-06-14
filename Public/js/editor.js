"use strict";

import {
  EditorView,
  keymap,
  lineNumbers,
  highlightTrailingWhitespace,
} from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  StreamLanguage,
  syntaxHighlighting,
  bracketMatching,
} from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { linter, lintGutter } from "@codemirror/lint";
import { cm5HighlightStyle, baseTheme } from "./cm_theme.js";

export function initEditor(textarea, statusbar, onDocChange) {
  const lintSource = new Compartment();
  let diagnostics = [];

  const updateStatus = (state) => {
    const head = state.selection.main.head;
    const line = state.doc.lineAt(head);
    statusbar.textContent = `Ln ${line.number}, Col ${head - line.from + 1}`;
  };

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.selectionSet || update.docChanged) {
      updateStatus(update.state);
    }
    if (update.docChanged) {
      onDocChange();
    }
  });

  const extensions = [
    lineNumbers(),
    history(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      indentWithTab,
    ]),
    StreamLanguage.define(swift),
    syntaxHighlighting(cm5HighlightStyle),
    bracketMatching(),
    closeBrackets(),
    highlightTrailingWhitespace(),
    lintGutter(),
    lintSource.of(linter(() => diagnostics)),
    EditorState.tabSize.of(2),
    EditorView.contentAttributes.of({ "aria-label": "Editor Pane" }),
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
    getValue: () => view.state.doc.toString(),
    setValue(text) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
      });
    },
    reset(text) {
      // Replaces the whole document and discards the undo history.
      view.setState(EditorState.create({ doc: text, extensions }));
      updateStatus(view.state);
    },
    focus: () => view.focus(),
    setCursorToEnd() {
      const end = view.state.doc.length;
      view.dispatch({ selection: { anchor: end } });
    },
    setDiagnostics(next) {
      diagnostics = next;
      // Reconfigure the linter so the new diagnostics are applied immediately.
      view.dispatch({
        effects: lintSource.reconfigure(linter(() => diagnostics)),
      });
    },
  };
}
