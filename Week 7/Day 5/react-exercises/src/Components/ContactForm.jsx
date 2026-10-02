import { useState } from 'react'

const initialFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
}

function ContactForm() {
  const [formData, setFormData] = useState(initialFormData)
  const [submittedUser, setSubmittedUser] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmittedUser({ ...formData })
  }

  const handleReset = () => {
    setFormData({ ...initialFormData })
    setSubmittedUser(null)
  }

  return submittedUser ? (
    <div className="contact-summary">
      <h3>Contact information submitted</h3>
      <div className="summary-list">
        <p><strong>First name:</strong> {submittedUser.firstName}</p>
        <p><strong>Last name:</strong> {submittedUser.lastName}</p>
        <p><strong>Phone:</strong> {submittedUser.phone}</p>
        <p><strong>Email:</strong> {submittedUser.email}</p>
      </div>
      <button type="button" onClick={handleReset}>Reset</button>
    </div>
  ) : (
    <form className="form-fields" onSubmit={handleSubmit}>
      <label className="form-field" htmlFor="contact-first-name">
        First name
        <input
          id="contact-first-name"
          name="firstName"
          autoComplete="given-name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-field" htmlFor="contact-last-name">
        Last name
        <input
          id="contact-last-name"
          name="lastName"
          autoComplete="family-name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-field" htmlFor="contact-phone">
        Phone
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          pattern="[+]?[0-9]{7,15}"
          title="Enter 7 to 15 digits, optionally starting with +."
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </label>

      <label className="form-field" htmlFor="contact-email">
        Email
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>

      <button className="form-submit" type="submit">Submit</button>
    </form>
  )
}

export default ContactForm