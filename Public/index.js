"use strict";

import { init, trackPages } from "insights-js";
init("XkJsfa5KasGf9W_8");
trackPages();

import "./scss/default.scss";
import "./css/common.css";

import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";

import CodeMirror from "codemirror";
import "codemirror/mode/swift/swift";
import "codemirror/addon/display/panel";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/trailingspace";
import "codemirror/addon/lint/lint";

import "./js/logger.js";
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

const editor = initEditor(
  document.getElementById("editor-container"),
  document.getElementById("editor-statusbar")
);

editor.setValue(Defaults.code);
editor.clearHistory();
editor.focus();
editor.setCursor({ line: editor.lastLine() + 1, ch: 0 });

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

    editor.setOption("lint", {
      getAnnotations: () => {
        const message = response.lintMessage;
        const matches = message.matchAll(
          /.+\/<stdin>:(\d+):(\d+): (error|warning|note): ([\s\S]*?)\n*(?=(?:\/|$))/gi
        );
        return [...matches].map((match) => {
          const row = +match[1] - 1; // 0 origin
          const column = +match[2];
          const text = match[4];
          const severity = match[3];

          return {
            from: CodeMirror.Pos(row, column),
            to: CodeMirror.Pos(row, column + 1),
            message: text,
            severity: severity,
          };
        });
      },
    });

    if (response.error) {
      Snackbar.alert(response.error);
    }
  }
};

const updateOnTextChange = debounce(() => {
  sendFormatRequest();
}, 400);
editor.on("change", () => {
  updateOnTextChange();
});

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
  editor.setValue("");
  editor.clearHistory();
  resultView.setValue("");
  resultView.clearHistory();
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
