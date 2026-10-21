import { useState } from "react";
import useForm, { type FormValidators } from "../hooks/useForm";

interface RegistrationValues {
  name: string;
  email: string;
  password: string;
}

type SubmissionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const initialValues: RegistrationValues = {
  name: "",
  email: "",
  password: "",
};

const validators: FormValidators<RegistrationValues> = {
  name: (value) => (value.trim() ? undefined : "Please enter your name."),
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? undefined
      : "Enter a valid email address.",
  password: (value) =>
    value.length >= 8
      ? undefined
      : "Use at least 8 characters for your password.",
};

async function simulateRegistration(values: RegistrationValues): Promise<string> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 350));

  if (values.email.endsWith("@example.invalid")) {
    throw new Error("The demo registration service could not accept that address.");
  }

  return `Registration submitted for ${values.name}.`;
}

function RegistrationForm() {
  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });

  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues,
    validators,
    onSubmit: async (formValues) => {
      setSubmission({ status: "idle" });

      try {
        setSubmission({
          status: "success",
          message: await simulateRegistration(formValues),
        });
      } catch (error) {
        setSubmission({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again.",
        });
      }
    },
  });

  return (
    <form
      className="registration-form"
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <label className="form-field">
        <span>Name</span>
        <input
          autoComplete="name"
          name="name"
          onChange={handleChange}
          placeholder="Your name"
          value={values.name}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>

      <label className="form-field">
        <span>Email address</span>
        <input
          autoComplete="email"
          name="email"
          onChange={handleChange}
          placeholder="you@example.com"
          type="email"
          value={values.email}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
        <span className="field-hint">
          Use <code>@example.invalid</code> to preview the error state.
        </span>
      </label>

      <label className="form-field">
        <span>Password</span>
        <input
          autoComplete="new-password"
          name="password"
          onChange={handleChange}
          placeholder="At least 8 characters"
          type="password"
          value={values.password}
        />
        {errors.password && (
          <span className="field-error">{errors.password}</span>
        )}
      </label>

      <button className="action-button primary-button" type="submit">
        Create account
      </button>

      {submission.status === "success" && (
        <p className="success-message" role="status">
          {submission.message}
        </p>
      )}
      {submission.status === "error" && (
        <p className="error-message" role="alert">
          {submission.message}
        </p>
      )}
    </form>
  );
}

export default RegistrationForm;
