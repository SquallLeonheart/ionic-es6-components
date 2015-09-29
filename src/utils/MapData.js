import request from 'superagent';

const getUrl = path => path.startsWith('http') ?
  path : process.env.WEBSITE_HOSTNAME ?
  `http://track-api.herokuapp.com${path}` :
  `http://wayfusion.us.to:5001${path}`;

class MapDataUtils {

  getMapRadius(map) {
    let mapBoundNorthEast = map.getBounds().getNorthEast();
    let mapDistance = mapBoundNorthEast.distanceTo(map.getBounds().getCenter());
    return mapDistance;
  }

  fillSquare(map) {
    let mapBoundEast = map.getBounds().getEast();
    let mapBoundWest = map.getBounds().getWest();
    let mapBoundNorth = map.getBounds().getNorth();
    let mapBoundSouth = map.getBounds().getSouth();

    let squareSideLng = (mapBoundEast - mapBoundWest) / 2;
    let squareSideLat = squareSideLng / 2;
    let squaresBounds = [];
    for (let i=1,
           southBound = mapBoundNorth + squareSideLat,
           northBound = mapBoundNorth,
           westBound = mapBoundWest,
           eastBound = mapBoundWest + squareSideLng;
         true; i++) {
      northBound -= squareSideLat;
      southBound -= squareSideLat;

      if (southBound > mapBoundSouth) {
        squaresBounds.push([[southBound, westBound],[northBound, eastBound]]);
        squaresBounds.push([[southBound, westBound + squareSideLng],[northBound, eastBound + squareSideLng]]);
      } else {
        break;
      }
    }
    let squares = [];
    squaresBounds.forEach((bounds) => {
      let rect = L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
      let rectCenter = rect.getBounds().getCenter();
      let radius = parseInt(this.getMapRadius(rect));

      L.circle(rectCenter, radius).addTo(map);

      squares.push({
        distance: radius,
        lat: rectCenter.lat,
        lng: rectCenter.lng
      });
    });
    console.log('squares:', squares);
    return squares;
  }

  getRouteSegmentInfo(pos1, pos2) {
    if (pos1 == null || pos2 == null) return;
    var latLng1, latLng2, distance, t;
    t = (pos2.timestamp - pos1.timestamp) / 1000 / 60 / 60;
    if (t === 0) return;
    latLng1 = L.latLng(pos1.coords.latitude, pos1.coords.longitude);
    latLng2 = L.latLng(pos2.coords.latitude, pos2.coords.longitude);
    distance = latLng1.distanceTo(latLng2) / 1000;
    return {
      distance: distance,
      time: t,
      speedAvg: distance / t
    };
  }
}
;

const MapData = {
  get: path => new Promise((resolve, reject) => {
    request
      .get(getUrl(path))
      .accept('application/json')
      .end((err, res) => {
        if (err) {
          if (err.status === 404) {
            resolve(null);
          } else {
            reject(err);
          }
        } else {
          resolve(res.body);
        }
      });
  }),

  //get: (path) => {
  //  return fetch(getUrl(path))
  //    .then((response) => {
  //      return response.json();
  //    })
  //    .then((json) => {
  //      return json;
  //    })
  //    .catch((err) => {
  //      console.log('fetch error', err);
  //    });
  //},

  post: (path, data) => {
    return fetch(getUrl(path), {
      method: 'post', headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json;
      })
      .catch((err) => {
        console.log('post error: ', err);
      });
  }
};

export {MapData, MapDataUtils};
