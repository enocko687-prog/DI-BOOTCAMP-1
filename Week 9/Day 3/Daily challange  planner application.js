import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import "./styles.css";

const h = React.createElement;
const STORAGE_KEY = "redux-toolkit-daily-planner";
const EMPTY_TASKS = [];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function createInitialState() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    const tasksByDate = savedTasks ? JSON.parse(savedTasks) : {};

    if (!tasksByDate || typeof tasksByDate !== "object" || Array.isArray(tasksByDate)) {
      throw new Error("Saved planner data has an invalid format.");
    }

    return {
      selectedDate: localDateKey(),
      tasksByDate,
      error: "",
    };
  } catch (error) {
    return {
      selectedDate: localDateKey(),
      tasksByDate: {},
      error: `Could not load saved tasks: ${error.message}`,
    };
  }
}

const plannerSlice = createSlice({
  name: "planner",
  initialState: createInitialState(),
  reducers: {
    selectDate(state, action) {
      if (!isValidDateKey(action.payload)) {
        state.error = "Choose a valid calendar date.";
        return;
      }
      state.selectedDate = action.payload;
      state.error = "";
    },
    addTask: {
      reducer(state, action) {
        const { date, task } = action.payload;
        if (!isValidDateKey(date)) {
          state.error = "Choose a valid date before adding a task.";
          return;
        }
        if (!task.text.trim()) {
          state.error = "Task descriptions cannot be empty.";
          return;
        }
        if (!state.tasksByDate[date]) {
          state.tasksByDate[date] = [];
        }
        state.tasksByDate[date].push(task);
        state.error = "";
      },
      prepare(date, text) {
        return {
          payload: {
            date,
            task: {
              id: crypto.randomUUID(),
              text: text.trim(),
            },
          },
        };
      },
    },
    editTask(state, action) {
      const { date, taskId, text } = action.payload;
      if (!isValidDateKey(date)) {
        state.error = "That task's date is invalid.";
        return;
      }
      if (!text.trim()) {
        state.error = "Task descriptions cannot be empty.";
        return;
      }
      const task = state.tasksByDate[date]?.find((item) => item.id === taskId);
      if (!task) {
        state.error = "That task could not be found for the selected date.";
        return;
      }
      task.text = text.trim();
      state.error = "";
    },
    deleteTask(state, action) {
      const { date, taskId } = action.payload;
      if (!isValidDateKey(date)) {
        state.error = "That task's date is invalid.";
        return;
      }
      const tasks = state.tasksByDate[date];
      if (!Array.isArray(tasks) || !tasks.some((task) => task.id === taskId)) {
        state.error = "That task could not be found for the selected date.";
        return;
      }
      state.tasksByDate[date] = tasks.filter((task) => task.id !== taskId);
      state.error = "";
    },
    clearError(state) {
      state.error = "";
    },
    reportError(state, action) {
      state.error = action.payload;
    },
  },
});

const {
  selectDate,
  addTask,
  editTask,
  deleteTask,
  clearError,
  reportError,
} = plannerSlice.actions;

const store = configureStore({
  reducer: {
    planner: plannerSlice.reducer,
  },
});

function dispatchAndPersist(dispatch, action) {
  dispatch(action);
  const { error, tasksByDate } = store.getState().planner;

  if (error) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksByDate));
  } catch (storageError) {
    dispatch(
      reportError(`Could not save your tasks in this browser: ${storageError.message}`),
    );
  }
}

function addDays(dateKey, amount) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(dateKey, options) {
  if (!isValidDateKey(dateKey)) return dateKey;
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, options).format(
    new Date(year, month - 1, day),
  );
}

function Calendar() {
  const dispatch = useDispatch();
  const selectedDate = useSelector((state) => state.planner.selectedDate);

  function changeDate(date) {
    dispatch(selectDate(date));
  }

  return h(
    "section",
    { className: "planner-date-panel", "aria-label": "Choose a day" },
    h("div", { className: "planner-date-nav" }, [
      h(
        "button",
        {
          className: "date-nav-button",
          type: "button",
          onClick: () => changeDate(addDays(selectedDate, -1)),
          "aria-label": "Previous day",
          key: "previous",
        },
        "\u2190",
      ),
      h("div", { className: "selected-date-label", key: "label" }, [
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
      ]),
      h(
        "button",
        {
          className: "date-nav-button",
          type: "button",
          onClick: () => changeDate(addDays(selectedDate, 1)),
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
        onChange: (event) => changeDate(event.target.value),
        key: "input",
      }),
      h(
        "button",
        {
          className: "today-button",
          type: "button",
          onClick: () => changeDate(localDateKey()),
          key: "today",
        },
        "Today",
      ),
    ]),
  );
}

function AddTask() {
  const dispatch = useDispatch();
  const selectedDate = useSelector((state) => state.planner.selectedDate);
  const error = useSelector((state) => state.planner.error);
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) {
      dispatch(reportError("Enter a task before adding it."));
      return;
    }

    dispatchAndPersist(dispatch, addTask(selectedDate, text));
    if (!store.getState().planner.error) setText("");
  }

  return h(
    "form",
    { className: "planner-task-form", onSubmit: handleSubmit },
    h("label", { className: "sr-only", htmlFor: "new-planner-task" }, "New task"),
    h("input", {
      id: "new-planner-task",
      type: "text",
      value: text,
      onChange: (event) => {
        setText(event.target.value);
        if (error) dispatch(clearError());
      },
      placeholder: "Add a task for this day...",
      maxLength: 160,
      autoComplete: "off",
    }),
    h("button", { className: "add-button", type: "submit" }, "Add task"),
  );
}

function EditTask({ task }) {
  const dispatch = useDispatch();
  const selectedDate = useSelector((state) => state.planner.selectedDate);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);

  function cancel() {
    setText(task.text);
    setEditing(false);
    dispatch(clearError());
  }

  function save(event) {
    event.preventDefault();
    if (!text.trim()) {
      dispatch(reportError("Task descriptions cannot be empty."));
      return;
    }
    dispatchAndPersist(
      dispatch,
      editTask({ date: selectedDate, taskId: task.id, text }),
    );
    if (!store.getState().planner.error) setEditing(false);
  }

  if (editing) {
    return h(
      "li",
      { className: "planner-task-item editing-task" },
      h("form", { className: "edit-task-form", onSubmit: save }, [
        h(
          "label",
          { className: "sr-only", htmlFor: `edit-${task.id}`, key: "label" },
          "Edit task",
        ),
        h("input", {
          id: `edit-${task.id}`,
          type: "text",
          value: text,
          maxLength: 160,
          onChange: (event) => setText(event.target.value),
          key: "input",
        }),
        h(
          "button",
          { className: "task-action save-action", type: "submit", key: "save" },
          "Save",
        ),
        h(
          "button",
          {
            className: "task-action cancel-action",
            type: "button",
            onClick: cancel,
            key: "cancel",
          },
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
            dispatch(clearError());
            setEditing(true);
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
          onClick: () =>
            dispatchAndPersist(
              dispatch,
              deleteTask({ date: selectedDate, taskId: task.id }),
            ),
          "aria-label": `Delete ${task.text}`,
          key: "delete",
        },
        "Delete",
      ),
    ]),
  );
}

function TaskList() {
  const dispatch = useDispatch();
  const selectedDate = useSelector((state) => state.planner.selectedDate);
  const tasks = useSelector(
    (state) => state.planner.tasksByDate[selectedDate] || EMPTY_TASKS,
  );
  const error = useSelector((state) => state.planner.error);

  return h(
    "section",
    { className: "planner-tasks-panel", "aria-labelledby": "daily-tasks-title" },
    h("div", { className: "planner-tasks-heading" }, [
      h("div", { key: "heading" }, [
        h("p", { className: "eyebrow", key: "eyebrow" }, "Your schedule"),
        h("h2", { id: "daily-tasks-title", key: "title" }, "Daily tasks"),
      ]),
      h(
        "span",
        { className: "planner-task-count", key: "count" },
        `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`,
      ),
    ]),
    h(AddTask),
    error ? h("p", { className: "error-message planner-error", role: "alert" }, error) : null,
    tasks.length === 0
      ? h(
          "p",
          { className: "planner-empty-state" },
          "Nothing planned yet. Add a task to get your day started.",
        )
      : h(
          "ul",
          { className: "planner-task-list" },
          tasks.map((task) => h(EditTask, { key: task.id, task })),
        ),
  );
}

function App() {
  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card planner-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "React + Redux Toolkit"),
      h("h1", { id: "page-title" }, "Daily planner"),
      h(
        "p",
        { className: "intro" },
        "Choose a date, capture your plans, and keep your day on track.",
      ),
      h(Calendar),
      h(TaskList),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(App))),
);