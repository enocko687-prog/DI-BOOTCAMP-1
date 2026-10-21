import { useState } from "react";
import DataTable, { type TableColumn } from "./DataTable";

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
}

const people: Person[] = [
  { id: 1, name: "Amina Yusuf", email: "amina@example.com", role: "Developer" },
  { id: 2, name: "Leo Martin", email: "leo@example.com", role: "Designer" },
  { id: 3, name: "Nia Patel", email: "nia@example.com", role: "Product lead" },
  { id: 4, name: "Omar Chen", email: "omar@example.com", role: "Developer" },
];

const columns: TableColumn<Person>[] = [
  { key: "name", title: "Name", sortable: true },
  { key: "email", title: "Email", sortable: true },
  { key: "role", title: "Role", sortable: true },
];

function PeopleTable() {
  const [filterText, setFilterText] = useState("");
  const [selectionCount, setSelectionCount] = useState(0);

  return (
    <div className="people-table-demo">
      <label className="filter-field">
        <span className="visually-hidden">Filter people</span>
        <input
          onChange={(event) => setFilterText(event.currentTarget.value)}
          placeholder="Filter by name, email, or role…"
          type="search"
          value={filterText}
        />
      </label>
      <DataTable
        columns={columns}
        data={people}
        filterBy={(person, query) =>
          `${person.name} ${person.email} ${person.role}`
            .toLocaleLowerCase()
            .includes(query)
        }
        filterText={filterText}
        onSelect={(selectedPeople) => setSelectionCount(selectedPeople.length)}
      />
      <p className="table-selection-status" aria-live="polite">
        {selectionCount} {selectionCount === 1 ? "person" : "people"} selected
      </p>
    </div>
  );
}

export default PeopleTable;
