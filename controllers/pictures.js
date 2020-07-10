const picturesRouter = require('express').Router()
const User = require('../models/user')
const Picture = require('../models/picture')
const jwtAuth = require('express-jwt')

const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Get all ***********************************/
picturesRouter.get('/', async (request, response) => {
  const pictures = await Picture.find({})

  response.json(pictures.map(picture => picture.toJSON()))
})

//******************* Create new ***********************************/
picturesRouter.post('/', routeAuth, async (request, response) => {
  const { title } = request.body
  const userID = request.user.id

  const user = await User.findById(userID)

  const picture = new Picture({
    title,
    user: user._id
  })

  const savedPicture = await picture.save()
  user.pictures = user.pictures.concat(savedPicture._id)
  await user.save()

  const newSavedPicture = await Picture
    .findById(savedPicture._id)
    .populate('user', { username: 1, email: 1 })

  return response.json(newSavedPicture.toJSON())
})

//******************* Get one ***********************************/
picturesRouter.get('/:id', async (request, response) => {
  const picture = await Picture.findById(request.params.id)
  if (picture) {
    response.json(picture.toJSON())
  } else {
    response.status(404).end()
  }
})

//******************* Update one ***********************************/
picturesRouter.put('/:id', routeAuth, async (request, response) => {
  const { title, content } = request.body

  const picture = {
    title,
    content
  }

  await Picture.findByIdAndUpdate(request.params.id, picture)
  const updatedPicture = await Picture.findById(request.params.id)
  return response.json(updatedPicture.toJSON())
})

//******************* Delete one ***********************************/
picturesRouter.delete('/:id', routeAuth, async (request, response) => {
  await Picture.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = picturesRouter