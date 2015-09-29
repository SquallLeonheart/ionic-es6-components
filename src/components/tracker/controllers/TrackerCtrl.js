'use strict';

import _ from 'lodash';

import MapStore from '../../../stores/MapStrore';
import MapActions from '../../../actions/MapActions';
import {MapDataUtils} from '../../../utils/MapData';
import MapSvc from '../services/mapSvc';
import SlidesCtrl from '../../slides/SlidesCtrl';

let md = new MapDataUtils();

export default class TrackerCtrl {
  /*@ngInject*/
  constructor($ionicSlideBoxDelegate, $ionicPopup, $scope) {
    this.$scope = $scope;
    this.$ionicPopup = $ionicPopup;
    this.$ionicSlideBoxDelegate = $ionicSlideBoxDelegate;

    this.settings = {
      map: {
        id: 'MapFusion-container',
        defaults: {
          tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          maxZoom: 17,
          minZoom: 12,
          zoomControlPosition: 'topleft',
          attributionControl: false
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
          zoom: 15
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
    this.map = new window.L.map(this.settings.map.element, this.settings.map.defaults);


    // Initialize this.settings.map config
    L.tileLayer(this.settings.map.defaults.tileLayer).addTo(this.map);
    MapSvc.getGeo().then( (geo) => {
      if (geo) {
        let bbox = geo.resourceSets[0].resources[0].bbox;
        //let bbox = geo[0].boundingbox;
        // 'southwest_lng,southwest_lat,northeast_lng,northeast_lat'
        this.map.fitBounds([[bbox[0], bbox[1]],[bbox[2], bbox[3]]] );
        //this.map.fitBounds([[bbox[0], bbox[2]],[bbox[1], bbox[3]]] );
      }
    });
    //this.locate();
    //MapActions.updateViewCenter(this.settings.map.view);


    // Leaflet.Coordinates
    //L.control.coordinates().addTo(this.map);
    //add configured controls
    L.control.coordinates({
      position: "bottomleft",
      decimals: 2,
      decimalSeperator: ",",
      labelTemplateLat: "Lat: {y}",
      labelTemplateLng: "Lng: {x}"
    }).addTo(this.map);
    /*L.control.coordinates({
      position: "topright",
      useDMS: true,
      labelTemplateLat: "N {y}",
      labelTemplateLng: "E {x}",
      useLatLngOrder: true
    }).addTo(this.map);*/

    // Markers
    this.markers = {
      currentPosition: L.marker(this.settings.map.view.center).addTo(this.map)
    };
    // Tracks
    this.currentTrack = window.L.polyline(this.settings.map.currentTrack.latlngs, this.settings.map.currentTrack).addTo(this.map);
    // Photos
    this.photoLayer = L.photo.cluster({spiderfyDistanceMultiplier: 1.2})
      .on('click', (evt) => {
        console.log('click', evt);
        this.showPhotoPopup(evt);
        /*evt.layer.bindPopup(L.Util.template('<img src="{url}"/><p>{caption}</p>', evt.layer.photo), {
         className: 'leaflet-popup-photo',
         minWidth: 400
         }).openPopup();*/
      })
      .on('clusterclick', (evt) => {
        console.log('clusterclick', evt);
        this.showPhotoPopup(evt);
      })

      /*.on('clusterclick', (evt) => {
       evt.preventDefault();
       evt.layer.spiderfy();
       })*/;


    // Set event listeners
    this.state = MapStore.getState();
    MapStore.listen(this._onMapChange.bind(this));
    this._onMapChange(this.state);

    let firstZoom = true;

    this.map.on('zoomend', (evt) => {
      console.log('md.getMapRadius(this.map):', md.getMapRadius(this.map));
      console.log('evt:', evt);
      if (firstZoom) {
        firstZoom = false;
        let squares = md.fillSquare(this.map);
          MapSvc.getPhotos(squares).then((res) => {
            let photos = res.items.map(item => {
              let date = (new Date(item.created_time * 1000)).toLocaleTimeString();
              return {
                lat: item.location.latitude,
                lng: item.location.longitude,
                url: item.images.standard_resolution.url,
                caption: `<i>${date}</i>
                <a href="${item.link}">${item.caption && item.caption.text}</a> `,
                thumbnail: item.images.thumbnail.url,
                video: item.videos && item.videos.standard_resolution.url,
                likes: item.likes,
                user: item.user,
                id: item.id
              }
            });
            //photos = _.filter(photos, (media) => { return media.video != null });
            if (photos.length) {
              //console.log('photos:', photos);
              this.photoLayer.add(photos).addTo(this.map);
              this.map.fitBounds(this.photoLayer.getBounds());
            }
          });
      }
    });

    this.SlidesCtrl = new SlidesCtrl();

    /*setTimeout( function() {
      let slides = ['<div class="swiper-slide" style="background-image:url(http://lorempixel.com/1200/1200/nature/5)"></div>',
        '<div class="swiper-slide" style="background-image:url(http://lorempixel.com/1200/1200/nature/5)"></div>'];

      let thumbnails =
        ['<div class="swiper-slide" style="background-image:url(http://lorempixel.com/1200/1200/nature/5)"></div>',
          '<div class="swiper-slide" style="background-image:url(http://lorempixel.com/1200/1200/nature/5)"></div>'];
      this.SlidesCtrl.setSlides(slides,thumbnails);
    }.bind(this), 5000);*/


  } // ---- initMap END -----

  showPhotoPopup(evt) {
    let $scope = this.$scope;

    let markers,
      slides = [],
      thumbnails = [];
    evt.layer.photo ? markers = [evt.layer] : markers = evt.layer.getAllChildMarkers();
    let clickedIndex = _.findIndex(markers, {_leaflet_id: evt.layer._leaflet_id});

    $scope.slides = {};

    // ES6 destructoring & template strings
    markers.forEach(({photo: {url, thumbnail, caption, video, user, likes, id}}) => {
      $scope.slides[id] = {
        likes: likes
      };
      let mediaTpl = `
      <img src="${url}"/>`;
      if (video && (!!document.createElement('video').canPlayType('video/mp4; codecs=avc1.42E01E,mp4a.40.2'))) {
        mediaTpl = `
        <video autoplay controls poster="${url}"><source src="${video}" type="video/mp4"/></video>`;
      }
      let slideTpl = `
      <a href="https://instagram.com/${user.username}"><img style="width: 40px; height: 40px;" src="${user.profile_picture}"/> ${user.username}</a>
      <button class="button button-icon button-clear ion-ios-heart-outline"> slides['${id}'].likes.count</button>
      ${mediaTpl}
      <p>${caption}</p>
      `;

      slides.push(`
      <div class="swiper-slide">
        ${slideTpl}
      </div>
      `);

      let thumbnailTpl = `<img src="${thumbnail}"/>`;
      thumbnails.push(`
      <div class="swiper-slide">
        ${thumbnailTpl}
      </div>
      `);
    });

    this.SlidesCtrl.setSlides(slides,thumbnails);
    document.querySelector('.swiper-main-container').style.display = 'block';
    window.dispatchEvent(new Event('resize'));

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
        MapSvc.saveTrack(data).then((res) => {
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
