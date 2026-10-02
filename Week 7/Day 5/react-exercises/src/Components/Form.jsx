import { useState } from 'react'
import Input from './Input'

const initialValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
}

const phonePattern = /^\+?(?:\d[\s().-]*){7,15}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(name, value) {
  if (!value.trim()) {
    return 'This field is required.'
  }

  if (name === 'phone' && !phonePattern.test(value)) {
    return 'Enter a valid phone number with 7 to 15 digits.'
  }

  if (name === 'email' && !emailPattern.test(value)) {
    return 'Enter a valid email address.'
  }

  return ''
}

function Form() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateField(name, value),
    }))
    setIsValid(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = Object.fromEntries(
      Object.entries(values).map(([name, value]) => [
        name,
        validateField(name, value),
      ]),
    )

    setErrors(nextErrors)
    setIsValid(Object.values(nextErrors).every((error) => !error))
  }

  return (
    <form className="validation-form" onSubmit={handleSubmit} noValidate>
      <Input
        label="First Name"
        name="firstName"
        value={values.firstName}
        onChange={handleChange}
        error={errors.firstName}
        autoComplete="given-name"
      />
      <Input
        label="Last Name"
        name="lastName"
        value={values.lastName}
        onChange={handleChange}
        error={errors.lastName}
        autoComplete="family-name"
      />
      <Input
        label="Phone"
        name="phone"
        value={values.phone}
        onChange={handleChange}
        error={errors.phone}
        inputMode="tel"
        autoComplete="tel"
      />
      <Input
        label="Email"
        name="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        inputMode="email"
        autoComplete="email"
      />
      <button className="form-submit" type="submit">Validate</button>
      {isValid && (
        <p className="validation-success" role="status">
          All fields are valid.
        </p>
      )}
    </form>
  )
}

export default Form