import express from 'express'
import usersRouter from './users.js'

const app = express()
const port = Number(process.env.PORT) || 3001

const customers = [
  { id: 1, firstName: 'John', lastName: 'Doe' },
  { id: 2, firstName: 'Jane', lastName: 'Doe' },
  { id: 3, firstName: 'Ziv', lastName: 'Chen' },
  { id: 4, firstName: 'Isaac', lastName: 'Groisman' },
  { id: 5, firstName: 'Avner', lastName: 'Maman' },
  { id: 6, firstName: 'Megan', lastName: 'Dreyfuss' },
]

app.use(express.json())

app.use('/users', usersRouter)

app.get('/api/hello', (request, response) => {
  response.json({ message: 'Hello From Express' })
})

app.post('/api/world', (request, response) => {
  console.log('Received POST request body:', request.body)
  const { message } = request.body ?? {}
  if (typeof message !== 'string') {
    response.status(400).json({ error: 'The request body must include a message string.' })
    return
  }

  response.json({
    message: `I received your POST request. This is what you sent me: ${message}`,
  })
})

app.get('/api/customers/', (request, response) => {
  response.json(customers)
})

app.listen(port, () => {
  console.log(`Express backend listening at http://localhost:${port}`)
})
