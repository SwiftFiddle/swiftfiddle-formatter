"use strict";

import { config, library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faPlay,
  faCircleNotch,
  faEraser,
  faCog,
  faQuestion,
  faExclamationTriangle,
} from "@fortawesome/pro-solid-svg-icons";
import {
  faCheck,
  faClipboard,
  faFileImport,
  faKeyboard,
  faToolbox,
  faCommentAltSmile,
  faCheckCircle,
  faAt,
} from "@fortawesome/pro-regular-svg-icons";
import { faMonitorHeartRate } from "@fortawesome/pro-light-svg-icons";
import { faSwift, faGithub } from "@fortawesome/free-brands-svg-icons";

config.searchPseudoElements = true;
library.add(
  faPlay,
  faCircleNotch,
  faEraser,
  faCog,
  faQuestion,
  faExclamationTriangle,

  faCheck,
  faClipboard,
  faFileImport,
  faKeyboard,
  faToolbox,
  faCommentAltSmile,
  faCheckCircle,
  faAt,

  faMonitorHeartRate,

  faSwift,
  faGithub
);
dom.watch();
