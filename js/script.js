// Todo List Application
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTodos();
        this.setDefaultDate();
    }

    bindEvents() {
        // Form submission
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Delete buttons (event delegation)
        document.getElementById('todo-list').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const todoId = parseInt(e.target.dataset.id);
                this.deleteTodo(todoId);
            }
            
            if (e.target.classList.contains('complete-btn')) {
                const todoId = parseInt(e.target.dataset.id);
                this.toggleComplete(todoId);
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date-input').value = today;
    }

    addTodo() {
        const todoInput = document.getElementById('todo-input');
        const dateInput = document.getElementById('date-input');
        
        const todoText = todoInput.value.trim();
        const todoDate = dateInput.value;

        if (todoText === '' || todoDate === '') {
            alert('Please fill in both task and date fields!');
            return;
        }

        const newTodo = {
            id: Date.now(),
            text: todoText,
            date: todoDate,
            completed: false
        };

        this.todos.push(newTodo);
        this.saveTodos();
        this.renderTodos();
        
        // Clear form
        todoInput.value = '';
        this.setDefaultDate();
        todoInput.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.renderTodos();
    }

    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTodos();
    }

    getFilteredTodos() {
        const today = new Date().toISOString().split('T')[0];
        
        switch (this.currentFilter) {
            case 'today':
                return this.todos.filter(todo => todo.date === today && !todo.completed);
            case 'upcoming':
                return this.todos.filter(todo => todo.date > today && !todo.completed);
            case 'overdue':
                return this.todos.filter(todo => todo.date < today && !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    getDateStatus(todoDate) {
        const today = new Date().toISOString().split('T')[0];
        
        if (todoDate < today) {
            return 'overdue';
        } else if (todoDate === today) {
            return 'today';
        } else {
            return 'upcoming';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        
        if (dateString === today) {
            return 'Today';
        } else if (dateString === tomorrowString) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = this.renderEmptyState();
            return;
        }

        // Sort todos by date
        filteredTodos.sort((a, b) => new Date(a.date) - new Date(b.date));

        todoList.innerHTML = filteredTodos.map(todo => {
            const dateStatus = this.getDateStatus(todo.date);
            const formattedDate = this.formatDate(todo.date);
            const completedClass = todo.completed ? 'completed' : '';
            const completeIcon = todo.completed ? '↺' : '✓';
            const completeTitle = todo.completed ? 'Mark as incomplete' : 'Mark as complete';
            
            return `
                <li class="todo-item ${dateStatus} ${completedClass}" data-id="${todo.id}">
                    <div class="todo-content">
                        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                        <div style="display: flex; align-items: center;">
                            <span class="todo-date ${dateStatus}">${formattedDate}</span>
                            <div class="todo-actions">
                                <button class="complete-btn ${completedClass}" data-id="${todo.id}" title="${completeTitle}">${completeIcon}</button>
                                <button class="delete-btn" data-id="${todo.id}">×</button>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        }).join('');
    }

    renderEmptyState() {
        const messages = {
            all: 'No tasks yet. Add your first task!',
            today: 'No tasks for today.',
            upcoming: 'No upcoming tasks.',
            overdue: 'No overdue tasks.',
            completed: 'No completed tasks yet.'
        };

        return `
            <div class="empty-state">
                <h3>📝</h3>
                <p>${messages[this.currentFilter]}</p>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});