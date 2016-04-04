import * as todoAppActions from '../actions/todo-app';

const initialState = {
  todos: JSON.parse(localStorage['diffhtml-todos'] || '[]'),

  getRemaining() {
    return this.todos.filter(todo => !todo.completed);
  },

  getCompleted() {
    return this.todos.filter(todo => todo.completed);
  },
};

export default function todoApp(state = initialState, action) {
  switch (action.type) {
    case todoAppActions.ADD_TODO: {
      if (!action.title) { return state; }

      return Object.assign({}, state, {
        todos: state.todos.concat({
          completed: false,
          editing: false,

          title: action.title.trim()
        })
      });
    }

    case todoAppActions.REMOVE_TODO: {
      state.todos.splice(action.index, 1);

      return Object.assign({}, state, {
        todos: [].concat(state.todos)
      });
    }

    case todoAppActions.TOGGLE_COMPLETION: {
      const todo = state.todos[action.index];

      state.todos[action.index] = Object.assign({}, todo, {
        completed: action.completed
      });

      return Object.assign({}, state, {
        todos: [].concat(state.todos)
      });
    }

    case todoAppActions.START_EDITING: {
      const todo = state.todos[action.index];

      state.todos[action.index] = Object.assign({}, todo, {
        editing: true
      });

      return Object.assign({}, state, {
        todos: [].concat(state.todos)
      });
    }

    case todoAppActions.STOP_EDITING: {
      const todo = state.todos[action.index];

      state.todos[action.index] = Object.assign({}, todo, {
        title: action.title,
        editing: false
      });

      return Object.assign({}, state, {
        todos: [].concat(state.todos)
      });
    }

    case todoAppActions.CLEAR_COMPLETED: {
      return Object.assign({}, state, {
        todos: state.todos.filter(todo => todo.completed === false)
      });
    }

    case todoAppActions.TOGGLE_ALL: {
      return Object.assign({}, state, {
        todos: state.todos.map(todo => Object.assign({}, todo, {
          completed: action.completed
        }))
      });
    }

    default: {
      return state;
    }
  }
}

