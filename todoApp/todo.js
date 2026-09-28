export class TodoList {
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push({ task, completed: false });
  }

  markTaskAsComplete(taskName) {
    const task = this.tasks.find(item => item.task === taskName);
    if (task) {
      task.completed = true;
    }
  }

  listTasks() {
    return this.tasks.map(task => ({
      task: task.task,
      completed: task.completed
    }));
  }
}
