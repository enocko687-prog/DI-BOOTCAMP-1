import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import type { Dispatch, FormEvent, ReactNode } from "react";
import BookApp from "./BookApp";
import TodoApp from "./TodoApp";

type Profile = {
  name: string;
  bio: string;
};

type ProfileState = {
  status: "initial" | "loading" | "success" | "error";
  profile: Profile | null;
  error: string | null;
};

type ProfileAction =
  | { type: "loading" }
  | { type: "success"; profile: Profile }
  | { type: "error"; message: string };

const initialProfileState: ProfileState = {
  status: "initial",
  profile: null,
  error: null,
};

function profileReducer(
  state: ProfileState,
  action: ProfileAction,
): ProfileState {
  switch (action.type) {
    case "loading":
      return { ...state, status: "loading", error: null };
    case "success":
      return { status: "success", profile: action.profile, error: null };
    case "error":
      return { ...state, status: "error", error: action.message };
    default:
      return state;
  }
}

function ProfileExercise() {
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);
  const [name, setName] = useState("Enock");
  const [bio, setBio] = useState("Learning React and TypeScript.");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "loading" });
    window.setTimeout(() => {
      dispatch({ type: "success", profile: { name: name.trim(), bio: bio.trim() } });
    }, 600);
  }

  function simulateError() {
    dispatch({ type: "loading" });
    window.setTimeout(() => {
      dispatch({ type: "error", message: "The profile could not be updated. Try again." });
    }, 600);
  }

  return (
    <section className="xp-card" aria-labelledby="profile-title">
      <ExerciseHeading
        number="01"
        label="USE REDUCER"
        title="Update your profile"
        id="profile-title"
      />
      <form className="xp-form" onSubmit={handleSubmit}>
        <label className="xp-field">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="xp-field">
          Bio
          <textarea
            rows={3}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            required
          />
        </label>
        <div className="xp-actions">
          <button className="xp-button" type="submit" disabled={state.status === "loading"}>
            {state.status === "loading" ? "Saving..." : "Save profile"}
          </button>
          <button
            className="xp-button xp-button-secondary"
            type="button"
            onClick={simulateError}
            disabled={state.status === "loading"}
          >
            Simulate error
          </button>
        </div>
      </form>
      <p className="xp-status" aria-live="polite">
        Status: <strong>{state.status}</strong>
      </p>
      {state.profile && (
        <div className="xp-result">
          <strong>{state.profile.name}</strong>
          <p>{state.profile.bio}</p>
        </div>
      )}
      {state.error && <p className="xp-error" role="alert">{state.error}</p>}
    </section>
  );
}

type SurveyState = {
  status: "initial" | "submitting" | "completed";
  feedback: string;
  started: boolean;
};

type SurveyAction =
  | { type: "start" }
  | { type: "change"; feedback: string }
  | { type: "submit" }
  | { type: "complete" }
  | { type: "reset" };

const initialSurveyState: SurveyState = {
  status: "initial",
  feedback: "",
  started: false,
};

function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case "start":
      return { ...state, started: true };
    case "change":
      return { ...state, feedback: action.feedback };
    case "submit":
      return { ...state, status: "submitting" };
    case "complete":
      return { ...state, status: "completed" };
    case "reset":
      return initialSurveyState;
    default:
      return state;
  }
}

function SurveyExercise() {
  const [state, dispatch] = useReducer(surveyReducer, initialSurveyState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "submit" });
    window.setTimeout(() => dispatch({ type: "complete" }), 600);
  }

  return (
    <section className="xp-card" aria-labelledby="survey-title">
      <ExerciseHeading
        number="02"
        label="USE REDUCER"
        title="Survey feedback"
        id="survey-title"
      />
      {!state.started ? (
        <button className="xp-button" type="button" onClick={() => dispatch({ type: "start" })}>
          Start survey
        </button>
      ) : state.status === "completed" ? (
        <div className="xp-result" aria-live="polite">
          <strong>Thanks for your feedback!</strong>
          <p>{state.feedback}</p>
        </div>
      ) : (
        <form className="xp-form" onSubmit={handleSubmit}>
          <label className="xp-field">
            What could we do better?
            <textarea
              rows={4}
              value={state.feedback}
              onChange={(event) => dispatch({ type: "change", feedback: event.target.value })}
              required
              disabled={state.status === "submitting"}
            />
          </label>
          <div className="xp-actions">
            <button className="xp-button" type="submit" disabled={state.status === "submitting"}>
              {state.status === "submitting" ? "Submitting..." : "Submit feedback"}
            </button>
            <button
              className="xp-button xp-button-secondary"
              type="button"
              onClick={() => dispatch({ type: "reset" })}
            >
              Reset
            </button>
          </div>
        </form>
      )}
      <p className="xp-status" aria-live="polite">
        Status: <strong>{state.status}</strong>
      </p>
    </section>
  );
}

type ContactFormState = {
  name: string;
  email: string;
  message: string;
  submitted: boolean;
};

type ContactFormAction =
  | { type: "updateField"; field: "name" | "email" | "message"; value: string }
  | { type: "submit" }
  | { type: "resetForm" };

const initialContactFormState: ContactFormState = {
  name: "",
  email: "",
  message: "",
  submitted: false,
};

function contactFormReducer(
  state: ContactFormState,
  action: ContactFormAction,
): ContactFormState {
  switch (action.type) {
    case "updateField":
      return { ...state, [action.field]: action.value, submitted: false };
    case "submit":
      return { ...state, submitted: true };
    case "resetForm":
      return initialContactFormState;
    default:
      return state;
  }
}

function ContactFormExercise() {
  const [state, dispatch] = useReducer(contactFormReducer, initialContactFormState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "submit" });
  }

  return (
    <section className="xp-card" aria-labelledby="form-title">
      <ExerciseHeading
        number="03"
        label="FORM STATE"
        title="Contact form"
        id="form-title"
      />
      <form className="xp-form" onSubmit={handleSubmit}>
        <label className="xp-field">
          Name
          <input
            value={state.name}
            onChange={(event) => dispatch({ type: "updateField", field: "name", value: event.target.value })}
            required
          />
        </label>
        <label className="xp-field">
          Email
          <input
            type="email"
            value={state.email}
            onChange={(event) => dispatch({ type: "updateField", field: "email", value: event.target.value })}
            required
          />
        </label>
        <label className="xp-field">
          Message
          <textarea
            rows={3}
            value={state.message}
            onChange={(event) => dispatch({ type: "updateField", field: "message", value: event.target.value })}
            required
          />
        </label>
        <div className="xp-actions">
          <button className="xp-button" type="submit">Submit</button>
          <button
            className="xp-button xp-button-secondary"
            type="button"
            onClick={() => dispatch({ type: "resetForm" })}
          >
            Reset
          </button>
        </div>
      </form>
      <p className="xp-status" aria-live="polite">
        {state.submitted ? "Your message is ready to send." : "Form status: editing"}
      </p>
    </section>
  );
}

type Contact = {
  id: number;
  name: string;
  email: string;
};

type ContactState = {
  contacts: Contact[];
};

type ContactAction =
  | { type: "addContact"; contact: Contact }
  | { type: "removeContact"; id: number };

const initialContactsState: ContactState = { contacts: [] };

function contactsReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case "addContact":
      return { contacts: [...state.contacts, action.contact] };
    case "removeContact":
      return { contacts: state.contacts.filter((contact) => contact.id !== action.id) };
    default:
      return state;
  }
}

type ContactContextValue = {
  state: ContactState;
  dispatch: Dispatch<ContactAction>;
};

const ContactContext = createContext<ContactContextValue | undefined>(undefined);

function ContactProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contactsReducer, initialContactsState);
  return (
    <ContactContext.Provider value={{ state, dispatch }}>
      {children}
    </ContactContext.Provider>
  );
}

function useContacts(): ContactContextValue {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContacts must be used inside ContactProvider.");
  }
  return context;
}

function ContactsExercise() {
  const { state, dispatch } = useContacts();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const nextId = useRef(0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({
      type: "addContact",
      contact: { id: nextId.current++, name: name.trim(), email: email.trim() },
    });
    setName("");
    setEmail("");
  }

  return (
    <section className="xp-card" aria-labelledby="contacts-title">
      <ExerciseHeading
        number="04"
        label="USE CONTEXT"
        title="Shared contact list"
        id="contacts-title"
      />
      <form className="xp-form" onSubmit={handleSubmit}>
        <label className="xp-field">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="xp-field">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button className="xp-button" type="submit">Add contact</button>
      </form>
      {state.contacts.length === 0 ? (
        <p className="xp-status">No contacts yet. Add one above.</p>
      ) : (
        <ul className="xp-contact-list">
          {state.contacts.map((contact) => (
            <li key={contact.id}>
              <span><strong>{contact.name}</strong><small>{contact.email}</small></span>
              <button
                className="xp-button xp-button-secondary"
                type="button"
                onClick={() => dispatch({ type: "removeContact", id: contact.id })}
                aria-label={`Remove ${contact.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FocusExercise() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <section className="xp-card" aria-labelledby="focus-title">
      <ExerciseHeading
        number="05"
        label="USE REF"
        title="Focus an input"
        id="focus-title"
      />
      <label className="xp-field">
        Focus target
        <input ref={inputRef} placeholder="This input is focused on load" />
      </label>
      <button
        className="xp-button xp-focus-button"
        type="button"
        onClick={() => inputRef.current?.focus()}
      >
        Focus input
      </button>
      <p className="xp-status">The input is focused when this page loads.</p>
    </section>
  );
}

function ExerciseHeading({
  number,
  label,
  title,
  id,
}: {
  number: string;
  label: string;
  title: string;
  id: string;
}) {
  return (
    <div className="xp-heading">
      <span className="xp-number">{number}</span>
      <div>
        <p>{label}</p>
        <h2 id={id}>{title}</h2>
      </div>
    </div>
  );
}

function ExercisesPage() {
  return (
    <main className="exercise-page">
      <header className="xp-hero">
        <p className="xp-eyebrow">WEEK 10 · DAY 1</p>
        <h1>React Hooks &amp; TypeScript</h1>
        <p>Seven hands-on exercises for reducers, forms, context, DOM refs, generics, and todos.</p>
      </header>
      <div className="xp-grid">
        <ProfileExercise />
        <SurveyExercise />
        <ContactFormExercise />
        <ContactsExercise />
        <FocusExercise />
        <BookApp />
        <TodoApp />
      </div>
      <footer className="xp-footer">Built with React, TypeScript, and reusable hooks.</footer>
    </main>
  );
}

export default function ExerciseXPninja() {
  return (
    <ContactProvider>
      <ExercisesPage />
    </ContactProvider>
  );
}
