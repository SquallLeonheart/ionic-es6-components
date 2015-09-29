import style from './tracker.scss';
import TrackerCtrl from './controllers/TrackerCtrl';
import template from './partials/map.html';

import 'leaflet/dist/leaflet.css';
import leaflet from 'leaflet';

import 'leaflet.markercluster/dist/leaflet.markercluster-src.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';

import 'Leaflet.Coordinates/dist/Leaflet.Coordinates-0.1.4.src.js';
import 'Leaflet.Coordinates/dist/Leaflet.Coordinates-0.1.4.css';

import './Leaflet.Photo.css';
import './Leaflet.Photo';

export default angular.module('tracker', [])
  .controller('TrackerCtrl', TrackerCtrl)
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
