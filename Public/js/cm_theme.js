"use strict";

import { EditorView } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Replicates the syntax colors of CodeMirror 5's default theme ("cm-s-default")
// so the editor keeps the same look it had before the CodeMirror 6 migration.
// The legacy Swift mode emits classic token names which @codemirror/language
// maps to the lezer tags used below.
export const cm5HighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#708" },
  { tag: [t.atom, t.bool, t.url, t.contentSeparator, t.labelName], color: "#219" },
  { tag: t.number, color: "#164" },
  { tag: t.definition(t.variableName), color: "#00f" }, // def
  { tag: t.variableName, color: "#000" },
  { tag: t.special(t.variableName), color: "#05a" }, // variable-2
  { tag: [t.typeName, t.namespace, t.className], color: "#085" }, // type / variable-3
  { tag: t.standard(t.variableName), color: "#30a" }, // builtin
  { tag: t.comment, color: "#a50" },
  { tag: t.string, color: "#a11" },
  { tag: t.special(t.string), color: "#f50" }, // string-2
  { tag: [t.meta, t.modifier], color: "#555" }, // meta / qualifier
  { tag: t.tagName, color: "#170" },
  { tag: t.attributeName, color: "#00c" },
  { tag: t.link, color: "#00c", textDecoration: "underline" },
  { tag: t.invalid, color: "#f00" },
]);

// Matches CodeMirror 5's chrome: white background, light-grey gutter with a
// thin right border, grey line numbers, and the classic selection colors.
export const baseTheme = EditorView.theme({
  "&": {
    backgroundColor: "#fff",
    height: "calc(100% - 18px)",
    color: "#000",
  },
  ".cm-scroller": {
    fontFamily:
      'Menlo, Consolas, "DejaVu Sans Mono", "Ubuntu Mono", monospace',
    fontSize: "12px",
    lineHeight: "1.6",
  },
  ".cm-gutters": {
    backgroundColor: "#f7f7f7",
    color: "#999",
    border: "none",
    borderRight: "1px solid #ddd",
  },
  // CodeMirror 6 draws a dotted focus outline by default; CodeMirror 5 did not.
  "&.cm-focused": { outline: "none" },
  ".cm-cursor": { borderLeftColor: "#000" },
  ".cm-selectionBackground": { backgroundColor: "#d9d9d9" },
  "&.cm-focused .cm-selectionBackground": { backgroundColor: "#d7d4f0" },
});
