"use strict";

import { datadogLogs } from "@datadog/browser-logs";

datadogLogs.init({
  clientToken: "pub43c12e5c173400e3670335f5dd0497ca",
  site: "datadoghq.com",
  forwardErrorsToLogs: true,
  sampleRate: 100,
});
