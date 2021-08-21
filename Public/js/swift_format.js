"use strict";

import { datadogLogs } from "@datadog/browser-logs";

export class SwiftFormat {
  constructor() {
    this.connection = this.createConnection(this.endpoint());

    this.onconnect = () => {};
    this.onready = () => {};
    this.onresponse = () => {};
  }

  get isReady() {
    return this.connection.readyState === 1;
  }

  format(request) {
    const encoder = new TextEncoder();
    this.connection.send(encoder.encode(JSON.stringify(request)));
  }

  createConnection(endpoint) {
    if (
      this.connection &&
      (this.connection.readyState === 0 || this.connection.readyState === 1)
    ) {
      return this.connection;
    }

    const connection = new WebSocket(endpoint);
    connection.bufferType = "arraybuffer";

    connection.onopen = () => {
      this.onconnect();
      this.onready();

      document.addEventListener("visibilitychange", () => {
        switch (document.visibilityState) {
          case "hidden":
            break;
          case "visible":
            this.connection = this.createConnection(connection.url);
            break;
        }
      });
    };

    connection.onclose = (event) => {
      if (event.code !== 1006) {
        return;
      }
      setTimeout(() => {
        this.connection = this.createConnection(connection.url);
      }, 1000);
    };

    connection.onerror = (event) => {
      datadogLogs.logger.error("swift-format websocket error", event);
      connection.close();
    };

    connection.onmessage = (event) => {
      if (event.data.trim()) {
        this.onresponse(JSON.parse(event.data));
      }
    };
    return connection;
  }

  endpoint() {
    let endpoint;
    if (window.location.protocol === "https:") {
      endpoint = "wss:";
    } else {
      endpoint = "ws:";
    }
    endpoint += "//" + window.location.host;
    endpoint += window.location.pathname + "api/ws";
    return endpoint;
  }
}
