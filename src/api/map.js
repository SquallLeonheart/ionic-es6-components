var express = require('express');
var _ = require('lodash');
var gdrive = require('./gdrive');

module.exports = function (db) {
  var router = express.Router();

  router.get('/track/search', function (req, res, next) {
    var q;
    if (req.query.q) {
      q = req.query.q;
    }

    gdrive.track.search(q, function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return next(err);
      }
      var files = response.items;
      if (files.length == 0) {
        res.send('No files found.');
      } else {
        res.send(files);

      }
    });

  });

  router.route('/properties')
    .get(function (req, res, next) {
      var id;
      if (req.query.id) {
        id = req.query.id;
      }

      gdrive.track.propertiesGet(id, function (err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return next(err);
        }
        res.send(response);
      });
    })
    .post(function (req, res, next) {
      var id;
      if (req.body.id) {
        id = req.body.id;
      }

      gdrive.track.propertiesInsert(id, function (err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return next(err);
        }
        res.send(response);
      });
    });

  function intersectsBounds(b1, b2) {

    //for (var i = 0; i <= 3; i++) {
    //    b1[i] = parseFloat(b1[i]);
    //    b2[i] = parseFloat(b2[i]);
    //}

    b1 = b1.map(Number);
    b2 = b2.map(Number);
    //bounds
    //[
    // 0  _southWest.lng,
    // 1  _southWest.lat,
    // 2  _northEast.lng,
    // 3  _northEast.lat
    //]

    var latIntersects = (b2[3] >= b1[1]) && (b2[1] <= b1[3]),
      lngIntersects = (b2[2] >= b1[0]) && (b2[0] <= b1[2]);

    return latIntersects && lngIntersects;
  }

  router.route('/track')
    .post(function (req, res, next) {
      gdrive.track.save(req.body, function (err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return next(err);
        }

        var tracks = db('tracks').push({
          id: response.id,
          title: response.title,
          createdDate: response.createdDate,
          modifiedDate: response.modifiedDate,
          bounds: req.body.bounds

        });
        res.send(db('tracks'));
      });
    })
    .get(function (req, res, next) {
      var bounds;
      if (req.query.bounds) {
        bounds = req.query.bounds.split(',');
      }

      var tracks = db('tracks');
      var foundTracks = tracks.filter(function (track) {
        return intersectsBounds(track.bounds, bounds);
      });

      var results = [];

      function doRender() {
        res.send(results);
      }

      if (foundTracks.length > 0) {
        var done = _.after(foundTracks.length, doRender);
        foundTracks.forEach(function (track) {
          gdrive.track.get(track.id, function (err, response) {
            if (err) {
              console.log('The API returned an error: ' + err);
              return next(err);
            }

            var resTrack = {
              id: track.id,
              geoJSON: response
            };

            results.push(resTrack);
            done();
          })
        })
      } else {
        doRender();
      }

    });


  return router;
};

