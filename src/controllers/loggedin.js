const loggedinRouter = require('express').Router()
const User = require('../models/user')
const jwtAuth = require('express-jwt')

const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Get loggedin user ******************************/

loggedinRouter.get('/', routeAuth, async (request, response) => {
  const userID = request.user.id

  const user = await User.findById(userID)
  // console.log('USER == ', user)

  return response.json(user.toJSON())
})


module.exports = loggedinRouter