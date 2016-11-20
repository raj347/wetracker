// selectLocationState expects a plain JS object for the routing state
const selectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.get('route'); // or state.route

    if (!routingState.equals(prevRoutingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

const selectCursor = () =>
  (state) => state.get('cursor').toJS();

const selectSong = () =>
  (state) => state.get('song').toJS();

const selectTransport = () =>
  (state) => state.get('transport').toJS();

const selectInstrumentCursor = () =>
  (state) => state.get('instrumentCursor').toJS();

const selectTrackoutput = () =>
  (state) => state.get('trackoutput').toJS();

export {
  selectLocationState,
  selectCursor,
  selectSong,
  selectTransport,
  selectInstrumentCursor,
  selectTrackoutput,
};
