const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const jwtAuth = require('express-jwt')

// eslint-disable-next-line no-undef
const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Get all ***********************************/
usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users.map(u => u.toJSON()))
})

//******************* Get one ***********************************/
usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
  if (user) {
    response.json(user.toJSON())
  } else {
    response.status(404).end()
  }
})

//******************* Create new ***********************************/
usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    email: body.email,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

//******************* Delete user ***********************************/
usersRouter.delete('/:id', routeAuth, async (request, response) => {
  // console.log('User controller delete ID: ', request.params.id)
  const user = await User.findById(request.params.id)

  const removed = await user.remove()

  console.log('User controller removed: ', removed)
  response.status(204).end()
})

module.exports = usersRouter