"use strict";

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

import { Popover, Tooltip } from "bootstrap";
import { SwiftFormat } from "./js/swift_format.js";
import { Snackbar } from "./js/snackbar.js";
import { Defaults } from "./js/defaults.js";
import { debounce } from "./js/debounce.js";
import { Configuration } from "./js/configuration.js";

const editor = CodeMirror.fromTextArea(
  document.getElementById("editor-container"),
  {
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
  }
);
editor.setSize("100%", "100%");

[].slice
  .call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  .map((trigger) => {
    return new Tooltip(trigger);
  });

editor.setValue(Defaults.code);
editor.clearHistory();
editor.focus();
editor.setCursor({ line: editor.lastLine() + 1, ch: 0 });

const result = CodeMirror.fromTextArea(
  document.getElementById("result-container"),
  {
    mode: "swift",
    lineNumbers: true,
    lineWrapping: false,
    readOnly: true,
    screenReaderLabel: "Result Pane",
    matchBrackets: true,
    showTrailingSpace: true,
    rulers: [{ color: "#adb5bd", column: 80, lineStyle: "solid", width: 1 }],
  }
);
result.setSize("100%", "100%");

document.getElementById("clear-button").classList.remove("disabled");

const aboutButton = document.getElementById("about-button");
const popoverContent = document.getElementById("about-popover");
const popover = new Popover(aboutButton, {
  title: "",
  trigger: "manual",
  html: true,
  content: popoverContent,
  container: "body",
});

let endpoint;
if (window.location.protocol === "https:") {
  endpoint = "wss:";
} else {
  endpoint = "ws:";
}
endpoint += "//" + window.location.host;
endpoint += window.location.pathname + "/api/ws";

const formatterService = new SwiftFormat(endpoint);
formatterService.onready = () => {
  document.getElementById("run-button").classList.remove("disabled");
  sendFormatRequest();
};

formatterService.onresponse = (response) => {
  if (response) {
    if (response.output.trim()) {
      result.setValue(response.output);
    } else {
      result.setValue(response.original);
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
editor.on("change", (change, editor) => {
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
  result.setValue("");
  result.clearHistory();
});

aboutButton.addEventListener("show.bs.popover", () => {
  popoverContent.classList.remove("d-none");
});

aboutButton.addEventListener("click", (event) => {
  console.log(popover);
  popover.toggle();
  event.stopPropagation();
});

document.body.addEventListener("click", (event) => {
  if (event.target !== aboutButton && !event.target.closest(".popover")) {
    popover.hide();
  }
});

document.getElementById("reset-config-button").addEventListener("click", () => {
  resetConfiguration();
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

function buildConfiguration() {
  const configuration = JSON.parse(JSON.stringify(Configuration.default));

  [...form.getElementsByTagName("input")].forEach((input) => {
    if (input.id === "indentationCount") {
      if (input.value) {
        const indent = document.getElementById("indentation").textContent;
        if (indent) {
          const indentation = {};
          indentation[indent.toLowerCase()] = parseInt(input.value);
          configuration["indentation"] = indentation;
        }
      }
    } else if (input.type === "checkbox") {
      configuration[input.id] = input.checked;
    } else {
      if (input.value) {
        configuration[input.id] = parseInt(input.value);
      }
    }
  });

  const accessLevel = document.getElementById(
    "fileScopedDeclarationPrivacy"
  ).textContent;

  configuration["fileScopedDeclarationPrivacy"] = { accessLevel: accessLevel };

  return configuration;
}

function resetConfiguration() {
  const configuration = JSON.parse(JSON.stringify(Configuration.default));

  [...form.getElementsByTagName("input")].forEach((input) => {
    if (input.id === "indentationCount") {
      input.value = null;
      document.getElementById("indentation").textContent = "Spaces";
    } else if (input.type === "checkbox") {
      if (configuration[input.id]) {
        input.checked = configuration[input.id];
      } else {
        input.checked = configuration.rules[input.id];
      }
    } else {
      input.value = null;
    }
  });

  document.getElementById("fileScopedDeclarationPrivacy").textContent =
    "private";

  document.querySelectorAll(".dropdown-list-item").forEach((listItem) => {
    for (let sibling of listItem.parentNode.children) {
      sibling.classList.remove("active-tick");
    }
    for (let sibling of listItem.parentNode.children) {
      for (let child of sibling.children) {
        if (child.textContent == "Spaces" || child.textContent == "private") {
          sibling.classList.add("active-tick");
        }
      }
    }
  });

  sendFormatRequest();
}
