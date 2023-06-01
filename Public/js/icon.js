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
  faHeart,
} from "@fortawesome/pro-solid-svg-icons";
import {
  faToolbox,
  faCheck,
  faClipboard,
  faCheckCircle,
  faCommentAltSmile,
  faAt,
} from "@fortawesome/pro-regular-svg-icons";
import {
  faSlidersV,
  faRulerTriangle,
  faMonitorHeartRate,
} from "@fortawesome/pro-light-svg-icons";
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
  faHeart,

  faToolbox,
  faCheck,
  faClipboard,
  faCheckCircle,
  faCommentAltSmile,
  faAt,

  faSlidersV,
  faRulerTriangle,
  faMonitorHeartRate,

  faSwift,
  faGithub
);
dom.watch();
