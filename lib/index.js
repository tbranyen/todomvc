import { use } from 'diffhtml';
import devTools from 'diffhtml-devtools';
import logger from 'diffhtml-middleware-logger';
import inlineTransitions from 'diffhtml-inline-transitions';
import syntheticEvents from 'diffhtml-synthetic-events';
import verifyState from 'diffhtml-middleware-verify-state';
import TodoApp from './components/todo-app';
import store from './redux/store';
import * as urlActions from './redux/actions/url';

use(devTools());
use(logger());
use(verifyState({ debug: true }));
use(inlineTransitions());
//use(syntheticEvents());

const setHashState = hash => store.dispatch(urlActions.setHashState(hash));

// Create the application and mount.
TodoApp.create(document.querySelector('todo-app'));

// Set URL state when hash changes.
window.onhashchange = e => setHashState(location.hash);
