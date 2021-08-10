"use strict";

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://4e7c3a242df04871977214a4e6263494@o938512.ingest.sentry.io/5901149",
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});
