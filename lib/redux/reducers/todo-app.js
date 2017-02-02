import * as todoAppActions from '../actions/todo-app';

const { assign } = Object;
const initialState = {
	todos: JSON.parse(localStorage['diffhtml-todos'] || '[]'),

	getByStatus(type) {
		return this.todos.filter(todo => {
			switch (type) {
				case 'active': return !todo.completed;
				case 'completed': return todo.completed;
			}

			return true;
		})
	}
};

export default function todoApp(state = initialState, action) {
	switch (action.type) {
		case todoAppActions.ADD_TODO: {
			if (!action.title) { return state; }

			return assign({}, state, {
				todos: state.todos.concat({
					completed: false,
					editing: false,

					title: action.title.trim(),
					key: state.todos.length,
				})
			});
		}

		case todoAppActions.REMOVE_TODO: {
			state.todos.splice(action.index, 1);

			return assign({}, state, {
				todos: [].concat(state.todos)
			});
		}

		case todoAppActions.TOGGLE_COMPLETION: {
			const todo = state.todos[action.index];

			state.todos[action.index] = assign({}, todo, {
				completed: action.completed
			});

			return assign({}, state, {
				todos: [].concat(state.todos)
			});
		}

		case todoAppActions.START_EDITING: {
			const todo = state.todos[action.index];

			state.todos[action.index] = assign({}, todo, {
				editing: true
			});

			return assign({}, state, {
				todos: [].concat(state.todos)
			});
		}

		case todoAppActions.STOP_EDITING: {
			const todo = state.todos[action.index];

			state.todos[action.index] = assign({}, todo, {
				title: action.title,
				editing: false
			});

			return assign({}, state, {
				todos: [].concat(state.todos)
			});
		}

		case todoAppActions.CLEAR_COMPLETED: {
			return assign({}, state, {
				todos: state.todos.filter(todo => todo.completed === false)
			});
		}

		case todoAppActions.TOGGLE_ALL: {
			return assign({}, state, {
				todos: state.todos.map(todo => assign({}, todo, {
					completed: action.completed
				}))
			});
		}

		default: {
			return state;
		}
	}
}

