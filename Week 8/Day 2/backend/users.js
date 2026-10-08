import { Router } from 'express'

const router = Router()

router.get('/', (request, response) => {
  response.json([
    { id: 1, username: 'somebody' },
    { id: 2, username: 'somebody_else' },
  ])
})

export default router
