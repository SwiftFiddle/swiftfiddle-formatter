"use strict";

import { Popover, Tooltip } from "bootstrap";

const aboutButton = document.getElementById("about-button");
const popoverContent = document.getElementById("about-popover");
const popover = new Popover(aboutButton, {
  title: "",
  trigger: "manual",
  html: true,
  content: popoverContent,
  container: "body",
});

aboutButton.addEventListener("show.bs.popover", () => {
  popoverContent.classList.remove("d-none");
});

aboutButton.addEventListener("shown.bs.popover", () => {
  document.querySelectorAll(".tooltip").forEach((tooltip) => {
    Tooltip.getInstance(tooltip).hide();
  });
});

aboutButton.addEventListener("click", (event) => {
  popover.toggle();
  event.stopPropagation();
});

document.body.addEventListener("click", (event) => {
  if (event.target !== aboutButton && !event.target.closest(".popover")) {
    popover.hide();
  }
});
