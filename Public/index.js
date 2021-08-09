"use strict";

import "./scss/default.scss";
import "./css/common.css";
import "./js/icon.js";

import { Tooltip } from "bootstrap";
import { SwiftFormat } from "./js/swift_format.js";
import { debounce } from "./js/debounce.js";

import * as ace from "ace-builds";
import "ace-builds/src-min-noconflict/mode-swift";
import "ace-builds/src-min-noconflict/theme-xcode";
import "ace-builds/src-min-noconflict/ext-language_tools";

[].slice
  .call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  .map((trigger) => {
    return new Tooltip(trigger);
  });

const editor = ace.edit("editor-container");
editor.setTheme("ace/theme/xcode");
editor.session.setMode("ace/mode/swift");
editor.$blockScrolling = Infinity;
editor.setOptions({
  tabSize: 2,
  useSoftTabs: true,
  autoScrollEditorIntoView: true,
  fontFamily: "Menlo,sans-serif,monospace",
  fontSize: "11pt",
  showInvisibles: false,
  enableAutoIndent: true,
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
  scrollPastEnd: 0.5, // Overscroll
  wrap: "free",
  displayIndentGuides: true,
});
editor.renderer.setOptions({
  showFoldWidgets: false,
  showPrintMargin: false,
});

const result = ace.edit("result-container");
result.setTheme("ace/theme/xcode");
result.session.setMode("ace/mode/swift");
result.$blockScrolling = Infinity;
result.setOptions({
  tabSize: 2,
  useSoftTabs: true,
  autoScrollEditorIntoView: true,
  fontFamily: "Menlo,sans-serif,monospace",
  fontSize: "11pt",
  showInvisibles: false,
  enableAutoIndent: true,
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
  scrollPastEnd: 0.5, // Overscroll
  wrap: "free",
  displayIndentGuides: true,
  readOnly: true,
});
result.renderer.setOptions({
  showFoldWidgets: false,
  showPrintMargin: false,
});

const formatterService = new SwiftFormat(
  "wss://formatter.swiftfiddle.com/api/ws"
);
formatterService.onresponse = (response) => {
  if (response) {
    if (response.output) {
      result.setValue(response.output);
    } else {
      result.setValue(response.original);
    }

    if (response.error) {
      console.log(response.error);
    }

    result.clearSelection();
  }
};

const updateOnTextChange = debounce(() => {
  formatterService.format(editor.getValue());
}, 400);
editor.on("change", (change, editor) => {
  updateOnTextChange(editor);
});
