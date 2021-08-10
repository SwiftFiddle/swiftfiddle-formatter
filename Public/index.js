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
  fontSize: "9.5pt",
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
editor.clearSelection();

const result = ace.edit("result-container");
result.setTheme("ace/theme/xcode");
result.session.setMode("ace/mode/swift");
result.$blockScrolling = Infinity;
result.setOptions({
  tabSize: 2,
  useSoftTabs: true,
  autoScrollEditorIntoView: true,
  fontFamily: "Menlo,sans-serif,monospace",
  fontSize: "9.5pt",
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

    result.clearSelection();
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
