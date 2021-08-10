"use strict";

import "./scss/default.scss";
import "./css/common.css";
import "codemirror/lib/codemirror.css";

import "./js/icon.js";

import { Tooltip } from "bootstrap";
import { SwiftFormat } from "./js/swift_format.js";
import { debounce } from "./js/debounce.js";

import CodeMirror from "codemirror";
import "codemirror/mode/swift/swift";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/trailingspace";

var editor = CodeMirror.fromTextArea(
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
  }
);
editor.setSize("100%", "100%");

[].slice
  .call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  .map((trigger) => {
    return new Tooltip(trigger);
  });

editor.setValue(`        struct ShippingAddress : Codable  {
 var recipient: String
  var streetAddress : String
   var locality :String
    var region   :String;var postalCode:String
    var country:String

    init(     recipient: String,        streetAddress: String,
locality: String,region: String,postalCode: String,country:String               )
{
    self.recipient = recipient
    self.streetAddress = streetAddress
        self.locality  = locality
    self.region        = region;self.postalCode=postalCode
        guard country.count == 2, country == country.uppercased() else { fatalError("invalid country code") }
    self.country=country}}

let applePark = ShippingAddress(recipient:"Apple, Inc.", streetAddress:"1 Apple Park Way", locality:"Cupertino", region:"CA", postalCode:"95014", country:"US")
`);
editor.clearHistory();
editor.focus();
editor.setCursor({ line: editor.lastLine() + 1, ch: 0 });

var result = CodeMirror.fromTextArea(
  document.getElementById("result-container"),
  {
    mode: "swift",
    lineNumbers: true,
    lineWrapping: false,
    readOnly: true,
    screenReaderLabel: "Result Pane",
    matchBrackets: true,
    showTrailingSpace: true,
  }
);
result.setSize("100%", "100%");

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
    if (response.output) {
      result.setValue(response.output);
    } else {
      result.setValue(response.original);
    }

    if (response.error) {
      console.log(response.error);
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

    listItem.parentNode.previousElementSibling.innerText =
      listItem.querySelector(".dropdown-item").innerText;

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

function sendFormatRequest() {
  document.getElementById("run-button-icon").classList.add("d-none");
  document.getElementById("run-button-spinner").classList.remove("d-none");
  setTimeout(() => {
    document.getElementById("run-button-icon").classList.remove("d-none");
    document.getElementById("run-button-spinner").classList.add("d-none");
  }, 600);

  formatterService.format({
    code: editor.getValue(),
    configuration: buildConfiguration(),
  });
}

function buildConfiguration() {
  const configuration = {};

  [...form.getElementsByTagName("input")].forEach((input) => {
    if (input.id === "indentationCount") {
      if (input.value) {
        const indent = document.getElementById("indentation").innerText;
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
