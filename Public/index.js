"use strict";

import "./scss/default.scss";

import "./css/common.css";

import "./js/icon.js";
import "./js/about.js";

import { Tooltip } from "bootstrap";
import { SwiftFormat } from "./js/swift_format.js";
import { Snackbar } from "./js/snackbar.js";
import { Defaults } from "./js/defaults.js";
import { buildConfiguration, resetConfiguration } from "./js/configuration.js";
import { initEditor } from "./js/editor.js";
import { initResultView } from "./js/result_view.js";
import { debounce } from "./js/debounce.js";

const updateOnTextChange = debounce(() => {
  sendFormatRequest();
}, 400);

const editor = initEditor(
  document.getElementById("editor-container"),
  document.getElementById("editor-statusbar"),
  updateOnTextChange
);

editor.reset(Defaults.code);
editor.focus();
editor.setCursorToEnd();

const resultView = initResultView(
  document.getElementById("result-container"),
  document.getElementById("result-statusbar")
);

document.getElementById("clear-button").classList.remove("disabled");

const formatterService = new SwiftFormat();
formatterService.onready = () => {
  document.getElementById("run-button").classList.remove("disabled");
  sendFormatRequest();
};

formatterService.onresponse = (response) => {
  if (response) {
    if (response.output.trim()) {
      resultView.setValue(response.output);
    } else {
      resultView.setValue(response.original);
    }

    const doc = editor.view.state.doc;
    // Each diagnostic is a single line: "<stdin>:LINE:COL: severity: message".
    const matches = response.lintMessage.matchAll(
      /<stdin>:(\d+):(\d+): (error|warning|note): (.*)/gi
    );
    const diagnostics = [...matches].map((match) => {
      const lineNumber = Math.min(Math.max(+match[1], 1), doc.lines);
      const column = +match[2];
      const line = doc.line(lineNumber);
      const from = Math.min(line.from + Math.max(column - 1, 0), line.to);
      const to = Math.min(from + 1, line.to);
      // swift-format emits "note"; map it to CodeMirror's "info" severity.
      const severity = match[3] === "note" ? "info" : match[3];

      return { from, to, message: match[4].trim(), severity };
    });
    editor.setDiagnostics(diagnostics);

    if (response.error) {
      Snackbar.alert(response.error);
    }
  }
};

document.querySelectorAll(".dropdown-list-item").forEach((listItem) => {
  listItem.addEventListener("click", () => {
    for (let sibling of listItem.parentNode.children) {
      sibling.classList.remove("active-tick");
    }
    listItem.classList.add("active-tick");

    listItem.parentNode.previousElementSibling.textContent =
      listItem.querySelector(".dropdown-item").textContent;

    sendFormatRequest();
  });
});

const form = document.querySelector("form");
form.addEventListener("input", () => {
  sendFormatRequest();
});

document.getElementById("run-button").addEventListener("click", () => {
  sendFormatRequest();
});

document.getElementById("clear-button").addEventListener("click", () => {
  editor.reset("");
  resultView.setValue("");
});

document.getElementById("reset-config-button").addEventListener("click", () => {
  resetConfiguration();
  sendFormatRequest();
});

if (!navigator.clipboard) {
  document.getElementById("copy-config-button").classList.add("disabled");
}
document.getElementById("copy-config-button").addEventListener("click", () => {
  if (navigator.clipboard) {
    const configuration = buildConfiguration();
    navigator.clipboard.writeText(JSON.stringify(configuration, null, 2));
    Snackbar.info("Copied!");
  }
});

function sendFormatRequest() {
  const value = editor.getValue();
  if (!value.trim()) {
    return;
  }

  document.getElementById("run-button-icon").classList.add("d-none");
  document.getElementById("run-button-spinner").classList.remove("d-none");
  setTimeout(() => {
    document.getElementById("run-button-icon").classList.remove("d-none");
    document.getElementById("run-button-spinner").classList.add("d-none");
  }, 600);

  formatterService.format({
    code: value,
    configuration: buildConfiguration(),
  });
}

[].slice
  .call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  .map((trigger) => {
    return new Tooltip(trigger);
  });
