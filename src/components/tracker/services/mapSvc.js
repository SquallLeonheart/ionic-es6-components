import {MapData} from '../../../utils/MapData';

const mapSvc = {
  getTrack: function (data) {
    if (data.bounds) {
      return MapData.get('/api/map/track?bounds=' + data.bounds);
    }
  },

  getGeo: function () {
    return MapData.get('/api/geoip');
  },

  getPhotos: function (location) {
    return MapData.post('/api/instagram/search', location);
  },

  saveTrack: function (data) {
    return MapData.post('/api/map/track', data);
  }
};

export default mapSvc;
