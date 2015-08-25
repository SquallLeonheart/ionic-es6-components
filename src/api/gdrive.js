var auth = require('../config/gdrive/auth');
var google = require('googleapis');


exports.track = {
  search: function (q, callback) {
    var service = google.drive('v2');
    service.files.list({
      auth: auth.getAuth(),
      q: q
    }, callback);
  },
  save: function (data, callback) {
    //console.log('data:', data);
    var drive = google.drive({version: 'v2', auth: auth.getAuth()});
    drive.files.insert({
      resource: {
        title: data.title,
        mimeType: 'application/vnd.geo+json',
        parents: [/*{"id": "0B4_IPtzUvPlBfm9iR1ozQkhDSVVMampRdFM2amx2b08yaEhiN29ienRDTkd2QmVHbDhYYTg"}*/],
        //properties: [
        //    {key: 'northEastLat', value: data.bounds._northEast.lat},
        //    {key: 'northEastLng', value: data.bounds._northEast.lng},
        //    {key: 'southWestLat', value: data.bounds._southWest.lat},
        //    {key: 'southWestLng', value: data.bounds._southWest.lng}
        //]
      },
      media: {
        mimeType: 'application/vnd.geo+json',
        body: JSON.stringify(data.geoJSON)
        //fs.createReadStream('awesome.png') // read streams are awesome!
      }
    }, callback);
  },
  get: function (id, callback) {
    //console.log('data:', data);
    var drive = google.drive({version: 'v2', auth: auth.getAuth()});
    drive.files.get({
      alt: 'media',
      fileId: id
    }, callback);
  },

  propertiesGet: function (id, callback) {
    var drive = google.drive({version: 'v2', auth: auth.getAuth()});
    drive.properties.get({
      fileId: id,
      propertyKey: 'test'
    }, callback);
  },

  propertiesInsert: function (id, callback) {
    var drive = google.drive({version: 'v2', auth: auth.getAuth()});
    drive.properties.insert({
      fileId: id,
      resource: {
        properties: [
          {key: 'teeeest', value: 'teeeest'}
        ]
      }
    }, callback);
  }
};
