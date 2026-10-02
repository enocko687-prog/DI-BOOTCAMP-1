function Input({
  label,
  name,
  value,
  onChange,
  error,
  inputMode,
  autoComplete,
}) {
  const errorId = `${name}-error`

  return (
    <label className="validation-field" htmlFor={`validation-${name}`}>
      {label}
      <input
        id={`validation-${name}`}
        className="validation-input"
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span className="form-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </label>
  )
}

export default Input