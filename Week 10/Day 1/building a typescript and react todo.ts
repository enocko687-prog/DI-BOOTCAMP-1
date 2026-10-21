export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export type TodoState = {
  todos: Todo[];
};

export type TodoAction =
  | { type: "add"; todo: Todo }
  | { type: "toggle"; id: number }
  | { type: "delete"; id: number }
  | { type: "clearCompleted" };

export const initialTodoState: TodoState = {
  todos: [],
};

export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "add":
      return { todos: [...state.todos, action.todo] };
    case "toggle":
      return {
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo,
        ),
      };
    case "delete":
      return { todos: state.todos.filter((todo) => todo.id !== action.id) };
    case "clearCompleted":
      return { todos: state.todos.filter((todo) => !todo.completed) };
    default:
      return state;
  }
}