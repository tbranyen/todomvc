import store from '../redux/store';
import * as todoAppActions from '../redux/actions/todo-app';

export default class TodoApp extends HTMLElement {
  createdCallback() {
    this.animateAttached = this.animateAttached.bind(this);
    this.animateDetached = this.animateDetached.bind(this);

    // Necessary to track which elements were removed.
    this._removedIndexes = [];

    document.addTransitionState('attached', this.animateAttached);
    document.addTransitionState('detached', this.animateDetached);

    this.render();
    this.unsubscribeStore = store.subscribe(() => this.render());

    this.addEventListener('submit', this.addTodo, false);
    this.addEventListener('click', this.removeTodo, false);
    this.addEventListener('change', this.toggleCompletion, false);
    this.addEventListener('dblclick', this.startEditing, false);
    this.addEventListener('submit', this.stopEditing, false);
    this.addEventListener('click', this.clearCompleted, false);
    this.addEventListener('click', this.toggleAll, false);
  }

  detachedCallback() {
    document.removeTransitionState('attached', this.animateAttached);
    document.removeTransitionState('detached', this.animateDetached);

    this.unsubscribeStore();

    this.removeEventListener(this.addTodo);
    this.removeEventListener(this.removeTodo);
    this.removeEventListener(this.toggleCompletion);
    this.removeEventListener(this.startEditing);
    this.removeEventListener(this.stopEditing);
    this.removeEventListener(this.clearCompleted);
    this.removeEventListener(this.toggleAll);
  }

  animateAttached(element) {
    // Animate Todo item being added.
    if (element.matches('.todo-list li')) {
      return new Promise(resolve => element.animate([
        { opacity: 0, transform: 'scale(.5)' },
        { opacity: 1, transform: 'scale(1)' },
      ], { duration: 250 }).onfinish = resolve);
    }

    // Animate the entire app loading.
    if (element.matches('.todoapp')) {
      return new Promise(resolve => element.animate([
        { opacity: 0, transform: 'translateY(100%)', easing: 'ease-out' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 375 }).onfinish = resolve);
    }
  }

  animateDetached(el) {
    // We are removing an item from the list.
    if (el.matches('.todo-list li')) {
      let rows = this.querySelectorAll('.todo-list li');
      let actualElement = rows[this._removedIndexes.shift()];

      return new Promise(resolve => actualElement.animate([
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(.5)' },
      ], { duration: 250 }).onfinish = resolve);
    }
  }

  addTodo(ev) {
    if (!ev.target.matches('.add-todo')) { return; }

    ev.preventDefault();

    var newTodo = ev.target.querySelector('.new-todo');
    store.dispatch(todoAppActions.addTodo(newTodo.value));
    newTodo.value = '';
  }

  removeTodo(ev) {
    if (!ev.target.matches('.destroy')) { return; }

    var li = ev.target.parentNode.parentNode;
    var index = Array.from(li.parentNode.children).indexOf(li);

    this._removedIndexes.push(index);

    store.dispatch(todoAppActions.removeTodo(index));
  }

  toggleCompletion(ev) {
    if (!ev.target.matches('.toggle')) { return; }

    var li = ev.target.parentNode.parentNode;
    var index = Array.from(li.parentNode.children).indexOf(li);

    store.dispatch(todoAppActions.toggleCompletion(index, ev.target.checked));
  }

  startEditing(ev) {
    if (!ev.target.matches('label')) { return; }

    var li = ev.target.parentNode.parentNode;
    var index = Array.from(li.parentNode.children).indexOf(li);

    store.dispatch(todoAppActions.startEditing(index));
  }

  stopEditing(ev) {
    if (!ev.target.matches('.edit-todo')) { return; }

    ev.preventDefault();

    var li = ev.target.parentNode;
    var index = Array.from(li.parentNode.children).indexOf(li);
    var editTodo = ev.target.querySelector('.edit');

    store.dispatch(todoAppActions.stopEditing(index, editTodo.value));
  }

  clearCompleted(ev) {
    if (!ev.target.matches('.clear-completed')) { return; }

    const todoApp = store.getState()[this.dataset.reducer];

    todoApp.todos.forEach((todo, i) => {
      if (todo.completed === true) {
        this._removedIndexes.push(i);
      }
    });

    store.dispatch(todoAppActions.clearCompleted());
  }

  toggleAll(ev) {
    if (!ev.target.matches('.toggle-all')) { return; }

    store.dispatch(todoAppActions.toggleAll(ev.target.checked));
  }

  getTodoClassNames(todo) {
    return [
      todo.completed ? 'completed' : '',
      todo.editing ? 'editing' : ''
    ].filter(Boolean).join(' ');
  }

  render() {
    const todoApp = store.getState()[this.dataset.reducer];

    localStorage['diffhtml-todos'] = JSON.stringify(todoApp.todos);

    this.diffInnerHTML = `
      <section class="todoapp">
        <header class="header">
          <h1>todos</h1>

          <form class="add-todo">
            <input
              class="new-todo"
              placeholder="What needs to be done?"
              autofocus="">
          </form>
        </header>

        ${todoApp.todos.length ? `
          <section class="main">
            <input class="toggle-all" type="checkbox">

            <ul class="todo-list">
              ${todoApp.todos.map(todo => `
                <li class="${this.getTodoClassNames(todo)}">
                  <div class="view">
                    <input class="toggle" type="checkbox"
                      ${todo.completed ? 'checked' : ''}>

                    <label>${todo.title}</label>
                    <button class="destroy"></button>
                  </div>

                  <form class="edit-todo">
                    <input value="${todo.title}" class="edit">
                  </form>
                </li>
              `).join('\n')}
            </ul>
          </section>

          <footer class="footer">
            <span class="todo-count">
              <strong>${todoApp.getRemaining().length}</strong>
              ${todoApp.getRemaining().length == 1 ? 'item' : 'items'} left
            </span>

            <button class="clear-completed">Clear completed</button>
          </footer>
        ` : ''}
      </section>
    `;
  }
}
