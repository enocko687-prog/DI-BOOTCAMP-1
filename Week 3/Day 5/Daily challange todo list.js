const tasks = [];

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const tasksContainer = document.querySelector(".listTasks");
let nextTaskId = 0;

function addTask(event) {
	event.preventDefault();

	const text = taskInput.value.trim();
	if (!text) {
		return;
	}

	const task = {
		task_id: nextTaskId,
		text,
		done: false
	};

	nextTaskId += 1;
	tasks.push(task);
	renderTask(task);
	taskForm.reset();
	taskInput.focus();
}

function renderTask(task) {
	const taskElement = document.createElement("div");
	taskElement.className = "task";
	taskElement.dataset.taskId = task.task_id;

	const checkbox = document.createElement("input");
	const checkboxId = `task-${task.task_id}`;
	checkbox.id = checkboxId;
	checkbox.type = "checkbox";
	checkbox.checked = task.done;
	checkbox.addEventListener("change", () => doneTask(task.task_id));

	const label = document.createElement("label");
	label.className = "task-label";
	label.htmlFor = checkboxId;
	label.textContent = task.text;

	const deleteButton = document.createElement("button");
	deleteButton.className = "delete-task";
	deleteButton.type = "button";
	deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
	deleteButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
	deleteButton.addEventListener("click", () => deleteTask(task.task_id));

	taskElement.append(deleteButton, checkbox, label);
	tasksContainer.appendChild(taskElement);
}

function doneTask(taskId) {
	const task = tasks.find((item) => item.task_id === taskId);
	const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

	if (!task || !taskElement) {
		return;
	}

	task.done = !task.done;
	taskElement.classList.toggle("task--done", task.done);
}

function deleteTask(taskId) {
	const taskIndex = tasks.findIndex((task) => task.task_id === taskId);
	if (taskIndex === -1) {
		return;
	}

	tasks.splice(taskIndex, 1);
	document.querySelector(`[data-task-id="${taskId}"]`).remove();
}

taskForm.addEventListener("submit", addTask);
