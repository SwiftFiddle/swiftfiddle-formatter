"use strict";

import { config, library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faPlay,
  faCircleNotch,
  faEraser,
  faCog,
  faUndo,
  faQuestion,
  faExclamationTriangle,
} from "@fortawesome/pro-solid-svg-icons";
import {
  faCheck,
  faClipboard,
  faCheckCircle,
  faAt,
} from "@fortawesome/pro-regular-svg-icons";
import { faSlidersV, faRulerTriangle } from "@fortawesome/pro-light-svg-icons";
import { faSwift, faGithub } from "@fortawesome/free-brands-svg-icons";

config.searchPseudoElements = true;
library.add(
  faPlay,
  faCircleNotch,
  faEraser,
  faCog,
  faUndo,
  faQuestion,
  faExclamationTriangle,

  faCheck,
  faClipboard,
  faCheckCircle,
  faAt,

  faSlidersV,
  faRulerTriangle,

  faSwift,
  faGithub
);
dom.watch();
