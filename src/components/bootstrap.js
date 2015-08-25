'use strict';
//var scripts = global.document.getElementsByTagName('script');
//var src = scripts[scripts.length - 1].getAttribute('src');
//global.__webpack_public_path__ = src.substr(0, src.lastIndexOf('/') + 1);

/**
 * Module dependencies
 */
// Add Angular/Ionic dependencies
import 'ionic-sdk/release/js/ionic.bundle';
import templates from './templates';

// Style entry point
import './bootstrap.scss';

var libsModule = module.exports =
  angular.module('common.libs', [
    'ionic',
    templates

  ]);

libsModule.ionicBootstrap = function (module, window, options) {
  if (!window || !window.document) {
    throw new Error('window and document objects required.');
  }

  options = options || {};

  function onDeviceReady() {
    // bootstrap angular app
    (function () {
      angular.element(window.document).ready(function () {
        angular.bootstrap(window.document, [
          module.name
        ]);
      });
    })();
    // remove document deviceready listener
    window.document.removeEventListener('deviceready', onDeviceReady, false);
  }

  function onWindowLoad() {
    if (!(!window.cordova && !window.PhoneGap && !window.phonegap)) {
      // when on device add document deviceready listener
      window.document.addEventListener('deviceready', onDeviceReady, false);

    } else {
      // when on browser trigger onDeviceReady
      onDeviceReady();
    }

    // remove window load listener
    window.removeEventListener('load', onWindowLoad, false);
  }

  // add window load listener
  window.addEventListener('load', onWindowLoad, false);
};
