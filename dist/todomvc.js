(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.inlineTransitions = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// Store maps of elements to handlers that are associated to transitions.
var transitionsMap = {
  attached: new Map(),
  detached: new Map(),
  replaced: new Map(),
  attributeChanged: new Map(),
  textChanged: new Map()
};

// Internal global transition state handlers, allows us to bind once and match.
var boundHandlers = [];

/**
 * Binds inline transitions to the parent element and triggers for any matching
 * nested children.
 */
module.exports = function (_ref) {
  var addTransitionState = _ref.addTransitionState;
  var removeTransitionState = _ref.removeTransitionState;

  var attached = function attached(element) {
    if (element.attached) {
      return element.attached(element, element);
    }
  };

  // Monitors whenever an element changes an attribute, if the attribute
  // is a valid state name, add this element into the related Set.
  var attributeChanged = function attributeChanged(element, name, oldVal, newVal) {
    var map = transitionsMap[name];

    // Abort early if not a valid transition or if the new value exists, but
    // isn't a function.
    if (!map || newVal && typeof newVal !== 'function') {
      return;
    }

    // Add or remove based on the value existence and type.
    map[typeof newVal === 'function' ? 'set' : 'delete'](element, newVal);
  };

  // This will unbind any internally bound transition states.
  var unsubscribe = function unsubscribe() {
    // Unbind all the transition states.
    removeTransitionState('attached', attached);
    removeTransitionState('attributeChanged', attributeChanged);

    // Remove all elements from the internal cache.
    Object.keys(transitionsMap).forEach(function (name) {
      var map = transitionsMap[name];

      // Unbind the associated global handler.
      removeTransitionState(name, boundHandlers.shift());

      // Empty the associated element set.
      map.clear();
    });

    // Empty the bound handlers.
    boundHandlers.length = 0;
  };

  // If this function gets repeatedly called, unbind the previous to avoid doubling up.
  unsubscribe();

  // Set a "global" `attributeChanged` to monitor all elements for transition
  // states being attached.
  addTransitionState('attached', attached);
  addTransitionState('attributeChanged', attributeChanged);

  // Add a transition for every type.
  Object.keys(transitionsMap).forEach(function (name) {
    var map = transitionsMap[name];

    var handler = function handler(child) {
      for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
      }

      // If there are no elements to match here, abort.
      if (!map.size) {
        return;
      }
      // If the child element triggered in the transition is the root element,
      // this is an easy lookup for the handler.
      else if (map.has(child)) {
          // Attached is handled special by the separate global attached handler.
          if (name !== 'attached') {
            return map.get(child).apply(child, [child].concat(rest));
          }
        }
        // The last resort is looping through all the registered elements to see
        // if the child is contained within. If so, it aggregates all the valid
        // handlers and if they return Promises return them into a `Promise.all`.
        else {
            var _ret = function () {
              var retVal = [];

              // Last resort check for child.
              map.forEach(function (fn, element) {
                if (element.contains(child)) {
                  retVal.push(fn.apply(child, [element].concat(child, rest)));
                }
              });

              var hasPromise = retVal.some(function (ret) {
                return Boolean(ret && ret.then);
              });

              // This is the only time the return value matters.
              if (hasPromise) {
                return {
                  v: Promise.all(retVal)
                };
              }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
          }
    };

    // Save the handler for later unbinding.
    boundHandlers.push(handler);

    // Add the state handler.
    addTransitionState(name, handler);
  });

  return unsubscribe;
};

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _diffhtml = _dereq_('diffhtml');

var diff = _interopRequireWildcard(_diffhtml);

var _diffhtmlInlineTransitions = _dereq_('diffhtml-inline-transitions');

var _diffhtmlInlineTransitions2 = _interopRequireDefault(_diffhtmlInlineTransitions);

var _store = _dereq_('../redux/store');

var _store2 = _interopRequireDefault(_store);

var _todoApp = _dereq_('../redux/actions/todo-app');

var todoAppActions = _interopRequireWildcard(_todoApp);

var _todoList = _dereq_('./todo-list');

var _todoList2 = _interopRequireDefault(_todoList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var html = diff.html;
var innerHTML = diff.innerHTML;

// Allow diffHTML transitions to be bound inside the tagged helper.

(0, _diffhtmlInlineTransitions2.default)(diff);

var TodoApp = function () {
  _createClass(TodoApp, null, [{
    key: 'create',
    value: function create(mount) {
      return new TodoApp(mount);
    }
  }]);

  function TodoApp(mount) {
    var _this = this;

    _classCallCheck(this, TodoApp);

    this.mount = mount;
    this.existingFooter = this.mount.querySelector('footer').cloneNode(true);
    this.unsubscribeStore = _store2.default.subscribe(function () {
      return _this.render();
    });

    this.render();
  }

  _createClass(TodoApp, [{
    key: 'animateAttached',
    value: function animateAttached(parent, element) {
      if (!element.animate) {
        return;
      }

      if (element.matches('footer.info')) {
        new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 250 }).onfinish = resolve;
        }).then(function () {
          element.style.opacity = 1;
        });
      }

      // Animate Todo item being added.
      if (element.matches('.todo-list li, footer.info')) {
        new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 250 }).onfinish = resolve;
        });
      }

      // Animate the entire app loading.
      if (element.matches('.todoapp')) {
        new Promise(function (resolve) {
          return element.animate([{ opacity: 0, transform: 'translateY(100%)', easing: 'ease-out' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 375 }).onfinish = resolve;
        });
      }
    }
  }, {
    key: 'animateDetached',
    value: function animateDetached(parent, element) {
      if (!element.animate) {
        return;
      }

      // We are removing an item from the list.
      if (element.matches('.todo-list li')) {
        return new Promise(function (resolve) {
          return element.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.5)' }], { duration: 250 }).onfinish = resolve;
        });
      }
    }
  }, {
    key: 'addTodo',
    value: function addTodo(ev) {
      if (!ev.target.matches('.add-todo')) {
        return;
      }

      ev.preventDefault();

      var newTodo = ev.target.querySelector('.new-todo');
      _store2.default.dispatch(todoAppActions.addTodo(newTodo.value));
      newTodo.value = '';
    }
  }, {
    key: 'removeTodo',
    value: function removeTodo(ev) {
      if (!ev.target.matches('.destroy')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.removeTodo(index));
    }
  }, {
    key: 'toggleCompletion',
    value: function toggleCompletion(ev) {
      if (!ev.target.matches('.toggle')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.toggleCompletion(index, ev.target.checked));
    }
  }, {
    key: 'startEditing',
    value: function startEditing(ev) {
      if (!ev.target.matches('label')) {
        return;
      }

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      _store2.default.dispatch(todoAppActions.startEditing(index));

      li.querySelector('form input').focus();
    }
  }, {
    key: 'stopEditing',
    value: function stopEditing(ev) {
      ev.preventDefault();

      var parentNode = ev.target.parentNode;
      var nodeName = parentNode.nodeName.toLowerCase();
      var li = nodeName === 'li' ? parentNode : parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);
      var editTodo = li.querySelector('.edit');
      var text = editTodo.value.trim();

      if (text) {
        _store2.default.dispatch(todoAppActions.stopEditing(index, text));
      } else {
        _store2.default.dispatch(todoAppActions.removeTodo(index));
      }
    }
  }, {
    key: 'clearCompleted',
    value: function clearCompleted(ev) {
      if (!ev.target.matches('.clear-completed')) {
        return;
      }

      _store2.default.dispatch(todoAppActions.clearCompleted());
    }
  }, {
    key: 'toggleAll',
    value: function toggleAll(ev) {
      if (!ev.target.matches('.toggle-all')) {
        return;
      }

      _store2.default.dispatch(todoAppActions.toggleAll(ev.target.checked));
    }
  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(ev) {
      if (!ev.target.matches('.edit')) {
        return;
      }

      var todoApp = _store2.default.getState()[this.mount.dataset.reducer];

      var li = ev.target.parentNode.parentNode;
      var index = Array.from(li.parentNode.children).indexOf(li);

      switch (ev.keyCode) {
        case 27:
          {
            ev.target.value = todoApp.todos[index].title;
            this.stopEditing(ev);
          }
      }
    }
  }, {
    key: 'getTodoClassNames',
    value: function getTodoClassNames(todo) {
      return [todo.completed ? 'completed' : '', todo.editing ? 'editing' : ''].filter(Boolean).join(' ');
    }
  }, {
    key: 'setCheckedState',
    value: function setCheckedState() {
      var todoApp = _store2.default.getState()[this.mount.dataset.reducer];
      var notChecked = todoApp.todos.filter(function (todo) {
        return !todo.completed;
      }).length;

      return notChecked ? '' : 'checked';
    }
  }, {
    key: 'onSubmitHandler',
    value: function onSubmitHandler(ev) {
      ev.preventDefault();

      if (ev.target.matches('.add-todo')) {
        this.addTodo(ev);
      } else if (ev.target.matches('.edit-todo')) {
        this.stopEditing(ev);
      }
    }
  }, {
    key: 'onClickHandler',
    value: function onClickHandler(ev) {
      if (ev.target.matches('.destroy')) {
        this.removeTodo(ev);
      } else if (ev.target.matches('.toggle-all')) {
        this.toggleAll(ev);
      } else if (ev.target.matches('.clear-completed')) {
        this.clearCompleted(ev);
      }
    }
  }, {
    key: 'getNavClass',
    value: function getNavClass(name) {
      var state = _store2.default.getState();
      var path = state.url.path;

      return path === name ? 'selected' : undefined;
    }
  }, {
    key: 'render',
    value: function render() {
      var state = _store2.default.getState();
      var todoApp = state[this.mount.dataset.reducer];
      var status = state.url.path.slice(1);
      var allTodos = todoApp.todos;
      var todos = todoApp.getByStatus(status);
      var activeTodos = todoApp.getByStatus('active');
      var completedTodos = todoApp.getByStatus('completed');

      localStorage['diffhtml-todos'] = JSON.stringify(allTodos);

      innerHTML(this.mount, [diff.createElement("section", [diff.createAttribute("class", 'todoapp'), diff.createAttribute("attached", this.animateAttached), diff.createAttribute("detached", this.animateDetached), diff.createAttribute("onsubmit", this.onSubmitHandler.bind(this)), diff.createAttribute("onclick", this.onClickHandler.bind(this)), diff.createAttribute("onkeydown", this.handleKeyDown.bind(this)), diff.createAttribute("ondblclick", this.startEditing.bind(this)), diff.createAttribute("onchange", this.toggleCompletion.bind(this))], [diff.createElement('#text', null, "\n\n        "), diff.createElement("header", [diff.createAttribute("class", 'header')], [diff.createElement('#text', null, "\n          "), diff.createElement("h1", [], [diff.createElement('#text', null, "todos")]), diff.createElement('#text', null, "\n\n          "), diff.createElement("form", [diff.createAttribute("class", 'add-todo')], [diff.createElement('#text', null, "\n            "), diff.createElement("input", [diff.createAttribute("class", 'new-todo'), diff.createAttribute("placeholder", 'What needs to be done?'), diff.createAttribute("autofocus", '')], []), diff.createElement('#text', null, "\n          ")]), diff.createElement('#text', null, "\n        ")]), diff.createElement('', null, allTodos.length ? [diff.createElement("section", [diff.createAttribute("class", 'main')], [diff.createElement('#text', null, "\n            "), diff.createElement("input", [diff.createAttribute("class", 'toggle-all'), diff.createAttribute("type", 'checkbox'), diff.createAttribute(this.setCheckedState(), this.setCheckedState())], []), diff.createElement('#text', null, "\n\n            "), diff.createElement("ul", [diff.createAttribute("class", 'todo-list')], [diff.createElement('', null, _todoList2.default.call(this, {
        stopEditing: this.stopEditing.bind(this),
        todos: todos
      }))]), diff.createElement('#text', null, "\n          ")]), diff.createElement('#text', null, "\n\n          "), diff.createElement("footer", [diff.createAttribute("class", 'footer')], [diff.createElement('#text', null, "\n            "), diff.createElement("span", [diff.createAttribute("class", 'todo-count')], [diff.createElement('#text', null, "\n              "), diff.createElement("strong", [], [diff.createElement('', null, activeTodos.length)]), diff.createElement('#text', null, '\n              ' + (activeTodos.length == 1 ? 'item' : 'items') + ' left\n            ')]), diff.createElement('#text', null, "\n\n            "), diff.createElement("ul", [diff.createAttribute("class", 'filters')], [diff.createElement('#text', null, "\n              "), diff.createElement("li", [], [diff.createElement('#text', null, "\n                "), diff.createElement("a", [diff.createAttribute("href", '#/'), diff.createAttribute("class", this.getNavClass('/'))], [diff.createElement('#text', null, "\n                  All\n                ")]), diff.createElement('#text', null, "\n              ")]), diff.createElement('#text', null, "\n              "), diff.createElement("li", [], [diff.createElement('#text', null, "\n                "), diff.createElement("a", [diff.createAttribute("href", '#/active'), diff.createAttribute("class", this.getNavClass('/active'))], [diff.createElement('#text', null, "\n                  Active\n                ")]), diff.createElement('#text', null, "\n              ")]), diff.createElement('#text', null, "\n              "), diff.createElement("li", [], [diff.createElement('#text', null, "\n                "), diff.createElement("a", [diff.createAttribute("href", '#/completed'), diff.createAttribute("class", this.getNavClass('/completed'))], [diff.createElement('#text', null, "\n                  Completed\n                ")]), diff.createElement('#text', null, "\n              ")]), diff.createElement('#text', null, "\n            ")]), diff.createElement('', null, completedTodos.length ? diff.createElement("button", [diff.createAttribute("class", 'clear-completed'), diff.createAttribute("onclick", this.clearCompleted.bind(this))], [diff.createElement('#text', null, "\n                Clear completed\n              ")]) : '')])] : '')]), diff.createElement('', null, this.existingFooter)]);
    }
  }]);

  return TodoApp;
}();

exports.default = TodoApp;

},{"../redux/actions/todo-app":5,"../redux/store":9,"./todo-list":3,"diffhtml":10,"diffhtml-inline-transitions":1}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = renderTodoList;

var _diffhtml = _dereq_('diffhtml');

var diff = _interopRequireWildcard(_diffhtml);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var html = diff.html;
var innerHTML = diff.innerHTML;


function encode(str) {
	return str.replace(/["&'<>`]/g, function (match) {
		return '&#' + match.charCodeAt(0) + ';';
	});
}

function renderTodoList(props) {
	var _this = this;

	return props.todos.map(function (todo) {
		return diff.createElement("li", [diff.createAttribute("key", todo.key), diff.createAttribute("class", _this.getTodoClassNames(todo))], [diff.createElement('#text', null, "\n\t\t\t"), diff.createElement("div", [diff.createAttribute("class", 'view')], [diff.createElement('#text', null, "\n\t\t\t\t"), diff.createElement("input", [diff.createAttribute("class", 'toggle'), diff.createAttribute("type", 'checkbox'), diff.createAttribute(todo.completed ? 'checked' : '', todo.completed ? 'checked' : '')], []), diff.createElement('#text', null, "\n\t\t\t\t"), diff.createElement("label", [], [diff.createElement('', null, encode(todo.title))]), diff.createElement('#text', null, "\n\t\t\t\t"), diff.createElement("button", [diff.createAttribute("class", 'destroy')], []), diff.createElement('#text', null, "\n\t\t\t")]), diff.createElement('#text', null, "\n\n\t\t\t"), diff.createElement("form", [diff.createAttribute("class", 'edit-todo')], [diff.createElement('#text', null, "\n\t\t\t\t"), diff.createElement("input", [diff.createAttribute("onblur", props.stopEditing), diff.createAttribute("value", encode(todo.title)), diff.createAttribute("class", 'edit')], []), diff.createElement('#text', null, "\n\t\t\t")]), diff.createElement('#text', null, "\n\t\t")]);
	});
}

},{"diffhtml":10}],4:[function(_dereq_,module,exports){
'use strict';

var _todoApp = _dereq_('./components/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

var _store = _dereq_('./redux/store');

var _store2 = _interopRequireDefault(_store);

var _url = _dereq_('./redux/actions/url');

var urlActions = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var setHashState = function setHashState(hash) {
  return _store2.default.dispatch(urlActions.setHashState(hash));
};

// Create the application and mount.
_todoApp2.default.create(document.querySelector('todo-app'));

// Set URL state.
setHashState(location.hash);

// Set URL state when hash changes.
window.onhashchange = function (e) {
  return setHashState(location.hash);
};

},{"./components/todo-app":2,"./redux/actions/url":6,"./redux/store":9}],5:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.addTodo = addTodo;
exports.removeTodo = removeTodo;
exports.toggleCompletion = toggleCompletion;
exports.startEditing = startEditing;
exports.stopEditing = stopEditing;
exports.clearCompleted = clearCompleted;
exports.toggleAll = toggleAll;
var ADD_TODO = exports.ADD_TODO = 'ADD_TODO';
var REMOVE_TODO = exports.REMOVE_TODO = 'REMOVE_TODO';
var TOGGLE_COMPLETION = exports.TOGGLE_COMPLETION = 'TOGGLE_COMPLETION';
var START_EDITING = exports.START_EDITING = 'START_EDITING';
var STOP_EDITING = exports.STOP_EDITING = 'STOP_EDITING';
var CLEAR_COMPLETED = exports.CLEAR_COMPLETED = 'CLEAR_COMPLETED';
var TOGGLE_ALL = exports.TOGGLE_ALL = 'TOGGLE_ALL';

function addTodo(title) {
	return {
		type: ADD_TODO,
		title: title
	};
}

function removeTodo(index) {
	return {
		type: REMOVE_TODO,
		index: index
	};
}

function toggleCompletion(index, completed) {
	return {
		type: TOGGLE_COMPLETION,
		index: index,
		completed: completed
	};
}

function startEditing(index) {
	return {
		type: START_EDITING,
		index: index
	};
}

function stopEditing(index, title) {
	return {
		type: STOP_EDITING,
		index: index,
		title: title
	};
}

function clearCompleted() {
	return {
		type: CLEAR_COMPLETED
	};
}

function toggleAll(completed) {
	return {
		type: TOGGLE_ALL,
		completed: completed
	};
}

},{}],6:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.setHashState = setHashState;
var SET_HASH_STATE = exports.SET_HASH_STATE = 'SET_HASH_STATE';

function setHashState(hash) {
	var path = hash.slice(1) || '/';

	return {
		type: SET_HASH_STATE,
		path: path
	};
}

},{}],7:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = todoApp;

var _todoApp = _dereq_('../actions/todo-app');

var todoAppActions = _interopRequireWildcard(_todoApp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var initialState = {
	todos: JSON.parse(localStorage['diffhtml-todos'] || '[]'),

	getByStatus: function getByStatus(type) {
		return this.todos.filter(function (todo) {
			switch (type) {
				case 'active':
					return !todo.completed;
				case 'completed':
					return todo.completed;
			}

			return true;
		});
	}
};

function todoApp() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	var action = arguments[1];

	switch (action.type) {
		case todoAppActions.ADD_TODO:
			{
				if (!action.title) {
					return state;
				}

				return Object.assign({}, state, {
					todos: state.todos.concat({
						completed: false,
						editing: false,

						title: action.title.trim(),
						key: Date.now() + state.todos.length
					})
				});
			}

		case todoAppActions.REMOVE_TODO:
			{
				state.todos.splice(action.index, 1);

				return Object.assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.TOGGLE_COMPLETION:
			{
				var todo = state.todos[action.index];

				state.todos[action.index] = Object.assign({}, todo, {
					completed: action.completed
				});

				return Object.assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.START_EDITING:
			{
				var _todo = state.todos[action.index];

				state.todos[action.index] = Object.assign({}, _todo, {
					editing: true
				});

				return Object.assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.STOP_EDITING:
			{
				var _todo2 = state.todos[action.index];

				state.todos[action.index] = Object.assign({}, _todo2, {
					title: action.title,
					editing: false
				});

				return Object.assign({}, state, {
					todos: [].concat(state.todos)
				});
			}

		case todoAppActions.CLEAR_COMPLETED:
			{
				return Object.assign({}, state, {
					todos: state.todos.filter(function (todo) {
						return todo.completed === false;
					})
				});
			}

		case todoAppActions.TOGGLE_ALL:
			{
				return Object.assign({}, state, {
					todos: state.todos.map(function (todo) {
						return Object.assign({}, todo, {
							completed: action.completed
						});
					})
				});
			}

		default:
			{
				return state;
			}
	}
}

},{"../actions/todo-app":5}],8:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = url;

var _url = _dereq_('../actions/url');

var urlActions = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var initialState = {
	path: location.hash.slice(1) || '/'
};

function url() {
	var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	var action = arguments[1];

	switch (action.type) {
		case urlActions.SET_HASH_STATE:
			{
				return Object.assign({}, state, {
					path: action.path
				});
			}

		default:
			{
				return state;
			}
	}
}

},{"../actions/url":6}],9:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _redux = _dereq_('redux');

var _reduxLogger = _dereq_('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _todoApp = _dereq_('./reducers/todo-app');

var _todoApp2 = _interopRequireDefault(_todoApp);

var _url = _dereq_('./reducers/url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Makes a reusable function to create a store. Currently not exported, but
// could be in the future for testing purposes.
var createStoreWithMiddleware = (0, _redux.compose)(
// Adds in store middleware, such as async thunk and logging.
(0, _redux.applyMiddleware)((0, _reduxLogger2.default)()),

// Hook devtools into our store.
window.devToolsExtension ? window.devToolsExtension() : function (f) {
	return f;
})(_redux.createStore);

// Compose the root reducer from modular reducers.
exports.default = createStoreWithMiddleware((0, _redux.combineReducers)({
	// Encapsulates all TodoApp state.
	todoApp: _todoApp2.default,

	// Manage the URL state.
	url: _url2.default,

	// Store the last action taken.
	lastAction: function lastAction(state, action) {
		return action;
	}
}), {});

},{"./reducers/todo-app":7,"./reducers/url":8,"redux":21,"redux-logger":15}],10:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.diff = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = make;

var _svg = _dereq_('../svg');

var svg = _interopRequireWildcard(_svg);

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Takes in a virtual descriptor and creates an HTML element. Sets the element
 * into the cache.
 *
 * @param descriptor - Element descriptor
 * @return {Element} - The newly created DOM Node
 */
function make(descriptor) {
  var element = null;
  var isSvg = false;

  // If the element descriptor was already created, reuse the existing element.
  if (_make2.default.nodes.has(descriptor)) {
    return _make2.default.nodes.get(descriptor);
  }

  if (descriptor.nodeName === '#text') {
    element = document.createTextNode(descriptor.nodeValue);
  } else {
    if (svg.elements.indexOf(descriptor.nodeName) > -1) {
      isSvg = true;
      element = document.createElementNS(svg.namespace, descriptor.nodeName);
    } else {
      element = document.createElement(descriptor.nodeName);
    }

    // Copy all the attributes from the descriptor into the newly created DOM
    // Node.
    if (descriptor.attributes && descriptor.attributes.length) {
      for (var i = 0; i < descriptor.attributes.length; i++) {
        var attr = descriptor.attributes[i];
        var isObject = _typeof(attr.value) === 'object';
        var isFunction = typeof attr.value === 'function';

        // If not a dynamic type, set as an attribute, since it's a valid
        // attribute value.
        if (attr.name && !isObject && !isFunction) {
          element.setAttribute(attr.name, attr.value);
        } else if (attr.name && typeof attr.value !== 'string') {
          // Necessary to track the attribute/prop existence.
          element.setAttribute(attr.name, '');

          // Since this is a dynamic value it gets set as a property.
          element[attr.name] = attr.value;
        }
      }
    }

    // Append all the children into the element, making sure to run them
    // through this `make` function as well.
    if (descriptor.childNodes && descriptor.childNodes.length) {
      for (var _i = 0; _i < descriptor.childNodes.length; _i++) {
        var text = descriptor.childNodes.nodeValue;

        if (text && text.trim && text.trim() === '__DIFFHTML__') {
          var value = supplemental.children.shift();

          if (Array.isArray(value)) {
            value.forEach(function (el) {
              return element.appendChild(make(el));
            });
          } else {
            element.appendChild(make(value));
          }
        } else {
          element.appendChild(make(descriptor.childNodes[_i]));
        }
      }
    }
  }

  // Add to the nodes cache.
  _make2.default.nodes.set(descriptor, element);

  return element;
}

},{"../node/make":5,"../svg":11}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var missingStackTrace = 'Browser doesn\'t support error stack traces.';

/**
 * Identifies an error with transitions.
 */

var TransitionStateError = exports.TransitionStateError = function (_Error) {
  _inherits(TransitionStateError, _Error);

  function TransitionStateError(message) {
    var _this;

    _classCallCheck(this, TransitionStateError);

    var error = (_this = _possibleConstructorReturn(this, Object.getPrototypeOf(TransitionStateError).call(this)), _this);

    _this.message = message;
    _this.stack = error.stack || missingStackTrace;
    return _this;
  }

  return TransitionStateError;
}(Error);

/**
 * Identifies an error with registering an element.
 */


var DOMException = exports.DOMException = function (_Error2) {
  _inherits(DOMException, _Error2);

  function DOMException(message) {
    var _this2;

    _classCallCheck(this, DOMException);

    var error = (_this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(DOMException).call(this)), _this2);

    _this2.message = 'Uncaught DOMException: ' + message;
    _this2.stack = error.stack || missingStackTrace;
    return _this2;
  }

  return DOMException;
}(Error);

},{}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.html = html;

var _parser = _dereq_('./util/parser');

var isPropEx = /(=|'|")/;

/**
 * Parses a tagged template literal into a diffHTML Virtual DOM representation.
 *
 * @param strings
 * @param ...values
 *
 * @return
 */
function html(strings) {
  for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  // Do not attempt to parse empty strings.
  if (!strings[0].length && !values.length) {
    return null;
  }

  // Parse only the text, no dynamic bits.
  if (strings.length === 1 && !values.length) {
    var _childNodes = (0, _parser.parse)(strings[0]).childNodes;
    return _childNodes.length > 1 ? _childNodes : _childNodes[0];
  }

  var retVal = [];
  var supplemental = {
    props: [],
    children: []
  };

  // Loop over the strings and interpolate the values.
  strings.forEach(function (string) {
    retVal.push(string);

    if (values.length) {
      var value = values.shift();
      var lastSegment = string.split(' ').pop();
      var lastCharacter = lastSegment.trim().slice(-1);
      var isProp = Boolean(lastCharacter.match(isPropEx));

      if (isProp) {
        supplemental.props.push(value);
        retVal.push('__DIFFHTML__');
      } else if (Array.isArray(value) || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        supplemental.children.push(value);
        retVal.push('__DIFFHTML__');
      } else {
        retVal.push(String(value));
      }
    }
  });

  var childNodes = (0, _parser.parse)(retVal.join(''), supplemental).childNodes;
  return childNodes.length > 1 ? childNodes : childNodes[0];
}

},{"./util/parser":15}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAttribute = exports.createElement = exports.html = exports.DOMException = exports.TransitionStateError = undefined;

var _errors = _dereq_('./errors');

Object.defineProperty(exports, 'TransitionStateError', {
  enumerable: true,
  get: function get() {
    return _errors.TransitionStateError;
  }
});
Object.defineProperty(exports, 'DOMException', {
  enumerable: true,
  get: function get() {
    return _errors.DOMException;
  }
});

var _html = _dereq_('./html');

Object.defineProperty(exports, 'html', {
  enumerable: true,
  get: function get() {
    return _html.html;
  }
});

var _transform = _dereq_('./util/transform');

Object.defineProperty(exports, 'createElement', {
  enumerable: true,
  get: function get() {
    return _transform.createElement;
  }
});
Object.defineProperty(exports, 'createAttribute', {
  enumerable: true,
  get: function get() {
    return _transform.createAttribute;
  }
});
exports.outerHTML = outerHTML;
exports.innerHTML = innerHTML;
exports.element = element;
exports.release = release;
exports.addTransitionState = addTransitionState;
exports.removeTransitionState = removeTransitionState;
exports.enableProllyfill = enableProllyfill;

var _patch = _dereq_('./node/patch');

var _patch2 = _interopRequireDefault(_patch);

var _release = _dereq_('./node/release');

var _release2 = _interopRequireDefault(_release);

var _make = _dereq_('./node/make');

var _make2 = _interopRequireDefault(_make);

var _tree = _dereq_('./node/tree');

var _transitions = _dereq_('./transitions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Used to diff the outerHTML contents of the passed element with the markup
 * contents.  Very useful for applying a global diff on the
 * `document.documentElement`.
 *
 * @param element
 * @param markup=''
 * @param options={}
 */
function outerHTML(element) {
  var markup = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.inner = false;
  (0, _patch2.default)(element, markup, options);
}

/**
 * Used to diff the innerHTML contents of the passed element with the markup
 * contents.  This is useful with libraries like Backbone that render Views
 * into element container.
 *
 * @param element
 * @param markup=''
 * @param options={}
 */
function innerHTML(element) {
  var markup = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  options.inner = true;
  (0, _patch2.default)(element, markup, options);
}

/**
 * Used to diff two elements.  The `inner` Boolean property can be specified in
 * the options to set innerHTML\outerHTML behavior.  By default it is
 * outerHTML.
 *
 * @param element
 * @param newElement
 * @param options={}
 */
function element(element, newElement) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  (0, _patch2.default)(element, newElement, options);
}

/**
 * Releases the memory allocated to this element. Useful for cleaning up
 * components when removed in tests and applications.
 *
 * @param element
 */
function release(element) {
  (0, _release2.default)(element);
}

/**
 * Adds a global transition listener.  With many elements this could be an
 * expensive operation, so try to limit the amount of listeners added if you're
 * concerned about performance.
 *
 * Since the callback triggers with various elements, most of which you
 * probably don't care about, you'll want to filter.  A good way of filtering
 * is to use the DOM `matches` method.  It's fairly well supported
 * (http://caniuse.com/#feat=matchesselector) and may suit many projects.  If
 * you need backwards compatibility, consider using jQuery's `is`.
 *
 * You can do fun, highly specific, filters:
 *
 * addTransitionState('attached', function(element) {
 *   // Fade in the main container after it's added.
 *   if (element.matches('body main.container')) {
 *     $(element).stop(true, true).fadeIn();
 *   }
 * });
 *
 * @param state - String name that matches what's available in the
 * documentation above.
 * @param callback - Function to receive the matching elements.
 */
function addTransitionState(state, callback) {
  if (!state) {
    throw new _errors.TransitionStateError('Missing transition state name');
  }

  if (!callback) {
    throw new _errors.TransitionStateError('Missing transition state callback');
  }

  // Not a valid state name.
  if (Object.keys(_transitions.states).indexOf(state) === -1) {
    throw new _errors.TransitionStateError('Invalid state name: ' + state);
  }

  _transitions.states[state].push(callback);
}

/**
 * Removes a global transition listener.
 *
 * When invoked with no arguments, this method will remove all transition
 * callbacks.  When invoked with the name argument it will remove all
 * transition state callbacks matching the name, and so on for the callback.
 *
 * @param state - String name that matches what's available in the
 * documentation above.
 * @param callback - Function to receive the matching elements.
 */
function removeTransitionState(state, callback) {
  if (!callback && state) {
    _transitions.states[state].length = 0;
  } else if (state && callback) {
    // Not a valid state name.
    if (Object.keys(_transitions.states).indexOf(state) === -1) {
      throw new _errors.TransitionStateError('Invalid state name ' + state);
    }

    var index = _transitions.states[state].indexOf(callback);
    _transitions.states[state].splice(index, 1);
  } else {
    for (var _state in _transitions.states) {
      _transitions.states[_state].length = 0;
    }
  }
}

/**
 * By calling this function your browser environment is enhanced globally. This
 * project would love to hit the standards track and allow all developers to
 * benefit from the performance gains of DOM diffing.
 */
function enableProllyfill() {
  // Exposes the `html` tagged template helper globally so that developers
  // can trivially craft VDOMs.
  Object.defineProperty(window, 'html', {
    configurable: true,

    value: _html.html
  });

  // Exposes the `TransitionStateError` constructor globally so that developers
  // can instanceof check exception errors.
  Object.defineProperty(window, 'TransitionStateError', {
    configurable: true,

    value: _errors.TransitionStateError
  });

  // Allows a developer to add transition state callbacks.
  Object.defineProperty(document, 'addTransitionState', {
    configurable: true,

    value: function value(state, callback) {
      addTransitionState(state, callback);
    }
  });

  // Allows a developer to remove transition state callbacks.
  Object.defineProperty(document, 'removeTransitionState', {
    configurable: true,

    value: function value(state, callback) {
      removeTransitionState(state, callback);
    }
  });

  // Exposes the API into the Element, ShadowDOM, and DocumentFragment
  // constructors.
  [typeof Element !== 'undefined' ? Element : undefined, typeof HTMLElement !== 'undefined' ? HTMLElement : undefined, typeof ShadowRoot !== 'undefined' ? ShadowRoot : undefined, typeof DocumentFragment !== 'undefined' ? DocumentFragment : undefined].filter(Boolean).forEach(function (Ctor) {
    Object.defineProperty(Ctor.prototype, 'diffInnerHTML', {
      configurable: true,

      set: function set(newHTML) {
        innerHTML(this, newHTML);
      }
    });

    // Allows a developer to set the `outerHTML` of an element.
    Object.defineProperty(Ctor.prototype, 'diffOuterHTML', {
      configurable: true,

      set: function set(newHTML) {
        outerHTML(this, newHTML);
      }
    });

    // Allows a developer to diff the current element with a new element.
    Object.defineProperty(Ctor.prototype, 'diffElement', {
      configurable: true,

      value: function value(newElement, options) {
        element(this, newElement, options);
      }
    });

    // Releases the retained memory.
    Object.defineProperty(Ctor.prototype, 'diffRelease', {
      configurable: true,

      value: function value() {
        (0, _release2.default)(this);
      }
    });
  });
}

},{"./errors":2,"./html":3,"./node/make":5,"./node/patch":6,"./node/release":7,"./node/tree":9,"./transitions":12,"./util/transform":18}],5:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = make;

var _pools = _dereq_('../util/pools');

var empty = {};

// Cache created nodes inside this object.
make.nodes = new Map();

/**
 * Converts a live node into a virtual node.
 *
 * @param node
 * @return
 */
function make(node) {
  var nodeType = node.nodeType;

  // Whitelist: Elements, TextNodes, and Shadow Root.
  if (nodeType !== 1 && nodeType !== 3 && nodeType !== 11) {
    return false;
  }

  // Virtual representation of a node, containing only the data we wish to
  // diff and patch.
  var entry = _pools.pools.elementObject.get();

  _pools.pools.elementObject.protect(entry);

  // Associate this newly allocated descriptor with this Node.
  make.nodes.set(entry, node);

  // Set a lowercased (normalized) version of the element's nodeName.
  entry.nodeName = node.nodeName.toLowerCase();

  // If the element is a text node set the nodeValue.
  entry.nodeValue = nodeType === 3 ? node.textContent : '';
  entry.nodeType = nodeType;
  entry.childNodes.length = 0;
  entry.attributes.length = 0;

  // Collect attributes.
  var attributes = node.attributes;

  // If the element has no attributes, skip over.
  if (attributes && attributes.length) {
    for (var i = 0; i < attributes.length; i++) {
      var attr = _pools.pools.attributeObject.get();

      attr.name = attributes[i].name;
      attr.value = attributes[i].value;

      if (attr.name === 'key') {
        entry.key = attr.value;
      }

      entry.attributes.push(attr);
    }
  }

  // Collect childNodes.
  var childNodes = node.childNodes ? node.childNodes : [];
  var childNodesLength = childNodes.length;

  // If the element has child nodes, convert them all to virtual nodes.
  if (childNodesLength) {
    for (var _i = 0; _i < childNodesLength; _i++) {
      var newNode = make(childNodes[_i]);

      if (newNode) {
        entry.childNodes.push(newNode);
      }
    }
  }

  // Prune out whitespace from between HTML tags in markup.
  if (entry.nodeName === 'html') {
    entry.childNodes = entry.childNodes.filter(function (el) {
      return el.nodeName === 'head' || el.nodeName === 'body';
    });
  }

  return entry;
}

},{"../util/pools":16}],6:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = patchNode;

var _memory = _dereq_('../util/memory');

var _parser = _dereq_('../util/parser');

var _render = _dereq_('../util/render');

var _make = _dereq_('./make');

var _make2 = _interopRequireDefault(_make);

var _process = _dereq_('../patches/process');

var _process2 = _interopRequireDefault(_process);

var _sync = _dereq_('./sync');

var _sync2 = _interopRequireDefault(_sync);

var _tree = _dereq_('./tree');

var _pools = _dereq_('../util/pools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Patches an element's DOM to match that of the passed markup.
 *
 * @param element
 * @param newHTML
 * @param options
 */
function patchNode(element, newHTML, options) {
  // The element meta object is a location to associate metadata with the
  // currently rendering element. This prevents attaching properties to the
  // instance itself.
  var elementMeta = _tree.TreeCache.get(element) || {};

  // Last options used.
  elementMeta.options = options;

  // Always ensure the most up-to-date meta object is stored.
  _tree.TreeCache.set(element, elementMeta);

  var bufferSet = false;
  var isInner = options.inner;
  var previousMarkup = elementMeta.previousMarkup;

  // If this element is already rendering, add this new render request into the
  // buffer queue. Check and see if any element is currently rendering, can
  // only do one at a time.
  _tree.TreeCache.forEach(function iterateTreeCache(_elementMeta, _element) {
    if (_elementMeta.isRendering) {
      elementMeta.renderBuffer = { element: element, newHTML: newHTML, options: options };
      bufferSet = true;
    }
  });

  // Short circuit the rest of this render.
  if (bufferSet) {
    return;
  }

  var sameInnerHTML = isInner ? previousMarkup === element.innerHTML : true;
  var sameOuterHTML = !isInner ? previousMarkup === element.outerHTML : true;
  var sameTextContent = elementMeta._textContent === element.textContent;

  // If the contents haven't changed, abort, since there is no point in
  // continuing. Only support this if the new markup is a string, otherwise
  // it's possible for our object recycling to match twice.
  if (typeof newHTML === 'string' && elementMeta.newHTML === newHTML) {
    return;
  }
  // Associate the last markup rendered with this element.
  else if (typeof newHTML === 'string') {
      elementMeta.newHTML = newHTML;
    }

  var rebuildTree = function rebuildTree() {
    var oldTree = elementMeta.oldTree;

    if (oldTree) {
      (0, _memory.unprotectElement)(oldTree);
    }

    elementMeta.oldTree = (0, _memory.protectElement)((0, _make2.default)(element));
  };

  if (!sameInnerHTML || !sameOuterHTML || !sameTextContent) {
    rebuildTree();
  }

  // We're rendering in the UI thread.
  elementMeta.isRendering = true;

  var newTree = null;

  if (typeof newHTML === 'string') {
    var childNodes = (0, _parser.parse)(newHTML).childNodes;
    newTree = isInner ? childNodes : childNodes[0];
  } else if (newHTML.ownerDocument) {
    var vTree = (0, _make2.default)(newHTML);
    newTree = vTree.nodeType === 11 ? vTree.childNodes : vTree;
  } else {
    newTree = newHTML;
  }

  if (options.inner) {
    newTree = {
      childNodes: [].concat(newTree),
      attributes: elementMeta.oldTree.attributes,
      nodeName: elementMeta.oldTree.nodeName,
      nodeValue: elementMeta.oldTree.nodeValue
    };
  }

  // Synchronize the tree.
  var patches = (0, _sync2.default)(elementMeta.oldTree, newTree);
  var invokeRender = (0, _render.completeRender)(element, elementMeta);

  // Process the data immediately and wait until all transition callbacks
  // have completed.
  var promises = (0, _process2.default)(element, patches);

  // Operate synchronously unless opted into a Promise-chain.
  if (promises.length) {
    Promise.all(promises).then(invokeRender, function (ex) {
      return console.log(ex);
    });
  } else {
    invokeRender();
  }
}

},{"../patches/process":10,"../util/memory":14,"../util/parser":15,"../util/pools":16,"../util/render":17,"./make":5,"./sync":8,"./tree":9}],7:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = releaseNode;

var _tree = _dereq_('./tree');

var _memory = _dereq_('../util/memory');

var _pools = _dereq_('../util/pools');

/**
 * Release's the allocated objects and recycles internal memory.
 *
 * @param element
 */
function releaseNode(element) {
  var elementMeta = _tree.TreeCache.get(element);

  // Do not remove an element that is in process of rendering. User intentions
  // come first, so if we are cleaning up an element being used by another part
  // of the code, keep it alive.
  if (elementMeta) {
    // If there was a tree set up, recycle the memory allocated for it.
    if (elementMeta.oldTree) {
      (0, _memory.unprotectElement)(elementMeta.oldTree);
    }

    // Remove this element's meta object from the cache.
    _tree.TreeCache.delete(element);
  }

  (0, _memory.cleanMemory)();
}

},{"../util/memory":14,"../util/pools":16,"./tree":9}],8:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CHANGE_TEXT = exports.MODIFY_ATTRIBUTE = exports.MODIFY_ELEMENT = exports.REPLACE_ENTIRE_ELEMENT = exports.REMOVE_ENTIRE_ELEMENT = exports.REMOVE_ELEMENT_CHILDREN = undefined;
exports.default = sync;

var _pools = _dereq_('../util/pools');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var slice = Array.prototype.slice;
var filter = Array.prototype.filter;

// Patch actions.
var REMOVE_ELEMENT_CHILDREN = exports.REMOVE_ELEMENT_CHILDREN = -2;
var REMOVE_ENTIRE_ELEMENT = exports.REMOVE_ENTIRE_ELEMENT = -1;
var REPLACE_ENTIRE_ELEMENT = exports.REPLACE_ENTIRE_ELEMENT = 0;
var MODIFY_ELEMENT = exports.MODIFY_ELEMENT = 1;
var MODIFY_ATTRIBUTE = exports.MODIFY_ATTRIBUTE = 2;
var CHANGE_TEXT = exports.CHANGE_TEXT = 3;

/**
 * Synchronizes changes from the newTree into the oldTree.
 *
 * @param oldTree
 * @param newTree
 * @param patches - optional
 */
function sync(oldTree, newTree, patches) {
  patches = patches || [];

  if (!Array.isArray(patches)) {
    throw new Error('Missing Array to sync patches into');
  }

  if (!oldTree) {
    throw new Error('Missing existing tree to sync');
  }

  // Flatten out childNodes that are arrays.
  if (newTree && newTree.childNodes) {
    var hasArray = newTree.childNodes.some(function (node) {
      return Array.isArray(node);
    });

    if (hasArray) {
      (function () {
        var newChildNodes = [];

        newTree.childNodes.forEach(function (childNode) {
          if (Array.isArray(childNode)) {
            newChildNodes.push.apply(newChildNodes, childNode);
          } else {
            newChildNodes.push(childNode);
          }
        });

        newTree.childNodes = newChildNodes;
      })();
    }
  }

  var oldNodeValue = oldTree.nodeValue;
  var oldChildNodes = oldTree.childNodes;
  var oldChildNodesLength = oldChildNodes ? oldChildNodes.length : 0;
  var oldNodeName = oldTree.nodeName;
  var oldIsTextNode = oldNodeName === '#text';

  if (!newTree) {
    var removed = [oldTree].concat(oldChildNodes.splice(0, oldChildNodesLength));

    patches.push({
      __do__: REMOVE_ENTIRE_ELEMENT,
      element: oldTree,
      toRemove: removed
    });

    return patches;
  }

  var nodeValue = newTree.nodeValue;
  var childNodes = newTree.childNodes;
  var childNodesLength = childNodes ? childNodes.length : 0;
  var nodeName = newTree.nodeName;
  var newIsTextNode = nodeName === '#text';
  var oldIsFragment = oldTree.nodeName === '#document-fragment';
  var newIsFragment = newTree.nodeName === '#document-fragment';
  var skipAttributeCompare = false;

  // Replace the key attributes.
  oldTree.key = newTree.key;

  // Fragments should not compare attributes.
  if (oldIsFragment || newIsFragment) {
    skipAttributeCompare = true;
  }
  // If the element we're replacing is totally different from the previous
  // replace the entire element, don't bother investigating children.
  else if (oldTree.nodeName !== newTree.nodeName) {
      patches.push({
        __do__: REPLACE_ENTIRE_ELEMENT,
        old: oldTree,
        new: newTree
      });

      return patches;
    }
    // This element never changes.
    else if (oldTree === newTree) {
        return patches;
      }

  var areTextNodes = oldIsTextNode && newIsTextNode;

  // If the top level nodeValue has changed we should reflect it.
  if (areTextNodes && oldNodeValue !== nodeValue) {
    patches.push({
      __do__: CHANGE_TEXT,
      element: oldTree,
      value: newTree.nodeValue
    });

    oldTree.nodeValue = newTree.nodeValue;

    return patches;
  }

  // Ensure keys exist for all the old & new elements.
  var noOldKeys = !oldChildNodes.some(function (oldChildNode) {
    return oldChildNode.key;
  });
  var newKeys = null;
  var oldKeys = null;

  if (!noOldKeys) {
    newKeys = new Set(childNodes.map(function (childNode) {
      return String(childNode.key);
    }).filter(Boolean));

    oldKeys = new Set(oldChildNodes.map(function (childNode) {
      return String(childNode.key);
    }).filter(Boolean));
  }

  // Most common additive elements.
  if (childNodesLength > oldChildNodesLength) {
    // Store elements in a DocumentFragment to increase performance and be
    // generally simplier to work with.
    var fragment = [];

    for (var i = oldChildNodesLength; i < childNodesLength; i++) {
      // Internally add to the tree.
      oldChildNodes.push(childNodes[i]);

      // Add to the document fragment.
      fragment.push(childNodes[i]);
    }

    oldChildNodesLength = oldChildNodes.length;

    // Assign the fragment to the patches to be injected.
    patches.push({
      __do__: MODIFY_ELEMENT,
      element: oldTree,
      fragment: fragment
    });
  }

  // Remove these elements.
  if (oldChildNodesLength > childNodesLength) {
    (function () {
      // For now just splice out the end items.
      var diff = oldChildNodesLength - childNodesLength;
      var toRemove = [];
      var shallowClone = [].concat(_toConsumableArray(oldChildNodes));

      // There needs to be keys to diff, if not, there's no point in checking.
      if (noOldKeys) {
        toRemove = oldChildNodes.splice(oldChildNodesLength - diff, diff);
      }
      // This is an expensive operation so we do the above check to ensure that a
      // key was specified.
      else {
          (function () {
            var keysToRemove = {};
            var truthy = 1;

            // Find the keys in the sets to remove.
            oldKeys.forEach(function (key) {
              if (!newKeys.has(key)) {
                keysToRemove[key] = truthy;
              }
            });

            // If the original childNodes contain a key attribute, use this to
            // compare over the naive method below.
            shallowClone.forEach(function (oldChildNode, i) {
              if (toRemove.length >= diff) {
                return;
              } else if (keysToRemove[oldChildNode.key]) {
                var nextChild = oldChildNodes[i + 1];
                var nextIsTextNode = nextChild && nextChild.nodeType === 3;
                var count = 1;

                // Always remove whitespace in between the elements.
                if (nextIsTextNode && toRemove.length + 2 <= diff) {
                  count = 2;
                }
                // All siblings must contain a key attribute if they exist.
                else if (nextChild && nextChild.nodeType === 1 && !nextChild.key) {
                    throw new Error('\n              All element siblings must consistently contain key attributes.\n            '.trim());
                  }

                // Find the index position from the original array.
                var indexPos = oldChildNodes.indexOf(oldChildNode);

                // Find all the items to remove.
                toRemove.push.apply(toRemove, oldChildNodes.splice(indexPos, count));
              }
            });
          })();
        }

      // Ensure we don't remove too many elements by accident;
      toRemove.length = diff;

      // Ensure our internal length check is matched.
      oldChildNodesLength = oldChildNodes.length;

      if (childNodesLength === 0) {
        patches.push({
          __do__: REMOVE_ELEMENT_CHILDREN,
          element: oldTree,
          toRemove: toRemove
        });
      } else {
        // Remove the element, this happens before the splice so that we still
        // have access to the element.
        toRemove.forEach(function (old) {
          return patches.push({
            __do__: MODIFY_ELEMENT,
            old: old
          });
        });
      }
    })();
  }

  // Replace elements if they are different.
  if (oldChildNodesLength >= childNodesLength) {
    for (var _i = 0; _i < childNodesLength; _i++) {
      if (oldChildNodes[_i].nodeName !== childNodes[_i].nodeName) {
        // Add to the patches.
        patches.push({
          __do__: MODIFY_ELEMENT,
          old: oldChildNodes[_i],
          new: childNodes[_i]
        });

        // Replace the internal tree's point of view of this element.
        oldChildNodes[_i] = childNodes[_i];
      } else {
        sync(oldChildNodes[_i], childNodes[_i], patches);
      }
    }
  }

  // Synchronize attributes
  var attributes = newTree.attributes;

  if (!skipAttributeCompare && attributes) {
    var oldLength = oldTree.attributes.length;
    var newLength = attributes.length;

    // Start with the most common, additive.
    if (newLength > oldLength) {
      var toAdd = slice.call(attributes, oldLength);

      for (var _i2 = 0; _i2 < toAdd.length; _i2++) {
        var change = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: toAdd[_i2].name,
          value: toAdd[_i2].value
        };

        var attr = _pools.pools.attributeObject.get();
        attr.name = toAdd[_i2].name;
        attr.value = toAdd[_i2].value;

        _pools.pools.attributeObject.protect(attr);

        // Push the change object into into the virtual tree.
        oldTree.attributes.push(attr);

        // Add the change to the series of patches.
        patches.push(change);
      }
    }

    // Check for removals.
    if (oldLength > newLength) {
      var _toRemove = slice.call(oldTree.attributes, newLength);

      for (var _i3 = 0; _i3 < _toRemove.length; _i3++) {
        var _change = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: _toRemove[_i3].name,
          value: undefined
        };

        // Remove the attribute from the virtual node.
        var _removed = oldTree.attributes.splice(_i3, 1);

        for (var _i4 = 0; _i4 < _removed.length; _i4++) {
          _pools.pools.attributeObject.unprotect(_removed[_i4]);
        }

        // Add the change to the series of patches.
        patches.push(_change);
      }
    }

    // Check for modifications.
    var toModify = attributes;

    for (var _i5 = 0; _i5 < toModify.length; _i5++) {
      var oldAttrName = oldTree.attributes[_i5] && oldTree.attributes[_i5].name;
      var oldAttrValue = oldTree.attributes[_i5] && oldTree.attributes[_i5].value;
      var newAttrName = attributes[_i5] && attributes[_i5].name;
      var newAttrValue = attributes[_i5] && attributes[_i5].value;

      // Only push in a change if the attribute or value changes.
      if (oldAttrValue !== newAttrValue) {
        var _change2 = {
          __do__: MODIFY_ATTRIBUTE,
          element: oldTree,
          name: oldTree.attributes[_i5].name,
          value: toModify[_i5].value
        };

        // Replace the attribute in the virtual node.
        var _attr = oldTree.attributes[_i5];

        // If the attribute names change, this is a removal.
        if (oldAttrName === newAttrName) {
          _attr.value = toModify[_i5].value;
        } else {
          _change2.name = newAttrName ? newAttrName : oldAttrName;
          _change2.value = toModify[_i5].value ? toModify[_i5].value : undefined;
          _attr.name = newAttrName;
          _attr.value = _change2.value;

          if (!newAttrName && !newAttrName) {
            _pools.pools.attributeObject.unprotect(toModify[_i5]);
          }
        }

        // Add the change to the series of patches.
        patches.push(_change2);
      }
    }
  }

  return patches;
}

},{"../util/pools":16}],9:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Cache prebuilt trees and lookup by element.
var TreeCache = exports.TreeCache = new Map();

},{}],10:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = process;

var _transitions = _dereq_('../transitions');

var transition = _interopRequireWildcard(_transitions);

var _pools = _dereq_('../util/pools');

var _make = _dereq_('../element/make');

var _make2 = _interopRequireDefault(_make);

var _sync = _dereq_('../node/sync');

var sync = _interopRequireWildcard(_sync);

var _tree = _dereq_('../node/tree');

var _memory = _dereq_('../util/memory');

var _entities = _dereq_('../util/entities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var blockTextElements = ['script', 'noscript', 'style', 'pre', 'template'];

var isElement = function isElement(element) {
  return element.nodeType === 1;
};
var slice = Array.prototype.slice;

/**
 * Processes an array of patches.
 *
 * @param element - Element to process patchsets on.
 * @param patches - Array that contains patch objects.
 */
function process(element, patches) {
  //console.log(JSON.parse(JSON.stringify(patches, null, 2)));

  var elementMeta = _tree.TreeCache.get(element);
  var promises = [];
  var triggerTransition = transition.buildTrigger(promises);

  // Trigger the attached transition state for this element and all childNodes.
  var attached = function attached(descriptor, fragment, parentNode) {
    (0, _memory.protectElement)(descriptor);

    var el = (0, _make2.default)(descriptor);

    // If the element added was a DOM text node or SVG text element, trigger
    // the textChanged transition.
    if (descriptor.nodeName === '#text') {
      var textPromises = transition.makePromises('textChanged', [el], null, descriptor.nodeValue);

      el.textContent = (0, _entities.decodeEntities)(descriptor.nodeValue);

      if (parentNode) {
        var nodeName = parentNode.nodeName.toLowerCase();

        if (blockTextElements.indexOf(nodeName) > -1) {
          parentNode.nodeValue = (0, _entities.decodeEntities)(descriptor.nodeValue);
        }
      }

      triggerTransition('textChanged', textPromises, function (promises) {});
    }

    if (descriptor.attributes && descriptor.attributes.length) {
      descriptor.attributes.forEach(function (attr) {
        var attrChangePromises = transition.makePromises('attributeChanged', [el], attr.name, null, attr.value);

        triggerTransition('attributeChanged', attrChangePromises, function (promises) {});
      });
    }

    // Call all `childNodes` attached callbacks as well.
    if (descriptor.childNodes && descriptor.childNodes.length) {
      descriptor.childNodes.forEach(function (x) {
        return attached(x, null, el);
      });
    }

    // If a document fragment was specified, append the real element into it.
    if (fragment) {
      fragment.appendChild(el);
    }

    return el;
  };

  // Loop through all the patches and apply them.

  var _loop = function _loop(i) {
    var patch = patches[i];
    var el = patch.element ? (0, _make2.default)(patch.element) : null;
    var oldEl = patch.old ? (0, _make2.default)(patch.old) : null;
    var newEl = patch.new ? (0, _make2.default)(patch.new) : null;

    // Empty the Node's contents. This is an optimization, since `innerHTML`
    // will be faster than iterating over every element and manually removing.
    if (patch.__do__ === sync.REMOVE_ELEMENT_CHILDREN) {
      var childNodes = slice.call(el.childNodes).filter(isElement);
      var detachPromises = transition.makePromises('detached', childNodes);

      triggerTransition('detached', detachPromises, function (promises) {
        (0, _memory.unprotectElement)(patch.toRemove);
        el.innerHTML = '';
      });
    }

    // Remove the entire Node. Only does something if the Node has a parent
    // element.
    else if (patch.__do__ === sync.REMOVE_ENTIRE_ELEMENT) {
        var _childNodes = [el].filter(isElement);
        var _detachPromises = transition.makePromises('detached', _childNodes);

        if (el.parentNode) {
          triggerTransition('detached', _detachPromises, function (promises) {
            el.parentNode.removeChild(el);
            (0, _memory.unprotectElement)(patch.toRemove);
          });
        } else {
          (0, _memory.unprotectElement)(patch.toRemove);
        }
      }

      // Replace the entire Node.
      else if (patch.__do__ === sync.REPLACE_ENTIRE_ELEMENT) {
          (function () {
            var allPromises = [];

            var attachedPromises = transition.makePromises('attached', [newEl].filter(isElement));

            var detachedPromises = transition.makePromises('detached', [oldEl].filter(isElement));

            var replacedPromises = transition.makePromises('replaced', [oldEl], newEl);

            // Add all the transition state promises into the main array, we'll use
            // them all to decide when to alter the DOM.
            triggerTransition('detached', detachedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
            });

            triggerTransition('attached', attachedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
              attached(patch.new, null, newEl);
            });

            triggerTransition('replaced', replacedPromises, function (promises) {
              allPromises.push.apply(allPromises, promises);
            });

            (0, _memory.unprotectElement)(patch.old);

            // Reset the tree cache.
            _tree.TreeCache.set(newEl, {
              oldTree: patch.new,
              element: newEl
            });

            // Once all the promises have completed, invoke the action, if no
            // promises were added, this will be a synchronous operation.
            if (allPromises.length) {
              Promise.all(allPromises).then(function replaceEntireElement() {
                if (!oldEl.parentNode) {
                  (0, _memory.unprotectElement)(patch.new);

                  throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
                }

                oldEl.parentNode.replaceChild(newEl, oldEl);
              }, function (ex) {
                return console.log(ex);
              });
            } else {
              if (!oldEl.parentNode) {
                (0, _memory.unprotectElement)(patch.new);

                throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
              }

              oldEl.parentNode.replaceChild(newEl, oldEl);
            }
          })();
        }

        // Node manip.
        else if (patch.__do__ === sync.MODIFY_ELEMENT) {
            // Add.
            if (el && patch.fragment && !oldEl) {
              (function () {
                var fragment = document.createDocumentFragment();

                // Loop over every element to be added and process the descriptor
                // into the real element and append into the DOM fragment.
                toAttach = patch.fragment.map(function (el) {
                  return attached(el, fragment, el);
                }).filter(isElement);

                // Turn elements into childNodes of the patch element.

                el.appendChild(fragment);

                // Trigger transitions.
                var makeAttached = transition.makePromises('attached', toAttach);
                triggerTransition('attached', makeAttached);
              })();
            }

            // Remove.
            else if (oldEl && !newEl) {
                if (!oldEl.parentNode) {
                  (0, _memory.unprotectElement)(patch.old);

                  throw new Error('Can\'t remove without parent, is this the ' + 'document root?');
                }

                var makeDetached = transition.makePromises('detached', [oldEl]);

                triggerTransition('detached', makeDetached, function () {
                  if (oldEl.parentNode) {
                    oldEl.parentNode.removeChild(oldEl);
                  }

                  // And then empty out the entire contents.
                  oldEl.innerHTML = '';

                  (0, _memory.unprotectElement)(patch.old);
                });
              }

              // Replace.
              else if (oldEl && newEl) {
                  (function () {
                    if (!oldEl.parentNode) {
                      (0, _memory.unprotectElement)(patch.old);
                      (0, _memory.unprotectElement)(patch.new);

                      throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
                    }

                    // Append the element first, before doing the replacement.
                    if (oldEl.nextSibling) {
                      oldEl.parentNode.insertBefore(newEl, oldEl.nextSibling);
                    } else {
                      oldEl.parentNode.appendChild(newEl);
                    }

                    // Removed state for transitions API.
                    var allPromises = [];

                    var attachPromises = transition.makePromises('attached', [newEl].filter(isElement));

                    var detachPromises = transition.makePromises('detached', [oldEl].filter(isElement));

                    var replacePromises = transition.makePromises('replaced', [oldEl], newEl);

                    triggerTransition('replaced', replacePromises, function (promises) {
                      allPromises.push.apply(allPromises, promises);
                    });

                    triggerTransition('detached', detachPromises, function (promises) {
                      allPromises.push.apply(allPromises, promises);
                    });

                    triggerTransition('attached', attachPromises, function (promises) {
                      allPromises.push.apply(allPromises, promises);
                      attached(patch.new);
                    });

                    // Once all the promises have completed, invoke the action, if no
                    // promises were added, this will be a synchronous operation.
                    if (allPromises.length) {
                      Promise.all(allPromises).then(function replaceElement() {
                        if (oldEl.parentNode) {
                          oldEl.parentNode.replaceChild(newEl, oldEl);
                        }

                        (0, _memory.unprotectElement)(patch.old);

                        (0, _memory.protectElement)(patch.new);
                      }, function (ex) {
                        return console.log(ex);
                      });
                    } else {
                      if (!oldEl.parentNode) {
                        (0, _memory.unprotectElement)(patch.old);
                        (0, _memory.unprotectElement)(patch.new);

                        throw new Error('Can\'t replace without parent, is this the ' + 'document root?');
                      }

                      oldEl.parentNode.replaceChild(newEl, oldEl);
                      (0, _memory.unprotectElement)(patch.old);
                      (0, _memory.protectElement)(patch.new);
                    }
                  })();
                }
          }

          // Attribute manipulation.
          else if (patch.__do__ === sync.MODIFY_ATTRIBUTE) {
              var attrChangePromises = transition.makePromises('attributeChanged', [el], patch.name, el.getAttribute(patch.name), patch.value);

              triggerTransition('attributeChanged', attrChangePromises, function (promises) {
                // Remove.
                if (patch.value === undefined) {
                  el.removeAttribute(patch.name);

                  if (patch.name in el) {
                    el[patch.name] = undefined;
                  }
                }
                // Change attributes.
                else {
                    var isObject = _typeof(patch.value) === 'object';
                    var isFunction = typeof patch.value === 'function';

                    // If not a dynamic type, set as an attribute, since it's a valid
                    // attribute value.
                    if (!isObject && !isFunction) {
                      if (patch.name) {
                        el.setAttribute(patch.name, patch.value);
                      }
                    } else if (typeof patch.value !== 'string') {
                      // Necessary to track the attribute/prop existence.
                      el.setAttribute(patch.name, '');

                      // Since this is a dynamic value it gets set as a property.
                      el[patch.name] = patch.value;
                    }

                    // Support live updating of the value attribute.
                    if (patch.name === 'value' || patch.name === 'checked') {
                      el[patch.name] = patch.value;
                    }
                  }
              });
            }

            // Text node manipulation.
            else if (patch.__do__ === sync.CHANGE_TEXT) {
                var textChangePromises = transition.makePromises('textChanged', [el], el.nodeValue, patch.value);

                triggerTransition('textChanged', textChangePromises, function (promises) {
                  patch.element.nodeValue = (0, _entities.decodeEntities)(patch.value);
                  el.nodeValue = patch.element.nodeValue;

                  if (el.parentNode) {
                    var nodeName = el.parentNode.nodeName.toLowerCase();

                    if (blockTextElements.indexOf(nodeName) > -1) {
                      el.parentNode.nodeValue = (0, _entities.decodeEntities)(patch.element.nodeValue);
                    }
                  }
                });
              }
  };

  for (var i = 0; i < patches.length; i++) {
    var toAttach;

    _loop(i);
  }

  // Return the Promises that were allocated so that rendering can be blocked
  // until they resolve.
  return promises.filter(Boolean);
}

},{"../element/make":1,"../node/sync":8,"../node/tree":9,"../transitions":12,"../util/entities":13,"../util/memory":14,"../util/pools":16}],11:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// List of SVG elements.
var elements = exports.elements = ['altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'svg', 'switch', 'symbol', 'text', 'textPath', 'tref', 'tspan', 'use', 'view', 'vkern'];

// Namespace.
var namespace = exports.namespace = 'http://www.w3.org/2000/svg';

},{}],12:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.states = undefined;
exports.buildTrigger = buildTrigger;
exports.makePromises = makePromises;

var _make = _dereq_('./node/make');

var _make2 = _interopRequireDefault(_make);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var slice = Array.prototype.slice;
var forEach = Array.prototype.forEach;
var concat = Array.prototype.concat;
var empty = { prototype: {} };

/**
 * Contains arrays to store transition callbacks.
 *
 * attached
 * --------
 *
 * For when elements come into the DOM. The callback triggers immediately after
 * the element enters the DOM. It is called with the element as the only
 * argument.
 *
 * detached
 * --------
 *
 * For when elements are removed from the DOM. The callback triggers just
 * before the element leaves the DOM. It is called with the element as the only
 * argument.
 *
 * replaced
 * --------
 *
 * For when elements are replaced in the DOM. The callback triggers after the
 * new element enters the DOM, and before the old element leaves. It is called
 * with old and new elements as arguments, in that order.
 *
 * attributeChanged
 * ----------------
 *
 * Triggered when an element's attribute has changed. The callback triggers
 * after the attribute has changed in the DOM. It is called with the element,
 * the attribute name, old value, and current value.
 *
 * textChanged
 * -----------
 *
 * Triggered when an element's `textContent` chnages. The callback triggers
 * after the textContent has changed in the DOM. It is called with the element,
 * the old value, and current value.
 */
var states = exports.states = {
  attached: [],
  detached: [],
  replaced: [],
  attributeChanged: [],
  textChanged: []
};

// Define the custom signatures necessary for the loop to fill in the "magic"
// methods that process the transitions consistently.
var fnSignatures = {
  attached: {
    mapFn: function mapFn(el) {
      return function (cb) {
        return cb(el);
      };
    }
  },

  detached: {
    mapFn: function mapFn(el) {
      return function (cb) {
        return cb(el);
      };
    }
  },

  replaced: {
    mapFn: function mapFn(oldEl, newEl) {
      return function (cb) {
        return cb(oldEl, newEl);
      };
    }
  },

  attributeChanged: {
    mapFn: function mapFn(el, name, oldVal, newVal) {
      return function (cb) {
        return cb(el, name, oldVal, newVal);
      };
    }
  },

  textChanged: {
    mapFn: function mapFn(el, oldVal, newVal) {
      return function (cb) {
        return cb(el, oldVal, newVal);
      };
    }
  }
};

var make = {};

// Dynamically fill in the custom methods instead of manually constructing
// them.
Object.keys(states).forEach(function iterateStates(stateName) {
  var mapFn = fnSignatures[stateName].mapFn;

  /**
   * Make's the transition promises.
   *
   * @param elements
   * @param args
   * @param promises
   */
  make[stateName] = function makeTransitionPromises(elements, args, promises) {
    forEach.call(elements, function (element) {
      // Never pass text nodes to a state callback unless it is textChanged.
      if (stateName !== 'textChanged' && element.nodeType !== 1) {
        return;
      }

      // Call the map function with each element.
      var newPromises = states[stateName].map(mapFn.apply(null, [element].concat(args))).filter(Boolean);

      // Merge these Promises into the main cache.
      promises.push.apply(promises, newPromises);

      // Recursively call into the children if attached or detached.
      if (stateName === 'attached' || stateName === 'detached') {
        make[stateName](element.childNodes, args, promises);
      }
    });

    return promises;
  };
});

/**
 * Builds a reusable trigger mechanism for the element transitions.
 *
 * @param stateName
 * @param nodes
 * @param callback
 * @return
 */
function buildTrigger(allPromises) {
  var addPromises = allPromises.push.apply.bind(allPromises.push, allPromises);

  // This becomes `triggerTransition` in process.js.
  return function (stateName, makePromisesCallback, callback) {
    if (states[stateName] && states[stateName].length) {
      // Calls into each custom hook to bind Promises into the local array,
      // these will then get merged into the main `allPromises` array.
      var promises = makePromisesCallback([]);

      // Add these promises into the global cache.
      addPromises(promises);

      if (!promises.length && callback) {
        callback(promises);
      } else {
        Promise.all(promises).then(callback, function handleRejection(ex) {
          console.log(ex);
        });
      }
    } else if (callback) {
      callback();
    }
  };
}

/**
 * Make a reusable function for easy transition calling.
 *
 * @param stateName
 * @param elements
 * @return
 */
function makePromises(stateName) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  // Ensure elements is always an array.
  var elements = [].concat(args[0]);

  // Accepts the local Array of promises to use.
  return function (promises) {
    return make[stateName](elements, args.slice(1), promises);
  };
}

},{"./node/make":5}],13:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeEntities = decodeEntities;
var element = document.createElement('div');

/**
 * Decodes HTML strings.
 *
 * @see http://stackoverflow.com/a/5796718
 * @param string
 * @return unescaped HTML
 */
function decodeEntities(string) {
  // If there are no HTML entities, we can safely pass the string through.
  if (!string || !string.indexOf || string.indexOf('&') === -1) {
    return string;
  }

  element.innerHTML = string;
  return element.textContent;
}

},{}],14:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.protectElement = protectElement;
exports.unprotectElement = unprotectElement;
exports.cleanMemory = cleanMemory;

var _pools = _dereq_('../util/pools');

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Ensures that an element is not recycled during a render cycle.
 *
 * @param element
 * @return element
 */
function protectElement(element) {
  if (Array.isArray(element)) {
    return element.forEach(protectElement);
  }

  var elementObject = _pools.pools.elementObject;
  var attributeObject = _pools.pools.attributeObject;

  elementObject.protect(element);

  element.attributes.forEach(attributeObject.protect, attributeObject);
  element.childNodes.forEach(protectElement);

  return element;
}

/**
 * Allows an element to be recycled during a render cycle.
 *
 * @param element
 * @return
 */
function unprotectElement(element) {
  if (Array.isArray(element)) {
    return element.forEach(unprotectElement);
  }

  var elementObject = _pools.pools.elementObject;
  var attributeObject = _pools.pools.attributeObject;

  elementObject.unprotect(element);

  element.attributes.forEach(attributeObject.unprotect, attributeObject);
  element.childNodes.forEach(unprotectElement);

  _make2.default.nodes.delete(element);

  return element;
}

/**
 * Recycles all unprotected allocations.
 */
function cleanMemory() {
  var elementCache = _pools.pools.elementObject.cache;
  var attributeCache = _pools.pools.attributeObject.cache;

  // Empty all element allocations.
  elementCache.allocated.forEach(function (v) {
    if (elementCache.free.length < _pools.count) {
      elementCache.free.push(v);
    }
  });

  elementCache.allocated.clear();

  // Clean out unused elements.
  _make2.default.nodes.forEach(function (node, descriptor) {
    if (!elementCache.protected.has(descriptor)) {
      _make2.default.nodes.delete(descriptor);
    }
  });

  // Empty all attribute allocations.
  attributeCache.allocated.forEach(function (v) {
    if (attributeCache.free.length < _pools.count) {
      attributeCache.free.push(v);
    }
  });

  attributeCache.allocated.clear();
}

},{"../node/make":5,"../util/pools":16}],15:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

var _pools = _dereq_('./pools');

var slice = Array.prototype.slice; // Code based off of:
// https://github.com/ashi009/node-fast-html-parser

var kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z\-][a-z0-9\-]*)\s*([^>]*?)(\/?)>/ig;

var kAttributePattern = /\b(id|class)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;

var reAttrPattern = /\b([_a-z][_a-z0-9\-]*)\s*(=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig;

var kSelfClosingElements = {
  meta: true,
  img: true,
  link: true,
  input: true,
  area: true,
  br: true,
  hr: true
};

var kElementsClosedByOpening = {
  li: {
    li: true
  },

  p: {
    p: true, div: true
  },

  td: {
    td: true, th: true
  },

  th: {
    td: true, th: true
  }
};

var kElementsClosedByClosing = {
  li: {
    ul: true, ol: true
  },

  a: {
    div: true
  },

  b: {
    div: true
  },

  i: {
    div: true
  },

  p: {
    div: true
  },

  td: {
    tr: true, table: true
  },

  th: {
    tr: true, table: true
  }
};

var kBlockTextElements = {
  script: true,
  noscript: true,
  style: true,
  template: true
};

var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
function TextNode(value) {
  var instance = _pools.pools.elementObject.get();

  instance.nodeName = '#text';
  instance.nodeValue = value;
  instance.nodeType = 3;
  instance.key = '';
  instance.childNodes.length = 0;
  instance.attributes.length = 0;

  return instance;
}

/**
 * HTMLElement, which contains a set of children.
 *
 * Note: this is a minimalist implementation, no complete tree structure
 * provided (no parentNode, nextSibling, previousSibling etc).
 *
 * @param {string} name     nodeName
 * @param {Object} keyAttrs id and class attribute
 * @param {Object} rawAttrs attributes in string
 * @param {Object} supplemental data
 */
function HTMLElement(name, keyAttrs, rawAttrs, supplemental) {
  var instance = _pools.pools.elementObject.get();

  instance.nodeName = name;
  instance.nodeValue = '';
  instance.nodeType = 1;
  instance.key = '';
  instance.childNodes.length = 0;
  instance.attributes.length = 0;

  if (rawAttrs) {
    for (var match; match = reAttrPattern.exec(rawAttrs);) {
      var attr = _pools.pools.attributeObject.get();

      attr.name = match[1];
      attr.value = match[6] || match[5] || match[4] || match[1];

      if (attr.value === '__DIFFHTML__') {
        attr.value = supplemental.props.shift();
      }

      // If a key attribute is found attach directly to the instance.
      if (attr.name === 'key') {
        instance.key = attr.value;
      }

      // Look for empty attributes.
      if (match[6] === '""') {
        attr.value = '';
      }

      instance.attributes.push(attr);
    }
  }

  return instance;
}

/**
 * Parses HTML and returns a root element
 *
 * @param  {string} data      html
 * @param  {array} supplemental      data
 * @return {HTMLElement}      root element
 */
function parse(data, supplemental) {
  var rootObject = {};
  var root = HTMLElement(null, rootObject);
  var currentParent = root;
  var stack = [root];
  var lastTextPos = -1;

  // If there are no HTML elements, treat the passed in data as a single
  // text node.
  if (data.indexOf('<') === -1 && data) {
    currentParent.childNodes.push(TextNode(data));
    return root;
  }

  for (var match, text; match = kMarkupPattern.exec(data);) {
    if (lastTextPos > -1) {
      if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
        // if has content
        text = data.slice(lastTextPos, kMarkupPattern.lastIndex - match[0].length);

        if (text && text.trim && text.trim() === '__DIFFHTML__') {
          var value = supplemental.children.shift();
          var childrenToAdd = [].concat(value);

          currentParent.childNodes.push.apply(currentParent.childNodes, childrenToAdd);
        } else {
          currentParent.childNodes.push(TextNode(text));
        }
      }
    }

    lastTextPos = kMarkupPattern.lastIndex;

    // This is a comment.
    if (match[0][1] === '!') {
      continue;
    }

    if (!match[1]) {
      // not </ tags
      var attrs = {};

      for (var attMatch; attMatch = kAttributePattern.exec(match[3]);) {
        attrs[attMatch[1]] = attMatch[3] || attMatch[4] || attMatch[5];
      }

      if (!match[4] && kElementsClosedByOpening[currentParent.nodeName]) {
        if (kElementsClosedByOpening[currentParent.nodeName][match[2]]) {
          stack.pop();
          currentParent = stack[stack.length - 1];
        }
      }

      currentParent = currentParent.childNodes[currentParent.childNodes.push(HTMLElement(match[2], attrs, match[3], supplemental)) - 1];

      stack.push(currentParent);

      if (kBlockTextElements[match[2]]) {
        // A little test to find next </script> or </style> ...
        var closeMarkup = '</' + match[2] + '>';
        var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
        var length = match[2].length;

        if (index === -1) {
          lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
        } else {
          lastTextPos = index + closeMarkup.length;
          kMarkupPattern.lastIndex = lastTextPos;
          match[1] = true;
        }

        var newText = data.slice(match.index + match[0].length, index);

        if (newText.trim()) {
          newText = slice.call(newText).map(function (ch) {
            return escapeMap[ch] || ch;
          }).join('');

          currentParent.childNodes.push(TextNode(newText));
        }
      }
    }
    if (match[1] || match[4] || kSelfClosingElements[match[2]]) {
      // </ or /> or <br> etc.
      while (currentParent) {
        if (currentParent.nodeName == match[2]) {
          stack.pop();
          currentParent = stack[stack.length - 1];

          break;
        } else {
          var tag = kElementsClosedByClosing[currentParent.nodeName];

          // Trying to close current tag, and move on
          if (tag) {
            if (tag[match[2]]) {
              stack.pop();
              currentParent = stack[stack.length - 1];

              continue;
            }
          }

          // Use aggressive strategy to handle unmatching markups.
          break;
        }
      }
    }
  }

  // Find any last remaining text after the parsing completes over tags.
  var remainingText = data.slice(lastTextPos).trim();

  // If the text exists and isn't just whitespace, push into a new TextNode.
  if (remainingText) {
    currentParent.childNodes.push(TextNode(remainingText));
  }

  // This is an entire document, so only allow the HTML children to be
  // body or head.
  if (root.childNodes.length && root.childNodes[0].nodeName === 'html') {
    (function () {
      // Store elements from before body end and after body end.
      var head = { before: [], after: [] };
      var body = { after: [] };
      var beforeHead = true;
      var beforeBody = true;
      var HTML = root.childNodes[0];

      // Iterate the children and store elements in the proper array for
      // later concat, replace the current childNodes with this new array.
      HTML.childNodes = HTML.childNodes.filter(function (el) {
        // If either body or head, allow as a valid element.
        if (el.nodeName === 'body' || el.nodeName === 'head') {
          if (el.nodeName === 'head') {
            beforeHead = false;
          }

          if (el.nodeName === 'body') {
            beforeBody = false;
          }

          return true;
        }
        // Not a valid nested HTML tag element, move to respective container.
        else if (el.nodeType === 1) {
            if (beforeHead && beforeBody) {
              head.before.push(el);
            } else if (!beforeHead && beforeBody) {
              head.after.push(el);
            } else if (!beforeBody) {
              body.after.push(el);
            }
          }
      });

      // Ensure the first element is the HEAD tag.
      if (!HTML.childNodes[0] || HTML.childNodes[0].nodeName !== 'head') {
        var headInstance = _pools.pools.elementObject.get();
        headInstance.nodeName = 'head';
        headInstance.childNodes.length = 0;
        headInstance.attributes.length = 0;

        var existing = headInstance.childNodes;
        existing.unshift.apply(existing, head.before);
        existing.push.apply(existing, head.after);

        HTML.childNodes.unshift(headInstance);
      } else {
        var _existing = HTML.childNodes[0].childNodes;
        _existing.unshift.apply(_existing, head.before);
        _existing.push.apply(_existing, head.after);
      }

      // Ensure the second element is the body tag.
      if (!HTML.childNodes[1] || HTML.childNodes[1].nodeName !== 'body') {
        var bodyInstance = _pools.pools.elementObject.get();
        bodyInstance.nodeName = 'body';
        bodyInstance.childNodes.length = 0;
        bodyInstance.attributes.length = 0;

        var _existing2 = bodyInstance.childNodes;
        _existing2.push.apply(_existing2, body.after);

        HTML.childNodes.push(bodyInstance);
      } else {
        var _existing3 = HTML.childNodes[1].childNodes;
        _existing3.push.apply(_existing3, body.after);
      }
    })();
  }

  return root;
}

},{"./pools":16}],16:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPool = createPool;
exports.initializePools = initializePools;
var pools = exports.pools = {};
var count = exports.count = 10000;

/**
 * Creates a pool to query new or reused values from.
 *
 * @param name
 * @param opts
 * @return {Object} pool
 */
function createPool(name, opts) {
  var size = opts.size;
  var fill = opts.fill;

  var cache = {
    free: [],
    allocated: new Set(),
    protected: new Set()
  };

  // Prime the cache with n objects.
  for (var i = 0; i < size; i++) {
    cache.free.push(fill());
  }

  return {
    cache: cache,

    get: function get() {
      var value = cache.free.pop() || fill();
      cache.allocated.add(value);
      return value;
    },
    protect: function protect(value) {
      cache.allocated.delete(value);
      cache.protected.add(value);
    },
    unprotect: function unprotect(value) {
      if (cache.protected.has(value)) {
        cache.protected.delete(value);
        cache.free.push(value);
      }
    }
  };
}

function initializePools(COUNT) {
  pools.attributeObject = createPool('attributeObject', {
    size: COUNT,

    fill: function fill() {
      return { name: '', value: '' };
    }
  });

  pools.elementObject = createPool('elementObject', {
    size: COUNT,

    fill: function fill() {
      return {
        nodeName: '',
        nodeValue: '',
        nodeType: 1,
        key: '',
        childNodes: [],
        attributes: []
      };
    }
  });
}

// Create ${COUNT} items of each type.
initializePools(count);

},{}],17:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.completeRender = completeRender;

var _patch = _dereq_('../node/patch');

var _patch2 = _interopRequireDefault(_patch);

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

var _tree = _dereq_('../node/tree');

var _memory = _dereq_('../util/memory');

var _pools = _dereq_('../util/pools');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * renderNext
 *
 * @param elementMeta
 * @return
 */
function renderNext(elementMeta) {
  var nextRender = elementMeta.renderBuffer;
  elementMeta.renderBuffer = undefined;

  // Noticing some weird performance implications with this concept.
  (0, _patch2.default)(nextRender.element, nextRender.newHTML, nextRender.options);
}

/**
 * When the render completes, clean up memory, and schedule the next render if
 * necessary.
 *
 * @param element
 * @param elementMeta
 */
function completeRender(element, elementMeta) {
  return function invokeRender() {
    elementMeta.previousMarkup = elementMeta.options.inner ? element.innerHTML : element.outerHTML;
    elementMeta._textContent = element.textContent;

    elementMeta.isRendering = false;

    // Boolean to stop operations in the TreeCache loop below.
    var stopLooping = false;

    // This is designed to handle use cases where renders are being hammered
    // or when transitions are used with Promises.
    if (elementMeta.renderBuffer) {
      renderNext(elementMeta);
    } else {
      _tree.TreeCache.forEach(function iterateTreeCache(elementMeta) {
        if (!stopLooping && elementMeta.renderBuffer) {
          renderNext(elementMeta);
          stopLooping = true;
        }
      });
    }

    // Clean out all the existing allocations.
    (0, _memory.cleanMemory)();

    // Dispatch an event on the element once rendering has completed.
    element.dispatchEvent(new CustomEvent('renderComplete'));
  };
}

},{"../node/make":5,"../node/patch":6,"../node/tree":9,"../util/memory":14,"../util/pools":16}],18:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.createElement = createElement;
exports.createAttribute = createAttribute;

var _pools = _dereq_('./pools');

var _parser = _dereq_('./parser');

var _make = _dereq_('../node/make');

var _make2 = _interopRequireDefault(_make);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * TODO Phase this out if possible, super slow iterations...
 *
 * @param childNodes
 * @return
 */
function normalizeChildNodes(childNodes) {
  var newChildNodes = [];

  [].concat(childNodes).forEach(function (childNode) {
    if ((typeof childNode === 'undefined' ? 'undefined' : _typeof(childNode)) !== 'object') {
      if (childNode.indexOf && childNode.indexOf('<') > -1) {
        var nodes = (0, _parser.parse)(childNode).childNodes;
        newChildNodes.push(nodes.length === 1 ? nodes[0] : nodes);
      } else {
        newChildNodes.push(createElement('#text', null, childNode));
      }
    } else if ('length' in childNode) {
      for (var i = 0; i < childNode.length; i++) {
        var newChild = childNode[i];
        var newNode = newChild.ownerDocument ? (0, _make2.default)(newChild) : newChild;

        newChildNodes.push(newNode);
      }
    } else {
      var node = childNode.ownerDocument ? (0, _make2.default)(childNode) : childNode;
      newChildNodes.push(node);
    }
  });

  return newChildNodes;
}

/**
 * Creates a virtual element used in or as a virtual tree.
 *
 * @param nodeName
 * @param attributes
 * @param childNodes
 * @return {Object} element
 */
function createElement(nodeName, attributes, childNodes) {
  if (nodeName === '') {
    return normalizeChildNodes(childNodes);
  }

  var entry = _pools.pools.elementObject.get();
  var isTextNode = nodeName === 'text' || nodeName === '#text';

  entry.key = '';
  entry.nodeName = nodeName;

  if (!isTextNode) {
    entry.nodeType = 1;
    entry.nodeValue = '';
    entry.attributes = attributes || [];
    entry.childNodes = normalizeChildNodes(childNodes);

    // Set the key prop if passed as an attr.
    entry.attributes.some(function (attr) {
      if (attr.name === 'key') {
        entry.key = attr.value;
        return true;
      }
    });
  } else {
    var value = Array.isArray(childNodes) ? childNodes.join('') : childNodes;

    entry.nodeType = 3;
    entry.nodeValue = value;
    entry.attributes.length = 0;
    entry.childNodes.length = 0;
  }

  return entry;
}

/**
 * Creates a virtual attribute used in a virtual element.
 *
 * @param name
 * @param value
 * @return {Object} attribute
 */
function createAttribute(name, value) {
  var entry = _pools.pools.attributeObject.get();

  entry.name = name;
  entry.value = value;

  return entry;
}

},{"../node/make":5,"./parser":15,"./pools":16}]},{},[4])(4)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(_dereq_,module,exports){
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetPrototype = Object.getPrototypeOf;

/**
 * Gets the `[[Prototype]]` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {null|Object} Returns the `[[Prototype]]`.
 */
function getPrototype(value) {
  return nativeGetPrototype(Object(value));
}

module.exports = getPrototype;

},{}],12:[function(_dereq_,module,exports){
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

module.exports = isHostObject;

},{}],13:[function(_dereq_,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],14:[function(_dereq_,module,exports){
var getPrototype = _dereq_('./_getPrototype'),
    isHostObject = _dereq_('./_isHostObject'),
    isObjectLike = _dereq_('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object,
 *  else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

module.exports = isPlainObject;

},{"./_getPrototype":11,"./_isHostObject":12,"./isObjectLike":13}],15:[function(_dereq_,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};
var pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};
var formatTime = function formatTime(time) {
  return "@ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use the new performance api to get better precision if available
var timer = typeof performance !== "undefined" && typeof performance.now === "function" ? performance : Date;

/**
 * parse the level option of createLogger
 *
 * @property {string | function | object} level - console[level]
 * @property {object} action
 * @property {array} payload
 * @property {string} type
 */

function getLogLevel(level, action, payload, type) {
  switch (typeof level === "undefined" ? "undefined" : _typeof(level)) {
    case "object":
      return typeof level[type] === "function" ? level[type].apply(level, _toConsumableArray(payload)) : level[type];
    case "function":
      return level(action);
    default:
      return level;
  }
}

/**
 * Creates logger with followed options
 *
 * @namespace
 * @property {object} options - options for logger
 * @property {string | function | object} options.level - console[level]
 * @property {boolean} options.duration - print duration of each action?
 * @property {boolean} options.timestamp - print timestamp with each action?
 * @property {object} options.colors - custom colors
 * @property {object} options.logger - implementation of the `console` API
 * @property {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @property {boolean} options.collapsed - is group collapsed?
 * @property {boolean} options.predicate - condition which resolves logger behavior
 * @property {function} options.stateTransformer - transform state before print
 * @property {function} options.actionTransformer - transform action before print
 * @property {function} options.errorTransformer - transform error before print
 */

function createLogger() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$level = options.level;
  var level = _options$level === undefined ? "log" : _options$level;
  var _options$logger = options.logger;
  var logger = _options$logger === undefined ? console : _options$logger;
  var _options$logErrors = options.logErrors;
  var logErrors = _options$logErrors === undefined ? true : _options$logErrors;
  var collapsed = options.collapsed;
  var predicate = options.predicate;
  var _options$duration = options.duration;
  var duration = _options$duration === undefined ? false : _options$duration;
  var _options$timestamp = options.timestamp;
  var timestamp = _options$timestamp === undefined ? true : _options$timestamp;
  var transformer = options.transformer;
  var _options$stateTransfo = options.stateTransformer;
  var // deprecated
  stateTransformer = _options$stateTransfo === undefined ? function (state) {
    return state;
  } : _options$stateTransfo;
  var _options$actionTransf = options.actionTransformer;
  var actionTransformer = _options$actionTransf === undefined ? function (actn) {
    return actn;
  } : _options$actionTransf;
  var _options$errorTransfo = options.errorTransformer;
  var errorTransformer = _options$errorTransfo === undefined ? function (error) {
    return error;
  } : _options$errorTransfo;
  var _options$colors = options.colors;
  var colors = _options$colors === undefined ? {
    title: function title() {
      return "#000000";
    },
    prevState: function prevState() {
      return "#9E9E9E";
    },
    action: function action() {
      return "#03A9F4";
    },
    nextState: function nextState() {
      return "#4CAF50";
    },
    error: function error() {
      return "#F20404";
    }
  } : _options$colors;

  // exit if console undefined

  if (typeof logger === "undefined") {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error("Option 'transformer' is deprecated, use stateTransformer instead");
  }

  var logBuffer = [];
  function printBuffer() {
    logBuffer.forEach(function (logEntry, key) {
      var started = logEntry.started;
      var startedTime = logEntry.startedTime;
      var action = logEntry.action;
      var prevState = logEntry.prevState;
      var error = logEntry.error;
      var took = logEntry.took;
      var nextState = logEntry.nextState;

      var nextEntry = logBuffer[key + 1];
      if (nextEntry) {
        nextState = nextEntry.prevState;
        took = nextEntry.started - started;
      }
      // message
      var formattedAction = actionTransformer(action);
      var isCollapsed = typeof collapsed === "function" ? collapsed(function () {
        return nextState;
      }, action) : collapsed;

      var formattedTime = formatTime(startedTime);
      var titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : null;
      var title = "action " + (timestamp ? formattedTime : "") + " " + formattedAction.type + " " + (duration ? "(in " + took.toFixed(2) + " ms)" : "");

      // render
      try {
        if (isCollapsed) {
          if (colors.title) logger.groupCollapsed("%c " + title, titleCSS);else logger.groupCollapsed(title);
        } else {
          if (colors.title) logger.group("%c " + title, titleCSS);else logger.group(title);
        }
      } catch (e) {
        logger.log(title);
      }

      var prevStateLevel = getLogLevel(level, formattedAction, [prevState], "prevState");
      var actionLevel = getLogLevel(level, formattedAction, [formattedAction], "action");
      var errorLevel = getLogLevel(level, formattedAction, [error, prevState], "error");
      var nextStateLevel = getLogLevel(level, formattedAction, [nextState], "nextState");

      if (prevStateLevel) {
        if (colors.prevState) logger[prevStateLevel]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState);else logger[prevStateLevel]("prev state", prevState);
      }

      if (actionLevel) {
        if (colors.action) logger[actionLevel]("%c action", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction);else logger[actionLevel]("action", formattedAction);
      }

      if (error && errorLevel) {
        if (colors.error) logger[errorLevel]("%c error", "color: " + colors.error(error, prevState) + "; font-weight: bold", error);else logger[errorLevel]("error", error);
      }

      if (nextStateLevel) {
        if (colors.nextState) logger[nextStateLevel]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState);else logger[nextStateLevel]("next state", nextState);
      }

      try {
        logger.groupEnd();
      } catch (e) {
        logger.log("—— log end ——");
      }
    });
    logBuffer.length = 0;
  }

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // exit early if predicate function returns false
        if (typeof predicate === "function" && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = timer.now();
        logEntry.startedTime = new Date();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = undefined;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        printBuffer();

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

module.exports = createLogger;
},{}],16:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports["default"] = applyMiddleware;

var _compose = _dereq_('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, initialState, enhancer) {
      var store = createStore(reducer, initialState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":19}],17:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
},{}],18:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = combineReducers;

var _createStore = _dereq_('./createStore');

var _isPlainObject = _dereq_('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = _dereq_('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2["default"])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key);
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if ("development" !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
      if (warningMessage) {
        (0, _warning2["default"])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
},{"./createStore":20,"./utils/warning":22,"lodash/isPlainObject":14}],19:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  } else {
    var _ret = function () {
      var last = funcs[funcs.length - 1];
      var rest = funcs.slice(0, -1);
      return {
        v: function v() {
          return rest.reduceRight(function (composed, f) {
            return f(composed);
          }, last.apply(undefined, arguments));
        }
      };
    }();

    if (typeof _ret === "object") return _ret.v;
  }
}
},{}],20:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports["default"] = createStore;

var _isPlainObject = _dereq_('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _symbolObservable = _dereq_('symbol-observable');

var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [initialState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, initialState, enhancer) {
  var _ref2;

  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
    enhancer = initialState;
    initialState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, initialState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = initialState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2["default"])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */

      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[_symbolObservable2["default"]] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[_symbolObservable2["default"]] = observable, _ref2;
}
},{"lodash/isPlainObject":14,"symbol-observable":23}],21:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = _dereq_('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = _dereq_('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = _dereq_('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = _dereq_('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = _dereq_('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = _dereq_('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if ("development" !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2["default"];
exports.combineReducers = _combineReducers2["default"];
exports.bindActionCreators = _bindActionCreators2["default"];
exports.applyMiddleware = _applyMiddleware2["default"];
exports.compose = _compose2["default"];
},{"./applyMiddleware":16,"./bindActionCreators":17,"./combineReducers":18,"./compose":19,"./createStore":20,"./utils/warning":22}],22:[function(_dereq_,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],23:[function(_dereq_,module,exports){
(function (global){
/* global window */
'use strict';

module.exports = _dereq_('./ponyfill')(global || window || this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ponyfill":24}],24:[function(_dereq_,module,exports){
'use strict';

module.exports = function symbolObservablePonyfill(root) {
	var result;
	var Symbol = root.Symbol;

	if (typeof Symbol === 'function') {
		if (Symbol.observable) {
			result = Symbol.observable;
		} else {
			result = Symbol('observable');
			Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};

},{}]},{},[4]);
