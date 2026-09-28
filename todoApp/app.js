import { TodoList } from './todo.js';

const todoList = new TodoList();
todoList.addTask('Read JavaScript notes');
todoList.addTask('Practice Node.js exercises');
todoList.addTask('Review project checklist');
todoList.markTaskAsComplete('Read JavaScript notes');

console.log(todoList.listTasks());
