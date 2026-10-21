import {
  addBook as addBookAction,
  removeBook as removeBookAction,
  toggleReadStatus as toggleReadStatusAction,
  setFilter as setFilterAction,
  setSelectedCategory as setCategoryAction,
  addCategory as addCategoryAction,
  renameCategory as renameCategoryAction,
  deleteCategory as deleteCategoryAction,
  setProgress as setProgressAction,
  setSort as setSortAction,
  type BookSort,
} from "../app/booksSlice";
import { useAppDispatch } from "../app/hooks";
import { BookItem, type NewBook } from "../model/Book";

export function useBooks() {
  const dispatch = useAppDispatch();

  return {
    addBook(details: NewBook): void {
      if (!details.title.trim() || !details.author.trim() || !details.category.trim()) {
        throw new Error("Title, author, and category are required.");
      }
      dispatch(addBookAction(BookItem.create(details).serialize()));
    },
    removeBook(id: string): void {
      if (!id) throw new Error("A book ID is required.");
      dispatch(removeBookAction(id));
    },
    toggleReadStatus(id: string): void {
      if (!id) throw new Error("A book ID is required.");
      dispatch(toggleReadStatusAction(id));
    },
    setProgress(id: string, progress: number): void {
      if (!id || !Number.isFinite(progress)) throw new Error("Book ID and valid progress are required.");
      dispatch(setProgressAction({ id, progress }));
    },
    setFilter: (filter: Parameters<typeof setFilterAction>[0]) =>
      dispatch(setFilterAction(filter)),
    setCategory: (category: string) => dispatch(setCategoryAction(category)),
    setSort: (sort: BookSort) => dispatch(setSortAction(sort)),
    addCategory: (category: string) => dispatch(addCategoryAction(category)),
    renameCategory: (oldName: string, newName: string) =>
      dispatch(renameCategoryAction({ oldName, newName })),
    deleteCategory: (category: string) => dispatch(deleteCategoryAction(category)),
  };
}
