const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.get('/', (request, response) => {
  console.log('ME OK!')
  response.send('OK')
})
loginRouter.post('/', async (request, response) => {
  const { username, email, password } = request.body
  let user

  if (username) {
    user = await User.findOne({ username })
  }

  if (email) {
    user = await User.findOne({ email: email })
  }

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid email or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // eslint-disable-next-line no-undef
  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({ token, user: user.username, email: user.email, id: user._id })
})

module.exports = loginRouter