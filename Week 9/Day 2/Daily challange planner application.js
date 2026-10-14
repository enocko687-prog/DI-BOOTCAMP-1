import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, connect } from "react-redux";
import { createStore } from "redux";
import "./styles.css";

const h = React.createElement;
const STORAGE_KEY = "redux-daily-planner-tasks";

const SELECT_DATE = "planner/selectDate";
const ADD_TASK = "planner/addTask";
const EDIT_TASK = "planner/editTask";
const DELETE_TASK = "planner/deleteTask";
const SET_ERROR = "planner/setError";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function loadInitialState() {
  const selectedDate = getLocalDateKey();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      return { selectedDate, tasksByDate: {}, error: "" };
    }

    const tasksByDate = JSON.parse(stored);

    if (!tasksByDate || typeof tasksByDate !== "object" || Array.isArray(tasksByDate)) {
      throw new Error("Saved planner data has an invalid format.");
    }

    return { selectedDate, tasksByDate, error: "" };
  } catch (error) {
    return {
      selectedDate,
      tasksByDate: {},
      error: `Could not load saved tasks: ${error.message}`,
    };
  }
}

const initialState = loadInitialState();

const selectDate = (dateKey) => ({ type: SELECT_DATE, payload: dateKey });
const addTask = (dateKey, text) => ({
  type: ADD_TASK,
  payload: {
    dateKey,
    task: { id: crypto.randomUUID(), text: text.trim() },
  },
});
const editTask = (dateKey, taskId, text) => ({
  type: EDIT_TASK,
  payload: { dateKey, taskId, text: text.trim() },
});
const deleteTask = (dateKey, taskId) => ({
  type: DELETE_TASK,
  payload: { dateKey, taskId },
});
const setError = (message) => ({ type: SET_ERROR, payload: message });

function plannerReducer(state = initialState, action) {
  switch (action.type) {
    case SELECT_DATE:
      if (!isValidDateKey(action.payload)) {
        return { ...state, error: "Choose a valid calendar date." };
      }
      return { ...state, selectedDate: action.payload, error: "" };

    case ADD_TASK: {
      const { dateKey, task } = action.payload;

      if (!isValidDateKey(dateKey)) {
        return { ...state, error: "Choose a valid date before adding a task." };
      }
      if (!task.text) {
        return { ...state, error: "Task descriptions cannot be empty." };
      }

      return {
        ...state,
        error: "",
        tasksByDate: {
          ...state.tasksByDate,
          [dateKey]: [...(state.tasksByDate[dateKey] || []), task],
        },
      };
    }

    case EDIT_TASK: {
      const { dateKey, taskId, text } = action.payload;
      const tasks = state.tasksByDate[dateKey];

      if (!isValidDateKey(dateKey)) {
        return { ...state, error: "That task's date is invalid." };
      }
      if (!text) {
        return { ...state, error: "Task descriptions cannot be empty." };
      }
      if (!Array.isArray(tasks) || !tasks.some((task) => task.id === taskId)) {
        return { ...state, error: "That task could not be found for this date." };
      }

      return {
        ...state,
        error: "",
        tasksByDate: {
          ...state.tasksByDate,
          [dateKey]: tasks.map((task) =>
            task.id === taskId ? { ...task, text } : task,
          ),
        },
      };
    }

    case DELETE_TASK: {
      const { dateKey, taskId } = action.payload;
      const tasks = state.tasksByDate[dateKey];

      if (!isValidDateKey(dateKey)) {
        return { ...state, error: "That task's date is invalid." };
      }
      if (!Array.isArray(tasks) || !tasks.some((task) => task.id === taskId)) {
        return { ...state, error: "That task could not be found for this date." };
      }

      return {
        ...state,
        error: "",
        tasksByDate: {
          ...state.tasksByDate,
          [dateKey]: tasks.filter((task) => task.id !== taskId),
        },
      };
    }

    case SET_ERROR:
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

const store = createStore(plannerReducer);

function dispatchAndPersist(dispatch, action) {
  dispatch(action);
  const state = store.getState();

  if (state.error) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasksByDate));
  } catch (error) {
    dispatch(
      setError(`Could not save your tasks in this browser: ${error.message}`),
    );
  }
}

function getDateOffset(dateKey, offset) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(dateKey, options) {
  if (!isValidDateKey(dateKey)) {
    return dateKey;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, options).format(
    new Date(year, month - 1, day),
  );
}

function DatePicker({ selectedDate, onSelectDate }) {
  return h(
    "section",
    { className: "planner-date-panel", "aria-label": "Choose a day" },
    h("div", { className: "planner-date-nav" }, [
      h(
        "button",
        {
          className: "date-nav-button",
          type: "button",
          onClick: () => onSelectDate(getDateOffset(selectedDate, -1)),
          "aria-label": "Previous day",
          key: "previous",
        },
        "\u2190",
      ),
      h(
        "div",
        { className: "selected-date-label", key: "label" },
        [
          h(
            "span",
            { className: "date-weekday", key: "weekday" },
            formatDate(selectedDate, { weekday: "long" }),
          ),
          h(
            "span",
            { className: "date-full", key: "full" },
            formatDate(selectedDate, {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
          ),
        ],
      ),
      h(
        "button",
        {
          className: "date-nav-button",
          type: "button",
          onClick: () => onSelectDate(getDateOffset(selectedDate, 1)),
          "aria-label": "Next day",
          key: "next",
        },
        "\u2192",
      ),
    ]),
    h("div", { className: "date-picker-controls" }, [
      h(
        "label",
        { className: "date-input-label", htmlFor: "planner-date", key: "label" },
        "Jump to date",
      ),
      h("input", {
        id: "planner-date",
        className: "date-picker-input",
        type: "date",
        value: selectedDate,
        onChange: (event) => onSelectDate(event.target.value),
        key: "input",
      }),
      h(
        "button",
        {
          className: "today-button",
          type: "button",
          onClick: () => onSelectDate(getLocalDateKey()),
          key: "today",
        },
        "Today",
      ),
    ]),
  );
}

const ConnectedDatePicker = connect(
  (state) => ({ selectedDate: state.selectedDate }),
  (dispatch) => ({
    onSelectDate: (dateKey) => dispatch(selectDate(dateKey)),
  }),
)(DatePicker);

function TaskForm({ selectedDate, onAddTask, onSetError }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!text.trim()) {
      onSetError("Enter a task before adding it.");
      return;
    }

    onAddTask(selectedDate, text);
    if (!store.getState().error) {
      setText("");
    }
  }

  return h(
    "form",
    { className: "planner-task-form", onSubmit: handleSubmit },
    h("label", { className: "sr-only", htmlFor: "new-planner-task" }, "New task"),
    h("input", {
      id: "new-planner-task",
      type: "text",
      value: text,
      onChange: (event) => setText(event.target.value),
      placeholder: "Add a task for this day...",
      maxLength: 160,
      autoComplete: "off",
    }),
    h("button", { className: "add-button", type: "submit" }, "Add task"),
  );
}

function TaskItem({ task, onEditTask, onDeleteTask, onSetError }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(task.text);

  function cancelEdit() {
    setText(task.text);
    setIsEditing(false);
  }

  function saveEdit(event) {
    event.preventDefault();
    if (!text.trim()) {
      onSetError("Task descriptions cannot be empty.");
      return;
    }
    onEditTask(task.id, text);
    if (!store.getState().error) {
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return h(
      "li",
      { className: "planner-task-item editing-task" },
      h("form", { className: "edit-task-form", onSubmit: saveEdit }, [
        h("label", { className: "sr-only", htmlFor: `edit-${task.id}`, key: "label" }, "Edit task"),
        h("input", {
          id: `edit-${task.id}`,
          type: "text",
          value: text,
          maxLength: 160,
          onChange: (event) => setText(event.target.value),
          key: "input",
        }),
        h("button", { className: "task-action save-action", type: "submit", key: "save" }, "Save"),
        h(
          "button",
          { className: "task-action cancel-action", type: "button", onClick: cancelEdit, key: "cancel" },
          "Cancel",
        ),
      ]),
    );
  }

  return h(
    "li",
    { className: "planner-task-item" },
    h("span", { className: "planner-task-text" }, task.text),
    h("div", { className: "planner-task-actions" }, [
      h(
        "button",
        {
          className: "task-action edit-action",
          type: "button",
          onClick: () => {
            onSetError("");
            setIsEditing(true);
          },
          "aria-label": `Edit ${task.text}`,
          key: "edit",
        },
        "Edit",
      ),
      h(
        "button",
        {
          className: "task-action delete-action",
          type: "button",
          onClick: () => onDeleteTask(task.id),
          "aria-label": `Delete ${task.text}`,
          key: "delete",
        },
        "Delete",
      ),
    ]),
  );
}

function TaskList({
  selectedDate,
  tasks,
  error,
  addTask: add,
  editTask: edit,
  deleteTask: remove,
  setError: onSetError,
}) {
  const dayTasks = tasks[selectedDate] || [];

  return h(
    "section",
    { className: "planner-tasks-panel", "aria-labelledby": "daily-tasks-title" },
    h("div", { className: "planner-tasks-heading" }, [
      h("div", { key: "title" }, [
        h("p", { className: "eyebrow", key: "eyebrow" }, "Your schedule"),
        h("h2", { id: "daily-tasks-title", key: "heading" }, "Daily tasks"),
      ]),
      h(
        "span",
        { className: "planner-task-count", key: "count" },
        `${dayTasks.length} ${dayTasks.length === 1 ? "task" : "tasks"}`,
      ),
    ]),
    h(TaskForm, {
      selectedDate,
      onAddTask: (dateKey, text) => add(dateKey, text),
      onSetError,
    }),
    error ? h("p", { className: "error-message", role: "alert" }, error) : null,
    dayTasks.length === 0
      ? h(
          "p",
          { className: "planner-empty-state" },
          "Nothing planned yet. Add a task to get your day started.",
        )
      : h(
          "ul",
          { className: "planner-task-list" },
          dayTasks.map((task) =>
            h(TaskItem, {
              key: task.id,
              task,
              onEditTask: (taskId, text) => edit(selectedDate, taskId, text),
              onDeleteTask: (taskId) => remove(selectedDate, taskId),
              onSetError,
            }),
          ),
        ),
  );
}

const ConnectedTaskList = connect(
  (state) => ({
    selectedDate: state.selectedDate,
    tasks: state.tasksByDate,
    error: state.error,
  }),
  (dispatch) => ({
    addTask: (dateKey, text) =>
      dispatchAndPersist(dispatch, addTask(dateKey, text)),
    editTask: (dateKey, taskId, text) =>
      dispatchAndPersist(dispatch, editTask(dateKey, taskId, text)),
    deleteTask: (dateKey, taskId) =>
      dispatchAndPersist(dispatch, deleteTask(dateKey, taskId)),
    setError: (message) => dispatch(setError(message)),
  }),
)(TaskList);

function App() {
  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card planner-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "Plan one day at a time"),
      h("h1", { id: "page-title" }, "Daily planner"),
      h(
        "p",
        { className: "intro" },
        "Choose a date, capture your plans, and keep your day on track.",
      ),
      h(ConnectedDatePicker),
      h(ConnectedTaskList),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(App))),
);