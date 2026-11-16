
import { useState, useReducer, useEffect } from "react";
import { todoReducer } from "./todoReducer";
import "./App.css";

// Load todos from localStorage safely
function init() {
  try {
    const savedTodos = localStorage.getItem("todos");

    return savedTodos ? JSON.parse(savedTodos) : [];
  } catch (error) {
    console.error("Unable to load todos:", error);
    return [];
  }
}

function App() {
  // Lazy initialization with useReducer
  const [todos, dispatch] = useReducer(
    todoReducer,
    [],
    init
  );

  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("All");

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Save todos whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (error) {
      console.error("Unable to save todos:", error);
    }
  }, [todos]);

  // Add a new todo
  function handleAddTodo(e) {
    e.preventDefault();

    const trimmedInput = input.trim();

    if (!trimmedInput) return;

    const newTodo = {
      id: crypto.randomUUID(),
      text: trimmedInput,
      done: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({
      type: "ADD",
      payload: newTodo,
    });

    setInput("");
  }

  // Start editing a todo
  function handleEditStart(todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  // Save edited todo
  function handleEditSave(id) {
    const trimmedText = editText.trim();

    if (!trimmedText) return;

    dispatch({
      type: "EDIT",
      payload: {
        id,
        text: trimmedText,
      },
    });

    setEditingId(null);
    setEditText("");
  }

  // Cancel editing
  function handleEditCancel() {
    setEditingId(null);
    setEditText("");
  }

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === "Active") return !todo.done;

    if (filter === "Completed") return todo.done;

    return true;
  });

  // Count active todos
  const itemsLeft = todos.filter(
    (todo) => !todo.done
  ).length;

  return (
    <div className="app">
      <main className="todo-container">
        <header className="header">
          <span className="eyebrow">YOUR DAILY PRODUCTIVITY</span>
          <h1>My Tasks<span>.</span></h1>
          <p>Make today productive, one task at a time.</p>
        </header>

        {/* Add Todo Form */}
        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
            aria-label="New todo"
          />

          <button type="submit" className="add-button">
            + Add Task
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {["All", "Active", "Completed"].map((tab) => (
            <button
              key={tab}
              className={filter === tab ? "active" : ""}
              onClick={() => setFilter(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <section className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>
                {todos.length === 0
                  ? "No tasks yet"
                  : "Nothing here"}
              </h3>
              <p>
                {todos.length === 0
                  ? "Add your first task to get started."
                  : "Try selecting another filter."}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <article className="todo-item" key={todo.id}>
                <input
                  className="todo-checkbox"
                  type="checkbox"
                  checked={todo.done}
                  onChange={() =>
                    dispatch({
                      type: "TOGGLE",
                      payload: todo.id,
                    })
                  }
                  aria-label={`Mark ${todo.text} as ${
                    todo.done ? "active" : "completed"
                  }`}
                />

                {editingId === todo.id ? (
                  <input
                    className="edit-input"
                    value={editText}
                    autoFocus
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEditSave(todo.id);
                      }

                      if (e.key === "Escape") {
                        handleEditCancel();
                      }
                    }}
                    aria-label="Edit todo"
                  />
                ) : (
                  <span
                    className={`todo-text ${
                      todo.done ? "completed" : ""
                    }`}
                    onDoubleClick={() => handleEditStart(todo)}
                    title="Double-click to edit"
                  >
                    {todo.text}
                  </span>
                )}

                {editingId === todo.id ? (
                  <div className="todo-actions">
                    <button
                      type="button"
                      onClick={() => handleEditSave(todo.id)}
                      aria-label="Save edit"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={handleEditCancel}
                      aria-label="Cancel edit"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="todo-actions">
                    <button
                      type="button"
                      onClick={() => handleEditStart(todo)}
                      aria-label="Edit todo"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        dispatch({
                          type: "DELETE",
                          payload: todo.id,
                        })
                      }
                      aria-label="Delete todo"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </section>

        {/* Footer */}
        <footer className="todo-footer">
          <span>
            <strong>{itemsLeft}</strong>{" "}
            {itemsLeft === 1 ? "item" : "items"} left
          </span>

          <button
            type="button"
            className="clear-button"
            onClick={() => dispatch({ type: "CLEAR_DONE" })}
            disabled={!todos.some((todo) => todo.done)}
          >
            Clear completed
          </button>
        </footer>
      </main>

      <p className="bottom-note">
        Your tasks are saved automatically in this browser.
      </p>
    </div>
  );
}

export default App;
