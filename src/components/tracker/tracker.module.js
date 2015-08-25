import style from './tracker.scss';
import TrackerCtrl from './controllers/TrackerCtrl';
import mapSvc from './services/mapSvc';
import template from './partials/map.html';
import 'leaflet/dist/leaflet.css';
import leaflet from 'leaflet';
import 'angular-leaflet-directive';

export default angular.module('tracker', ['leaflet-directive'])
  .controller('TrackerCtrl', TrackerCtrl)
  .factory('mapSvc', mapSvc)
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.tracker', {
        url: "/tracker",
        views: {
          'menuContent': {
            templateUrl: template,
            controller: "TrackerCtrl as vm"
          }
        }
      })
  })
  .name;
