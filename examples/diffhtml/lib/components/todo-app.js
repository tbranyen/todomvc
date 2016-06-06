import * as diff from 'diffhtml';
import inlineTransitions from 'diffhtml-inline-transitions';
import store from '../redux/store';
import * as todoAppActions from '../redux/actions/todo-app';
import renderTodoList from './todo-list';

const { html, innerHTML } = diff;

// Used to silence errors produced by missing Web Animations API support in the
// transition promises below.
const warnAboutWebAnim = () => console.info('No Web Animations API support');

// Allow diffHTML transitions to be bound inside the tagged helper.
inlineTransitions(diff);

export default class TodoApp {
	static create(mount) { return new TodoApp(mount); }

	constructor(mount) {
		this.mount = mount;
		this.existingFooter = this.mount.querySelector('footer').cloneNode(true);
		this.unsubscribeStore = store.subscribe(() => this.render());

		this.render();
	}

	animateAttached(parent, element) {
		if (!element.animate) { return; }

		if (element.matches('footer.info')) {
			new Promise(resolve => element.animate([
				{ opacity: 0, transform: 'scale(.5)' },
				{ opacity: 1, transform: 'scale(1)' }
			], { duration: 250 }).onfinish = resolve).then(() => {
				element.style.opacity = 1;
			});
		}

		// Animate Todo item being added.
		if (element.matches('.todo-list li, footer.info')) {
			new Promise(resolve => element.animate([
				{ opacity: 0, transform: 'scale(.5)' },
				{ opacity: 1, transform: 'scale(1)' }
			], { duration: 250 }).onfinish = resolve);
		}

		// Animate the entire app loading.
		if (element.matches('.todoapp')) {
			new Promise(resolve => element.animate([
				{ opacity: 0, transform: 'translateY(100%)', easing: 'ease-out' },
				{ opacity: 1, transform: 'translateY(0)' }
			], { duration: 375 }).onfinish = resolve);
		}
	}

	animateDetached(parent, element) {
		if (!element.animate) { return; }

		// We are removing an item from the list.
		if (element.matches('.todo-list li')) {
			return new Promise(resolve => element.animate([
				{ opacity: 1, transform: 'scale(1)' },
				{ opacity: 0, transform: 'scale(.5)' }
			], { duration: 250 }).onfinish = resolve);
		}
	}

	addTodo(ev) {
		if (!ev.target.matches('.add-todo')) { return; }

		ev.preventDefault();

		const newTodo = ev.target.querySelector('.new-todo');
		store.dispatch(todoAppActions.addTodo(newTodo.value));
		newTodo.value = '';
	}

	removeTodo(ev) {
		if (!ev.target.matches('.destroy')) { return; }

		const li = ev.target.parentNode.parentNode;
		const index = Array.from(li.parentNode.children).indexOf(li);

		store.dispatch(todoAppActions.removeTodo(index));
	}

	toggleCompletion(ev) {
		if (!ev.target.matches('.toggle')) { return; }

		const li = ev.target.parentNode.parentNode;
		const index = Array.from(li.parentNode.children).indexOf(li);

		store.dispatch(todoAppActions.toggleCompletion(index, ev.target.checked));
	}

	startEditing(ev) {
		if (!ev.target.matches('label')) { return; }

		const li = ev.target.parentNode.parentNode;
		const index = Array.from(li.parentNode.children).indexOf(li);

		store.dispatch(todoAppActions.startEditing(index));

		li.querySelector('form input').focus();
	}

	stopEditing(ev) {
		ev.preventDefault();

		const parentNode = ev.target.parentNode;
		const nodeName = parentNode.nodeName.toLowerCase();
		const li = nodeName === 'li' ? parentNode : parentNode.parentNode;
		const index = Array.from(li.parentNode.children).indexOf(li);
		const editTodo = li.querySelector('.edit');
		const text = editTodo.value.trim();

		if (text) {
			store.dispatch(todoAppActions.stopEditing(index, text));
		} else {
			store.dispatch(todoAppActions.removeTodo(index));
		}
	}

	clearCompleted(ev) {
		if (!ev.target.matches('.clear-completed')) { return; }

		store.dispatch(todoAppActions.clearCompleted());
	}

	toggleAll(ev) {
		if (!ev.target.matches('.toggle-all')) { return; }

		store.dispatch(todoAppActions.toggleAll(ev.target.checked));
	}

	handleKeyDown(ev) {
		if (!ev.target.matches('.edit')) { return; }

		const todoApp = store.getState()[this.mount.dataset.reducer];

		const li = ev.target.parentNode.parentNode;
		const index = Array.from(li.parentNode.children).indexOf(li);

		switch (ev.keyCode) {
			case 27: {
				ev.target.value = todoApp.todos[index].title;
				this.stopEditing(ev);
			}
		}
	}

	getTodoClassNames(todo) {
		return [
			todo.completed ? 'completed' : '',
			todo.editing ? 'editing' : ''
		].filter(Boolean).join(' ');
	}

	setCheckedState() {
		const todoApp = store.getState()[this.mount.dataset.reducer];
		const notChecked = todoApp.todos.filter(todo => !todo.completed).length;

		return notChecked ? '' : 'checked';
	}

	onSubmitHandler(ev) {
		ev.preventDefault();

		if (ev.target.matches('.add-todo')) {
			this.addTodo(ev);
		} else if (ev.target.matches('.edit-todo')) {
			this.stopEditing(ev);
		}
	}

	onClickHandler(ev) {
		if (ev.target.matches('.destroy')) {
			this.removeTodo(ev);
		} else if (ev.target.matches('.toggle-all')) {
			this.toggleAll(ev);
		} else if (ev.target.matches('.clear-completed')) {
			this.clearCompleted(ev);
		}
	}

	getNavClass(name) {
		const state = store.getState();
		const path = state.url.path;

		return path === name ? 'selected' : undefined;
	}

	render() {
		const state = store.getState();
		const todoApp = state[this.mount.dataset.reducer];
		const status = state.url.path.slice(1);
		const allTodos = todoApp.todos;
		const todos = todoApp.getByStatus(status);
		const activeTodos = todoApp.getByStatus('active');
		const completedTodos = todoApp.getByStatus('completed');

		localStorage['diffhtml-todos'] = JSON.stringify(allTodos);

		innerHTML(this.mount, html`
			<section class="todoapp"
				attached=${this.animateAttached}
				detached=${this.animateDetached}
				onsubmit=${this.onSubmitHandler.bind(this)}
				onclick=${this.onClickHandler.bind(this)}
				onkeydown=${this.handleKeyDown.bind(this)}
				ondblclick=${this.startEditing.bind(this)}
				onchange=${this.toggleCompletion.bind(this)}>

				<header class="header">
					<h1>todos</h1>

					<form class="add-todo">
						<input
							class="new-todo"
							placeholder="What needs to be done?"
							autofocus="">
					</form>
				</header>

				${allTodos.length ? html`
					<section class="main">
						<input class="toggle-all" type="checkbox" ${this.setCheckedState()}>

						<ul class="todo-list">${
							renderTodoList.call(this, {
								stopEditing: this.stopEditing.bind(this),
								todos
							})
						}</ul>
					</section>

					<footer class="footer">
						<span class="todo-count">
							<strong>${activeTodos.length}</strong>
							${activeTodos.length == 1 ? 'item' : 'items'} left
						</span>

						<ul class="filters">
							<li>
								<a href="#/" class=${this.getNavClass('/')}>
									All
								</a>
							</li>
							<li>
								<a href="#/active" class=${this.getNavClass('/active')}>
									Active
								</a>
							</li>
							<li>
								<a href="#/completed" class=${this.getNavClass('/completed')}>
									Completed
								</a>
							</li>
						</ul>

						${completedTodos.length ? html`
							<button class="clear-completed" onclick=${this.clearCompleted.bind(this)}>
								Clear completed
							</button>
						` : ''}
					</footer>
				` : ''}
			</section>

			${this.existingFooter}
		`);
	}
}
