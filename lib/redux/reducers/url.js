import * as urlActions from '../actions/url';

const { assign } = Object;
const initialState = { path: location.hash.slice(1) || '/' };

export default function url(state = initialState, action) {
  switch (action.type) {
    case urlActions.SET_HASH_STATE: {
      return assign({}, state, { path: action.path });
    }

    default: {
      return state;
    }
  }
}
