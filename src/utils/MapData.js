const getUrl = path => path.startsWith('http') ?
  path : process.env.WEBSITE_HOSTNAME ?
  `http://track-api.herokuapp.com${path}` :
  `http://127.0.0.1:5001${path}`;

const MapData = {
  get: (path) => {
    return fetch(getUrl(path))
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json;
      })
      .catch((err) => {
        console.log('fetch error', err);
      });
  },

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
  },

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
};

export default MapData;
