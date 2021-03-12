const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.get('/', (req, res) => {
  console.log('ME OK!')
  res.send('OK')
})
loginRouter.post('/', async (req, res) => {
  const { username, email, password } = req.body
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
    return res.status(401).json({
      error: 'invalid email or password'
    })
  }

  const userForToken = {
    username: user.username,
    role: user.role,
    id: user._id
  }

  // eslint-disable-next-line no-undef
  const token = jwt.sign(userForToken, process.env.SECRET)

  res
    .status(200)
    .send({
      token,
      user: user.username,
      email: user.email,
      id: user._id,
      role: user.role
    })
})

module.exports = loginRouter