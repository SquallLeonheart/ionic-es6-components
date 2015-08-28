import bootstrap from './components/bootstrap';
import ngtranslate from 'angular-translate';
import 'angular-translate-loader-static-files';
import spinner from './components/spinner/spinner.module';
import menu from './components/menu/menu.module'
import about from './components/about/about.module';
import album from './components/album/album.module';
import tracker from './components/tracker/tracker.module';
import appConfig from './config/app.debug.config.js';


const appModule = module.exports = angular
  .module('app', [
    bootstrap.name,
    ngtranslate,
    spinner,
    menu,
    about,
    album,
    tracker
  ])

  .config(function ($urlRouterProvider, $locationProvider) {
    // fallback route
    //$urlRouterProvider.otherwise('/app/person/me/feed');

    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/tracker');
  })

  .config(function ($logProvider) {
    //enable debug messages
    $logProvider.debugEnabled(true);
  })

  .config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/',
      suffix: '.json'
    });

    $translateProvider.preferredLanguage('en_US');

    $translateProvider.useSanitizeValueStrategy('sanitize');

  })

  .constant('apiEndpoint', appConfig.apiEndpoint);


bootstrap.ionicBootstrap(appModule, global);
