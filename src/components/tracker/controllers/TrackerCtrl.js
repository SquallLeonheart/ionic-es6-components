import _ from 'lodash';
export default class TrackerCtrl {
  /*@ngInject*/
  constructor(leafletData, $window, $ionicPopup, mapSvc, $log, $scope) {
    let vm = this;
    vm.control = {
      navigation: {
        active: false,
        activated: false
      },
      pathSave: {
        active: false
      }
    };

    $scope.data = {
      currentPathName: ''
    };


    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
      document.addEventListener("deviceready", onDeviceReady, false);
    } else {
      onDeviceReady();
    }


    function routeInfo(pos1, pos2) {
      if (pos1 === undefined || pos2 === undefined) return;
      var latLng1, latLng2, distance, t;
      t = (pos2.timestamp - pos1.timestamp) / 1000 / 60 / 60;
      if (t === 0) return;
      latLng1 = L.latLng(pos1.coords.latitude, pos1.coords.longitude);
      latLng2 = L.latLng(pos2.coords.latitude, pos2.coords.longitude);
      distance = latLng1.distanceTo(latLng2) / 1000;
      $log.debug('distance, time:', distance + ', ' + t);
      $log.debug('speed:', distance / t);
    }

    function setCenter(position) {
      vm.map.center.lat = position.coords.latitude;
      vm.map.center.lng = position.coords.longitude;
      //vm.map.center.zoom = 15;

      var date = new Date(position.timestamp);
      vm.map.markers.now = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        message: date.toLocaleTimeString(),
        focus: true,
        draggable: false
      };
    }

    vm.showSavePopup = function () {
      var savePopup = $ionicPopup.confirm({
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
      savePopup.then(function (title) {
        if (title) {
          $log.debug('You are sure', title);
          leafletData.getPaths().then(function (paths) {
            var currentPath = paths.current;
            if (currentPath === undefined) return;
            var bounds = currentPath.getBounds();
            var data = {
              title: title,
              bounds: bounds.toBBoxString().split(','),
              geoJSON: currentPath.toGeoJSON()
            };
            mapSvc.saveTrack(data).then(function (res) {
              $log.debug('successfully saved', res);
            });
          });


        } else {
          $log.debug('You are not sure');
        }
      });
    };

    vm.saveCurrentPath = function () {
      vm.showSavePopup();
    };

    var prevPosition;
    vm.toggleWatchPosition = function () {
      if (vm.watchID) {
        navigator.geolocation.clearWatch(vm.watchID);
        vm.watchID = undefined;
        vm.control.navigation.activated = false;
        if (vm.map.paths.current.latlngs.length > 2) {
          vm.control.pathSave.active = true;
        }
      } else {
        // Get the most accurate position updates available on the
        // device.
        var options = {enableHighAccuracy: true};
        vm.watchID = navigator.geolocation.watchPosition(function (position) {
            if (prevPosition && position.coords.longitude === prevPosition.coords.longitude && position.coords.latitude === prevPosition.coords.latitude) {
              return;
            }
            setCenter(position);
            vm.map.paths.current.latlngs.push([position.coords.latitude, position.coords.longitude]);

            if (prevPosition) {
              routeInfo(prevPosition, position);
            }
            prevPosition = position;
            $log.debug('watchPosition', position);
          }, function (err) {
            $log.debug('err:', err);
            alert(err);
          },
          options);

        vm.control.navigation.activated = true;
      }


      /*if(window.plugins && window.plugins.backgroundGeoLocation){
       var bgGeo = window.plugins.backgroundGeoLocation;

       var yourAjaxCallback = function(response) {

       bgGeo.finish();
       };
       /!**
       * This callback will be executed every time a geolocation is recorded in the background.
       *!/
       var callbackFn = function(location) {
       $log.debug('location', position);
       if(socket){
       socket.emit('message', {
       id:did,
       lat:location.latitude,
       lng:location.longitude
       });
       }
       // Do your HTTP request here to POST location to your server.
       //
       //
       //yourAjaxCallback.call(this);
       };
       var failureFn = function(error) {
       $log.debug('BackgroundGeoLocation error');
       };
       // BackgroundGeoLocation is highly configurable.
       bgGeo.configure(callbackFn, failureFn,{
       /!*
       url: 'http://only.for.android.com/update_location.json', // <-- Android ONLY:  your server url to send locations to
       params: {
       auth_token: 'user_secret_auth_token',    //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
       foo: 'bar'                              //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
       },
       headers: {                                   // <-- Android ONLY:  Optional HTTP headers sent to your configured #url when persisting locations
       "X-Foo": "BAR"
       },*!/
       desiredAccuracy: 10,
       stationaryRadius: 20,
       distanceFilter: 30,
       notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
       notificationText: 'ENABLED', // <-- android only, customize the text of the notification
       activityType: 'AutomotiveNavigation',
       debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
       stopOnTerminate: true // <-- enable this to clear background location settings when the app terminates
       });
       // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
       bgGeo.start();
       }else{
       alert('Geo not found');
       $log.debug('Background Geo not found');
       }*/
    };

    function onDeviceReady() {
      vm.control.navigation.active = true;
    }

    $scope.$on("$stateChangeSuccess", function () {

      function getMapHeight() {
        return $window.innerHeight - 50 + 'px';
      }

      if (vm.map !== undefined) return;

      vm.map = {
        id: 'mainMap',
        height: getMapHeight(),
        defaults: {
          tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          maxZoom: 18,
          minZoom: 3,
          zoomControlPosition: 'topleft',
          attributionControl: false
        },
        paths: {
          current: {
            color: '#222299',
            opacity: 0.5,
            weight: 3,
            latlngs: []
          }
        },
        tracks: {},
        center: {
          lat: 51.505,
          lng: -0.09,
          zoom: 8
        },
        markers: {},
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        }
      };

      // Listen for orientation changes
      window.addEventListener("orientationchange", function () {
        vm.map.height = getMapHeight();
        //$log.debug('window.orientation:', window.orientation);
      }, false);


      leafletData.getMap('mainMap').then(function (map) {
        map.on('moveend', function () {
          var bounds = map.getBounds().toBBoxString();
          mapSvc.getTrack({bounds: bounds}).then(function (res) {
            var tracks = res.data;
            if (tracks instanceof Array) {
              for (var key in vm.map.tracks) {
                var found = _.findIndex(tracks, function (track) {
                  return track.id === key;
                });
                if (found === -1) {
                  $log.debug('removeLayer vm.map.tracks ' + key);
                  map.removeLayer(vm.map.tracks[key]);
                  delete vm.map.tracks[key];
                }
              }

              tracks.forEach(function (track) {
                if (vm.map.tracks[track.id] === undefined) {
                  var lay = L.geoJson(track.geoJSON).addTo(map);
                  $log.debug('addLayer ' + track.id);
                  vm.map.tracks[track.id] = track.geoJSON;
                }
              });
            }
            $log.debug('res:', res);
          });
        });
      });

    });


    vm.locate = function () {
      if (vm.watchID) {
        setCenter(prevPosition);
      } else {
        var options = {enableHighAccuracy: true};
        navigator.geolocation
          .getCurrentPosition(setCenter, function (err) {
            $log.debug("Location error!");
            $log.debug(err);
          },
          options);
      }
    };
  }
}
