"use strict";

import { config, library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faPlay,
  faCircleNotch,
  faEraser,
  faCog,
  faExclamationTriangle,
} from "@fortawesome/pro-solid-svg-icons";
import {
  faCheck,
  faRulerTriangle,
  faClipboard,
  faCheckCircle,
  faAt,
} from "@fortawesome/pro-regular-svg-icons";
import { faSlidersV } from "@fortawesome/pro-light-svg-icons";
import { faSwift, faGithub } from "@fortawesome/free-brands-svg-icons";

config.searchPseudoElements = true;
library.add(
  faPlay,
  faCircleNotch,
  faEraser,
  faCog,
  faExclamationTriangle,

  faCheck,
  faRulerTriangle,
  faClipboard,
  faCheckCircle,
  faAt,

  faSlidersV,

  faSwift,
  faGithub
);
dom.watch();
