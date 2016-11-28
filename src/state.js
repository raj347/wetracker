import Immutable from 'immutable';
import Signal from './utils/signal';

export class State {
  constructor() {
    this.cursor = new Immutable.Map({
      row: 0,
      track: 0,
      column: 0,
      item: 0,
    });

    this.cursorChanged = Signal.signal(true);
  }


  set(state) {
    if ('cursor' in state ) {
      this.cursor = this.cursor.merge(state.cursor);
      this.cursorChanged();
    }
  }
}

export let state = new State();