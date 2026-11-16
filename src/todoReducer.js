export function todoReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];

    case "TOGGLE":
      return state.map((todo) =>
        todo.id === action.payload
          ? { ...todo, done: !todo.done }
          : todo
      );

    case "DELETE":
      return state.filter(
        (todo) => todo.id !== action.payload
      );

    case "EDIT":
      return state.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, text: action.payload.text }
          : todo
      );

    case "CLEAR_DONE":
      return state.filter((todo) => !todo.done);

    default:
      return state;
  }
}