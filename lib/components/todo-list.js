import { html, innerHTML } from 'diffhtml';

export default function renderTodoList(props) {
	return props.todos.map(todo => html`
		<li key="${todo.key}" class="${this.getTodoClassNames(todo)}">
			<div class="view">
				<input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
				<label>${todo.title}</label>
				<button class="destroy"></button>
			</div>

			<form class="edit-todo">
				<input
					onblur=${props.stopEditing}
					value="${todo.title}"
					class="edit">
			</form>
		</li>
	`);
}
