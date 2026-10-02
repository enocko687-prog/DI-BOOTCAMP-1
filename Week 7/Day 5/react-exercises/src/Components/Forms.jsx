import { useState } from 'react'

function Forms() {
  const [username, setUsername] = useState('')
  const [age, setAge] = useState(null)
  const [errormessage, setErrormessage] = useState('')
  const [message, setMessage] = useState('I love React!')
  const [selectedCar, setSelectedCar] = useState('Volvo')

  let header = null

  if (username.trim() && age !== null && !errormessage) {
    header = (
      <h3 className="form-output">
        Hello {username}, you are {age} years old.
      </h3>
    )
  } else if (username.trim()) {
    header = <h3 className="form-output">Hello {username}</h3>
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'username') {
      setUsername(value)
      return
    }

    if (name === 'age') {
      setAge(value === '' ? null : value)
      setErrormessage(
        value !== '' && !/^\d+$/.test(value)
          ? 'Age must be a number.'
          : '',
      )
    }
  }

  const mySubmitHandler = (event) => {
    event.preventDefault()

    if (!username.trim() || age === null || errormessage) {
      return
    }

    alert(`Name: ${username}\nAge: ${age}`)
  }

  return (
    <div className="forms-layout">
      {header}
      <form className="form-fields" onSubmit={mySubmitHandler}>
        <label className="form-field" htmlFor="form-username">
          Name
          <input
            id="form-username"
            name="username"
            type="text"
            value={username}
            onChange={handleChange}
            autoComplete="name"
            required
          />
        </label>

        <label className="form-field" htmlFor="form-age">
          Age
          <input
            id="form-age"
            name="age"
            type="text"
            inputMode="numeric"
            value={age ?? ''}
            onChange={handleChange}
            aria-invalid={Boolean(errormessage)}
            aria-describedby={errormessage ? 'age-error' : undefined}
            required
          />
          {errormessage && (
            <span className="form-error" id="age-error" role="alert">
              {errormessage}
            </span>
          )}
        </label>

        <label className="form-field" htmlFor="form-message">
          Message
          <textarea
            id="form-message"
            name="message"
            rows="3"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>

        <label className="form-field" htmlFor="form-car">
          Favorite car
          <select
            id="form-car"
            name="car"
            value={selectedCar}
            onChange={(event) => setSelectedCar(event.target.value)}
          >
            <option value="Volvo">Volvo</option>
            <option value="Saab">Saab</option>
            <option value="Mercedes">Mercedes</option>
            <option value="Audi">Audi</option>
          </select>
        </label>

        <button className="form-submit" type="submit">Submit</button>
      </form>
    </div>
  )
}

export default Forms