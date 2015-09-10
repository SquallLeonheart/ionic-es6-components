'use strict';

import alt from '../alt';
//import MapData from '../utils/MapData';

export class MapActions {

  updateViewCenter(view) {
    this.dispatch(view);
  }

  updateCurrentTrack(newPos) {
    this.dispatch(newPos);
  }



  updateMapHeight() {
    //let newHeight = window.innerHeight - 50 + 'px';
    //this.dispatch(newHeight);

    /*MapFetcher.fetch(location)
      .then((messages)=>{
        this.actions.updateMessages(messages); })
      .catch((e)=>{
        console.log('Response Error', e);
        this.actions.messagesFailed(e);
      });*/
  }
}

export default alt.createActions(MapActions);
