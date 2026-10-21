import useDataFetching from "../hooks/useDataFetching";

interface User {
  id: number;
  name: string;
  email: string;
  address: {
    city: string;
  };
}

function parseUsers(value: unknown): User[] {
  if (!Array.isArray(value)) {
    throw new Error("The server returned user data in an unexpected format.");
  }

  const users = value.filter((item): item is User => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const user = item as Record<string, unknown>;
    const address = user.address;

    return (
      typeof user.id === "number" &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      typeof address === "object" &&
      address !== null &&
      "city" in address &&
      typeof address.city === "string"
    );
  });

  if (users.length !== value.length) {
    throw new Error("The server returned one or more invalid user records.");
  }

  return users;
}

function UserList() {
  const { state, refetch, loadFromCache, invalidateCache } = useDataFetching<User[]>(
    "https://jsonplaceholder.typicode.com/users",
    { maxAge: 5 * 60 * 1000, parse: parseUsers },
  );

  function clearCacheAndRefresh() {
    invalidateCache();
    refetch();
  }

  return (
    <div className="cached-users">
      <div className="cache-controls">
        <button
          className="action-button secondary-button"
          onClick={loadFromCache}
          type="button"
        >
          Load from cache
        </button>
        <button
          className="action-button secondary-button"
          onClick={refetch}
          type="button"
        >
          Refresh
        </button>
        <button
          className="action-button primary-button"
          onClick={clearCacheAndRefresh}
          type="button"
        >
          Clear cache &amp; refresh
        </button>
      </div>

      {state.status === "loading" && (
        <p className="status-message" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          Loading users…
        </p>
      )}

      {state.status === "error" && (
        <div className="cache-error">
          <p className="error-message" role="alert">
            Could not load users: {state.message}
          </p>
          <button
            className="action-button secondary-button"
            onClick={refetch}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === "success" && (
        <>
          <p className="cache-meta">
            {state.fromCache ? "Loaded from cache" : "Fresh from the API"} ·{" "}
            {new Date(state.fetchedAt).toLocaleTimeString()}
          </p>
          <ul className="user-list">
            {state.data.map((user) => (
              <li className="api-user" key={user.id}>
                <span className="api-user-avatar" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="api-user-details">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <span>{user.address.city}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default UserList;
