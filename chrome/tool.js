/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { require } = devtools;

const events = require("sdk/event/core");

XPCOMUtils.defineLazyModuleGetter(this, "Promise",
  "resource://gre/modules/Promise.jsm", "Promise");

/**
 * This file has access to the `window` and `document` objects of the add-on's
 * iframe, and is included in tool.xul. This is the add-on's controller.
 */

/**
 * Called when the user select the tool tab.
 *
 * @param Toolbox toolbox
 *        The developer tools toolbox, containing all tools.
 * @param object target
 *        The local or remote target being debugged.
 * @return object
 *         A promise that should be resolved when the tool completes opening.
 */
function startup(toolbox, target) {
  return gController.connect(target);
}

/**
 * Called when the user closes the toolbox or disables the add-on.
 *
 * @return object
 *         A promise that should be resolved when the tool completes closing.
 */
function shutdown() {
  return gController.disconnect();
}


/////////////////////////////////////////////



function CanvasController() {
  this.view = new CanvasView(this);
}

CanvasController.prototype = {
  _target: null,
  _canvasClient: null,

  get target()       { return this._target; },
  get client()       { return this._target.client; },
  get activeTab()    { return this._target.activeTab; },
  get canvasClient() { return this._canvasClient; },

  connect: function (target) {
    if (target.chrome) {
      // No chrome canvas debugging for now.
      return Promise.resolve();
    }

    this._target = target;
    this.view.initialize();

    // FITZGEN TODO
    // target.on("navigate", this._onTabNavigated);
    // target.on("will-navigate", this._onTabNavigated);

    return new Promise((resolve, reject) => {
      this.activeTab.attachCanvas(
        target.form.canvasActor,
        ({ error, message }, canvasClient) => {
          if (error) {
            reject(error + ": " + message);
            return;
          }
          this.canvasClient = canvasClient;
          resolve();
        }
      );
    });
  },

  disconnect: function () {
    if (!this._target) {
      return Promise.resolve();
    }

    this.view.destroy();

    return new Promise((resolve, reject) => {
      this.canvasClient.detach(({ error, message }) => {
        if (error) {
          reject(error + ": " + message);
          return;
        }

        this._target = null;
        resolve();
      });
    });
  },

  onRecord: function (event) {
    this.
  }
};

function CanvasView(controller) {
  this.controller = controller;
}

CanvasView.prototype = {
  initialize: function () {
    this.recordButton = document.getElementById("record");
    this.recordButton.addEventListener("command", this.controller.onRecord, false);
  },

  destroy: function () {
    this.recordButton.removeEventListener("command", this.controller.onRecord, false);
    this.recordButton = null;
  }
};

this.gController = new CanvasController();
