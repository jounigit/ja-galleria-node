const albumsRouter = require('express').Router()
const User = require('../models/user')
const Category = require('../models/category')
const Album = require('../models/album')
const jwtAuth = require('express-jwt')
const _ = require('underscore-node')
const { grantAccess } = require('../utils/accessControl')

// eslint-disable-next-line no-undef
const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Get all ***********************************/
albumsRouter.get('/', async (request, response) => {
  const albums = await Album
    .find({})
    .populate( 'user', { username: 1 } )
    // .populate('category', { title: 1 })

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
    response.status(404).send({ error: 'Not Found' })
  }
})

//******************* Create new ***********************************/
albumsRouter.post('/', routeAuth, async (request, response) => {
  const { title, content, category } = request.body
  const userID = request.user.id
  // console.log('Album create requests: ', request,' : ', title,' ', content)
  const user = await User.findById(userID)
  // console.log('Album user: ', user)

  const album = new Album({
    title,
    content,
    user: user._id,
    category
  })

  const savedAlbum = await album.save()
  // console.log('Album saved: ', savedAlbum)
  user.albums = user.albums.concat(savedAlbum._id)
  await user.save()

  // update category document
  if( category || !category==='') {
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
albumsRouter.put('/:id', routeAuth, async (req, res) => {
  const { category } = req.body
  const albumID = req.params.id
  const album = await Album.findById(albumID)

  const access = grantAccess(req.user, album.user, 'deleteOwn', 'deleteAny', 'album')
  console.log('Access: ', access)
  if (!access) { return res.status(403).send({ message: 'You don\'t have enough permission' }) }

  if( category && album.category && category !== album.category) {
    const oldCategory = await Category.findById(album.category)
    const newAlbums = oldCategory.albums.filter(item => item.toString() !== album.id)
    oldCategory.albums = newAlbums
    await oldCategory.save()
  }

  if( category || !category==='') {
    const categoryToUpdate = await Category.findById(category)
    categoryToUpdate.albums = categoryToUpdate.albums.concat(albumID)
    await categoryToUpdate.save()
  }

  await album.updateOne(req.body)

  const updatedAlbum = await Album.findById(albumID)
    .populate('user', { username: 1, email: 1 })

  return res.json(updatedAlbum.toJSON())
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
  // console.log('Update album: ', updatedAlbum.toJSON())
  return response.json(updatedAlbum.toJSON())

})

//******************* Delete picture ***********************/
albumsRouter.delete('/:id/:picture', routeAuth, async (request, response) => {
  const albumID = request.params.id
  const pictureID = request.params.picture

  // console.log('FRONTTI huuttaa: ', albumID, ' -- ', pictureID)
  const album = await Album.findById(albumID)

  const pictureToUpdate = {
    pictures: album.pictures.filter(p => !pictureID.includes(p))
  }

  await Album.findByIdAndUpdate(albumID, pictureToUpdate)
  const res = await Album.findById(albumID)
  // console.log('BACK delete albumPic: ', res)
  return response.json(res.toJSON())

})

//******************* Delete one ***********************************/
albumsRouter.delete('/:id', routeAuth, async (req, res) => {
  const album = await Album.findById(req.params.id)

  const access = grantAccess(req.user, album.user, 'deleteOwn', 'deleteAny', 'album')
  if (!access) { return res.status(403).json({ error: 'You don\'t have enough permission' }) }

  await album.remove()
  res.status(204).end()
})

module.exports = albumsRouter