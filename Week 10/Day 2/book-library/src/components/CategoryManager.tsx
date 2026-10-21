import { useState, type FormEvent } from "react";
import { useAppSelector } from "../app/hooks";
import { useBooks } from "../hooks/useBooks";

export default function CategoryManager() {
  const { categories, books } = useAppSelector((state) => state.books);
  const { addCategory, renameCategory, deleteCategory } = useBooks();
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    if (categories.some((category) => category.toLowerCase() === name.toLowerCase())) {
      setError("That category already exists.");
      return;
    }
    addCategory(name);
    setNewCategory("");
    setError("");
  }

  function saveRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCategory) return;
    const name = editName.trim();
    if (!name) {
      setError("Category name cannot be empty.");
      return;
    }
    if (
      categories.some(
        (category) =>
          category !== editingCategory && category.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setError("That category already exists.");
      return;
    }
    renameCategory(editingCategory, name);
    setEditingCategory(null);
    setError("");
  }

  return (
    <section className="category-panel" aria-labelledby="categories-title">
      <div className="category-panel-heading">
        <div>
          <p className="eyebrow">ORGANIZE YOUR SHELVES</p>
          <h2 id="categories-title">Categories</h2>
        </div>
      </div>
      <form className="category-add-form" onSubmit={submitCategory}>
        <label className="visually-hidden" htmlFor="new-category">New category</label>
        <input
          id="new-category"
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder="Add a category"
          maxLength={40}
          required
        />
        <button className="button button-secondary" type="submit">Add</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      <ul className="category-list">
        {categories.map((category) => {
          const count = books.filter((book) => book.category === category).length;
          return (
            <li key={category}>
              {editingCategory === category ? (
                <form className="category-rename-form" onSubmit={saveRename}>
                  <input
                    aria-label={`Rename ${category}`}
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    autoFocus
                  />
                  <button type="submit" aria-label="Save category name">Save</button>
                  <button type="button" aria-label="Cancel rename" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span>{category}<small>{count}</small></span>
                  {category !== "General" && (
                    <div className="category-actions">
                      <button
                        type="button"
                        aria-label={`Rename ${category}`}
                        onClick={() => {
                          setEditingCategory(category);
                          setEditName(category);
                          setError("");
                        }}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${category}`}
                        onClick={() => {
                          deleteCategory(category);
                          setError("");
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
