import { use, addTransitionState, removeTransitionState } from 'diffhtml';
import inlineTransitions from 'diffhtml-inline-transitions';
import logger from 'diffhtml-logger';
import { middleware } from 'diffhtml-utils';
import TodoApp from './components/todo-app';
import store from './redux/store';
import * as urlActions from './redux/actions/url';

// Add diffHTML middleware.
use(logger());
use(inlineTransitions({ addTransitionState, removeTransitionState }));
use(middleware.verifyState({ debug: location.search.includes('debug') }));

// Create the application and mount.
TodoApp.mount(document.querySelector('todo-app'));

// Sets the hash state
const setHashState = hash => store.dispatch(urlActions.setHashState(hash));

// Set URL state.
setHashState(location.hash);

// Set URL state when hash changes.
window.onhashchange = e => setHashState(location.hash);
