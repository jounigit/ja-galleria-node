const albumsRouter = require('express').Router()
const User = require('../models/user')
// const Category = require('../models/category')
const Album = require('../models/album')
const jwtAuth = require('express-jwt')

const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Get all ***********************************/
albumsRouter.get('/', async (request, response) => {
  const albums = await Album
    .find({})
    .populate( 'user', { username: 1, email: 1 } )
    .populate('category', { title: 1 })

  response.json(albums.map(album => album.toJSON()))
})

//******************* Create new ***********************************/
albumsRouter.post('/', routeAuth, async (request, response) => {
  const { title, content } = request.body
  const userID = request.user.id

  const user = await User.findById(userID)

  const album = new Album({
    title,
    content,
    user: user._id
  })

  const savedAlbum = await album.save()
  user.albums = user.albums.concat(savedAlbum._id)
  await user.save()

  const newSavedAlbum = await Album
    .findById(savedAlbum._id)
    .populate('user', { username: 1, email: 1 })

  return response.json(newSavedAlbum.toJSON())

})

//******************* Get one ***********************************/
albumsRouter.get('/:id', async (request, response) => {
  const album = await Album
    .findById(request.params.id)
    .populate('category', { title: 1 })
  if (album) {
    response.json(album.toJSON())
  } else {
    response.status(404).end()
  }
})

//******************* Update one ***********************************/
albumsRouter.put('/:id', routeAuth, async (request, response) => {
  const { title, content, category } = request.body

  const album = {
    title,
    content,
    category
  }

  await Album.findByIdAndUpdate(request.params.id, album)
  const updatedAlbum = await Album.findById(request.params.id)
  return response.json(updatedAlbum.toJSON())
})

//******************* Delete one ***********************************/
albumsRouter.delete('/:id', routeAuth, async (request, response) => {
  await Album.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = albumsRouter