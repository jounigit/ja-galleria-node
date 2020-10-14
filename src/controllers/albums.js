const albumsRouter = require('express').Router()
const User = require('../models/user')
const Category = require('../models/category')
const Album = require('../models/album')
const jwtAuth = require('express-jwt')
const _ = require('underscore-node')

const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Get all ***********************************/
albumsRouter.get('/', async (request, response) => {
  const albums = await Album
    .find({})
    .populate( 'user', { username: 1 } )
    .populate('category', { title: 1 })

  response.json(albums.map(album => album.toJSON()))
})

//******************* Get one ***********************************/
albumsRouter.get('/:id', async (request, response) => {
  const album = await Album
    .findById(request.params.id)
    // .populate('category', { title: 1 })
  if (album) {
    response.json(album.toJSON())
  } else {
    response.status(404).end()
  }
})

//******************* Create new ***********************************/
albumsRouter.post('/', routeAuth, async (request, response) => {
  const { title, content, category } = request.body
  const userID = request.user.id

  const user = await User.findById(userID)
  console.log('Album user: ', user)

  const album = new Album({
    title,
    content,
    user: user._id,
    category
  })

  const savedAlbum = await album.save()
  console.log('Album saved: ', savedAlbum)
  user.albums = user.albums.concat(savedAlbum._id)
  await user.save()

  if( category || !category==='') {
    console.log('cat if: ', category)
    const categoryToUpdate = await Category.findById(category)
    categoryToUpdate.albums = categoryToUpdate.albums.concat(savedAlbum._id)
    await categoryToUpdate.save()
  }

  const newSavedAlbum = await Album
    .findById(savedAlbum._id)
    .populate('user', { username: 1, email: 1 })

  return response.json(newSavedAlbum.toJSON())

})

//******************* Update one ***********************************/
albumsRouter.put('/:id', routeAuth, async (request, response) => {
  const { category } = request.body
  const albumID = request.params.id

  await Album.findByIdAndUpdate(albumID, request.body)

  if( category || !category==='') {
    const categoryToUpdate = await Category.findById(category)
    categoryToUpdate.albums = categoryToUpdate.albums.concat(albumID)
    await categoryToUpdate.save()
  }

  const updatedAlbum = await Album.findById(albumID)
    .populate('user', { username: 1, email: 1 })

  return response.json(updatedAlbum.toJSON())
})

//******************* Update one ***********************************/
albumsRouter.get('/:id/pictures/:picture', routeAuth, async (request, response) => {
  const albumID = request.params.id
  const pictureID = request.params.picture

  const album = await Album.findById(albumID)

  const updatedPictures = album.pictures.concat(pictureID)

  const uniquePictures = _.uniq(updatedPictures, function(i) {
    return (i._id) ? i._id.toString() : i
  })

  const albumToUpdate = {
    pictures: uniquePictures
  }

  await Album.findByIdAndUpdate(albumID, albumToUpdate)
  const updatedAlbum = await Album.findById(albumID)
  return response.json(updatedAlbum.toJSON())
})
//******************* Update one with picture ***********************/
albumsRouter.put('/:id/:picture', routeAuth, async (request, response) => {
  const albumID = request.params.id
  const pictureID = request.params.picture

  const album = await Album.findById(albumID)

  const updatedPictures = album.pictures.concat(pictureID)

  const uniikki = _.uniq(updatedPictures, function(i) {
    return (i._id) ? i._id.toString() : i
  })

  const albumToUpdate = {
    pictures: uniikki
  }

  await Album.findByIdAndUpdate(albumID, albumToUpdate)
  const updatedAlbum = await Album.findById(albumID)
  return response.json(updatedAlbum.toJSON())

})

//******************* Delete picture ***********************/
albumsRouter.delete('/:id/:picture', routeAuth, async (request, response) => {
  const albumID = request.params.id
  const pictureID = request.params.picture

  console.log('FRONTTI huuttaa: ', albumID, ' -- ', pictureID)
  const album = await Album.findById(albumID)

  const pictureToUpdate = {
    pictures: album.pictures.filter(p => !pictureID.includes(p))
  }

  await Album.findByIdAndUpdate(albumID, pictureToUpdate)
  const res = await Album.findById(albumID)
  console.log('BACK delete albumPic: ', res)
  return response.json(res.toJSON())

})

//******************* Delete one ***********************************/
albumsRouter.delete('/:id', routeAuth, async (request, response) => {
  await Album.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = albumsRouter