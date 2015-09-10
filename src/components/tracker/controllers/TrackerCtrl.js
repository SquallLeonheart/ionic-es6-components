'use strict';

import _ from 'lodash';

import MapStore from '../../../stores/MapStrore';
import MapActions from '../../../actions/MapActions';
import MapData from '../../../utils/MapData';
const mapSvc = {
  getTrack: function (data) {
    if (data.bounds) {
      return MapData.get('/api/map/track?bounds=' + data.bounds);
    }
  },

  saveTrack: function (data) {
    return MapData.post('/api/map/track', data);
  }
};

export default class TrackerCtrl {
  /*@ngInject*/
  constructor($ionicPopup, $scope) {
    this.$scope = $scope;
    this.$ionicPopup = $ionicPopup;

    this.settings = {
      map: {
        id: 'MapFusion-container',
        defaults: {
          tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          maxZoom: 18,
          minZoom: 3,
          zoomControlPosition: 'topleft'
        },
        currentTrack: {
          color: '#222299',
          opacity: 0.5,
          weight: 3,
          latlngs: []
        },
        tracks: {},
        view: {
          center: [51.505, -0.09],
          zoom: 8
        },
        markers: {},
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        }
      }
    };

    this.control = {
      navigation: {
        active: true,
        activated: false
      },
      pathSave: {
        active: false
      }
    };

    $scope.data = {
      currentPathName: ''
    };

    this.initMap();
  }

  initMap() {
    // Initialize Leaflet Map
    L.Icon.Default.imagePath = 'img';
    this.settings.map.element = document.getElementById(this.settings.map.id);
    if (this.map != null) return;
    this.map = window.L.map(this.settings.map.element, this.settings.map.defaults);


    // Initialize this.settings.map config
    L.tileLayer(this.settings.map.defaults.tileLayer).addTo(this.map);
    MapActions.updateViewCenter(this.settings.map.view);
    this.markers = {
      currentPosition: L.marker(this.settings.map.view.center).addTo(this.map)
    };
    this.currentTrack = window.L.polyline(this.settings.map.currentTrack.latlngs, this.settings.map.currentTrack).addTo(this.map);


    // Set event listeners
    this.state = MapStore.getState();
    MapStore.listen(this._onMapChange.bind(this));
    this._onMapChange(this.state);


    /*// Listen for orientation changes
     this.settings.map.element.style.height = getMapHeight();
     window.addEventListener("orientationchange", () => {
     this.settings.map.element.style.height = getMapHeight();
     //console.log('window.orientation:', window.orientation);
     }, false);*/

    this.map.on('moveend', () => {
      let bounds = this.map.getBounds().toBBoxString();
      mapSvc.getTrack({bounds: bounds}).then((res) => {
        var tracks = res.data;
        if (tracks instanceof Array) {
          for (var key in this.settings.map.tracks) {
            var found = _.findIndex(tracks, (track) => {
              return track.id === key;
            });
            if (found === -1) {
              console.log('removeLayer this.settings.map.tracks ' + key);
              this.map.removeLayer(this.settings.map.tracks[key]);
              delete this.settings.map.tracks[key];
            }
          }

          tracks.forEach((track) => {
            if (this.settings.map.tracks[track.id] === undefined) {
              var lay = L.geoJson(track.geoJSON).addTo(this.map);
              console.log('addLayer ' + track.id);
              this.settings.map.tracks[track.id] = track.geoJSON;
            }
          });
        }
        console.log('res:', res);
      });
    });
  }

  /**
   * Save current track modal window
   */
  showSavePopup() {
    let $scope = this.$scope;
    let savePopup = this.$ionicPopup.confirm({
      template: '<input type="text" ng-model="data.currentPathName">',
      title: 'Enter name for your route',
      subTitle: 'Route will be added to your favorites',
      scope: $scope,
      buttons: [
        {text: 'Cancel'},
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function (e) {
            if (!$scope.data.currentPathName) {
              //don't allow the user to close unless he enters name
              e.preventDefault();
            } else {
              return $scope.data.currentPathName;
            }
          }
        }
      ]
    });

    savePopup.then((title) => {
      if (title) {
        console.log('You are sure', title);
        let bounds = this.currentTrack.getBounds();
        let data = {
          title: title,
          bounds: bounds.toBBoxString().split(','),
          geoJSON: this.currentTrack.toGeoJSON()
        };
        mapSvc.saveTrack(data).then( (res) => {
          console.log('successfully saved', res);
        });
      } else {
        console.log('You are not sure');
      }
    });
  }

;

  toggleWatchPosition() {
    if (this.watchID != null) {
      navigator.geolocation.clearWatch(this.watchID);
      this.watchID = undefined;
      this.control.navigation.activated = false;
      if (this.state.currentTrack.latlngs.length > 2) {
        this.control.pathSave.active = true;
      }
    } else {
      // Get the most accurate position updates available on the device.
      var options = {enableHighAccuracy: true};
      this.watchID = navigator.geolocation
        .watchPosition(position => {
          MapActions.updateCurrentTrack(position);
          console.log('watchPosition', position);
        }, err => {
          console.log('err:', err);
        }, options);

      this.control.navigation.activated = true;
    }
  }

;

  locate() {
    if (this.watchID) {
      this._setCenter(this.state.lastPosition);
    } else {
      var options = {enableHighAccuracy: true};
      navigator.geolocation
        .getCurrentPosition(this._setCenter, function (err) {
          console.log('err:', err);
        },
        options);
    }
  }


  _setCenter(position) {
    MapActions.updateViewCenter([position.coords.latitude, position.coords.longitude]);



    /* var date = new Date(position.timestamp);
     vm.settings.map.markers.now = {
     lat: position.coords.latitude,
     lng: position.coords.longitude,
     message: date.toLocaleTimeString(),
     focus: true,
     draggable: false
     };*/
  }

  _onMapChange(state) {
    this.state = state;
    let { view, lastPosition, currentTrack } = state;
    this.map.setView(view.center, view.zoom);
    this.markers.currentPosition.setLatLng(view.center);

    this.currentTrack.setLatLngs(currentTrack.latlngs);
  }
}
