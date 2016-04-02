import TodoApp from './components/todo-app';
import { enableProllyfill } from 'diffhtml';

// Support older browsers (Custom Elements polyfill and element extensions).
enableProllyfill();

document.registerElement('todo-app', TodoApp);
