import alt from '../alt';
import MapActions from '../actions/MapActions';

export class MapStore {

  constructor() {
    this.view = {
      center:  [51.505, -0.09],
      zoom: 15
    };

    this.lastPosition = null;
    this.currentTrack = {
      latlngs: [],
      positions: []
    };


    this.bindListeners({
      handleUpdateViewCenter: MapActions.UPDATE_VIEW_CENTER,
      handleUpdateCurrentTrack: MapActions.UPDATE_CURRENT_TRACK
    });
  }

  handleUpdateViewCenter(view) {
    var resultView;
    if (view instanceof Array) {
      resultView = {
        center: view
      }
    } else if (view && view.center && view.zoom) {
      resultView = view;
    }
    Object.assign(this.view, resultView);
  }

  handleUpdateCurrentTrack(newPos) {
    // compare primitive values
    if (this.lastPosition &&
      newPos.coords.longitude === this.lastPosition.coords.longitude &&
      newPos.coords.latitude === this.lastPosition.coords.latitude) {
      return false;
    }

    let latlng = [newPos.coords.latitude, newPos.coords.longitude];

    this.lastPosition = newPos;
    this.handleUpdateViewCenter(latlng);
    this.currentTrack.positions.push(newPos);
    this.currentTrack.latlngs.push(latlng);
  }

}

export default alt.createStore(MapStore, 'MapStore');
