const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const jwtAuth = require('express-jwt')

// eslint-disable-next-line no-undef
const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Get all ***********************************/
usersRouter.get('/', async (req, res) => {
  const users = await User.find({})
  res.json(users.map(u => u.toJSON()))
})

//******************* Get one ***********************************/
usersRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    res.json(user.toJSON())
  } else {
    res.status(404).end()
  }
})

//******************* Create new ***********************************/
usersRouter.post('/', async (req, res) => {
  const { username, email, password, role } = req.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    email,
    passwordHash,
    role: role || 'editor'
  })

  const savedUser = await user.save()

  res.json(savedUser)
})

//******************* Delete user ***********************************/
usersRouter.delete('/:id', routeAuth, async (req, res) => {
  // console.log('User controller delete ID: ', req.params.id)
  const user = await User.findById(req.params.id)

  await user.remove()

  // console.log('User controller removed: ', removed)
  res.status(204).end()
})

module.exports = usersRouter