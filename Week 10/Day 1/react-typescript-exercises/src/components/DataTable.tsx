import { useMemo, useState, type ReactNode } from "react";

export interface TableColumn<T extends { id: number | string }> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

export interface SortConfig<T extends { id: number | string }> {
  key: keyof T;
  direction: "ascending" | "descending";
}

interface DataTableProps<T extends { id: number | string }> {
  data: T[];
  columns: TableColumn<T>[];
  filterText?: string;
  filterBy?: (row: T, query: string) => boolean;
  onSort?: (sortConfig: SortConfig<T>) => void;
  onSelect?: (selectedItems: T[]) => void;
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function DataTable<T extends { id: number | string }>({
  data,
  columns,
  filterText = "",
  filterBy,
  onSort,
  onSelect,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<T["id"]>>(() => new Set());

  const visibleRows = useMemo(() => {
    const query = filterText.trim().toLocaleLowerCase();
    const filteredRows =
      query && filterBy ? data.filter((row) => filterBy(row, query)) : data;

    if (!sortConfig) {
      return filteredRows;
    }

    const direction = sortConfig.direction === "ascending" ? 1 : -1;
    return [...filteredRows].sort(
      (left, right) =>
        direction *
        compareValues(left[sortConfig.key], right[sortConfig.key]),
    );
  }, [data, filterBy, filterText, sortConfig]);

  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedIds.has(row.id));

  function updateSelection(nextIds: Set<T["id"]>) {
    setSelectedIds(nextIds);
    onSelect?.(data.filter((row) => nextIds.has(row.id)));
  }

  function toggleRow(id: T["id"]) {
    const nextIds = new Set(selectedIds);
    if (nextIds.has(id)) {
      nextIds.delete(id);
    } else {
      nextIds.add(id);
    }
    updateSelection(nextIds);
  }

  function toggleAllVisible() {
    const nextIds = new Set(selectedIds);
    if (allVisibleSelected) {
      visibleRows.forEach((row) => nextIds.delete(row.id));
    } else {
      visibleRows.forEach((row) => nextIds.add(row.id));
    }
    updateSelection(nextIds);
  }

  function handleSort(key: keyof T) {
    const nextSort: SortConfig<T> = {
      key,
      direction:
        sortConfig?.key === key && sortConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    };
    setSortConfig(nextSort);
    onSort?.(nextSort);
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th className="selection-column">
              <input
                aria-label="Select all visible rows"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                type="checkbox"
              />
            </th>
            {columns.map((column) => (
              <th key={String(column.key)} scope="col">
                {column.sortable ? (
                  <button
                    className="sort-button"
                    onClick={() => handleSort(column.key)}
                    type="button"
                  >
                    {column.title}
                    <span aria-hidden="true">
                      {sortConfig?.key === column.key
                        ? sortConfig.direction === "ascending"
                          ? " ↑"
                          : " ↓"
                        : " ↕"}
                    </span>
                  </button>
                ) : (
                  column.title
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr key={row.id}>
              <td className="selection-column">
                <input
                  aria-label={`Select row ${row.id}`}
                  checked={selectedIds.has(row.id)}
                  onChange={() => toggleRow(row.id)}
                  type="checkbox"
                />
              </td>
              {columns.map((column) => (
                <td key={String(column.key)}>
                  {column.render
                    ? column.render(row)
                    : String(row[column.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
          {visibleRows.length === 0 && (
            <tr>
              <td className="empty-table" colSpan={columns.length + 1}>
                No matching people.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
