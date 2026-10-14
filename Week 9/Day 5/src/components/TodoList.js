import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTodo,
  removeTodo,
  setVisibilityFilter,
  toggleTodo,
} from "../features/todos/todosSlice.js";
import {
  selectFilteredTodosCount,
  selectTodos,
  selectVisibilityFilter,
} from "../features/todos/todoSelectors.js";
import "../../styles.css";

const h = React.createElement;
const filters = ["All", "Active", "Completed"];

export default function TodoList() {
  const dispatch = useDispatch();
  const todos = useSelector(selectTodos);
  const visibilityFilter = useSelector(selectVisibilityFilter);
  const filteredCount = useSelector(selectFilteredTodosCount);
  const [title, setTitle] = useState("");

  const handleToggle = useCallback(
    (id) => dispatch(toggleTodo(id)),
    [dispatch],
  );
  const handleRemove = useCallback(
    (id) => dispatch(removeTodo(id)),
    [dispatch],
  );
  const handleFilterChange = useCallback(
    (filter) => dispatch(setVisibilityFilter(filter)),
    [dispatch],
  );

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    dispatch(addTodo(trimmedTitle));
    setTitle("");
  }

  return h(
    "main",
    { className: "page-shell" },
    h("section", { className: "inventory todo-page", "aria-labelledby": "page-title" }, [
      h("header", { className: "page-header", key: "header" }, [
        h("p", { className: "eyebrow", key: "eyebrow" }, "A LITTLE MORE FOCUS"),
        h("h1", { id: "page-title", key: "title" }, "My todo list."),
        h(
          "p",
          { className: "intro", key: "intro" },
          "Write it down, check it off, and keep moving.",
        ),
      ]),
      h("form", { className: "todo-form", onSubmit: handleSubmit, key: "form" }, [
        h("label", { className: "sr-only", htmlFor: "new-todo", key: "label" }, "New task"),
        h("input", {
          id: "new-todo",
          type: "text",
          value: title,
          onChange: (event) => setTitle(event.target.value),
          placeholder: "What needs to get done?",
          autoComplete: "off",
          key: "input",
        }),
        h("button", { className: "add-button", type: "submit", key: "submit" }, "Add task"),
      ]),
      h(
        "div",
        { className: "todo-filters", role: "group", "aria-label": "Filter todos", key: "filters" },
        filters.map((filter) =>
          h(
            "button",
            {
              className: `genre-button${visibilityFilter === filter ? " is-selected" : ""}`,
              type: "button",
              "aria-pressed": visibilityFilter === filter,
              onClick: () => handleFilterChange(filter),
              key: filter,
            },
            filter,
          ),
        ),
      ),
      h("div", { className: "list-heading", key: "list-heading" }, [
        h("h2", { key: "title" }, `${visibilityFilter} tasks`),
        h(
          "span",
          { className: "book-count", "aria-live": "polite", key: "count" },
          `${filteredCount} ${filteredCount === 1 ? "task" : "tasks"}`,
        ),
      ]),
      todos.length
        ? h(
            "ul",
            { className: "todo-list", key: "todos" },
            todos.map((todo) =>
              h("li", { className: `todo-item${todo.completed ? " is-complete" : ""}`, key: todo.id }, [
                h("label", { className: "todo-label", key: "label" }, [
                  h("input", {
                    type: "checkbox",
                    checked: todo.completed,
                    onChange: () => handleToggle(todo.id),
                    "aria-label": `Mark "${todo.title}" ${todo.completed ? "active" : "completed"}`,
                    key: "checkbox",
                  }),
                  h("span", { key: "title" }, todo.title),
                ]),
                h(
                  "button",
                  {
                    className: "remove-button",
                    type: "button",
                    onClick: () => handleRemove(todo.id),
                    "aria-label": `Delete "${todo.title}"`,
                    key: "delete",
                  },
                  "Delete",
                ),
              ]),
            ),
          )
        : h(
            "p",
            { className: "empty-state", key: "empty" },
            `No ${visibilityFilter.toLowerCase()} tasks.`,
          ),
      h(
        "p",
        { className: "selector-note", key: "note" },
        "Visible todos and their count are derived with Redux Toolkit's createSelector.",
      ),
    ]),
  );
}
