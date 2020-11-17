const picturesRouter = require('express').Router()
const User = require('../models/user')
const Picture = require('../models/picture')
const jwtAuth = require('express-jwt')
const cloudinary = require('cloudinary').v2
const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))

cloudinary.config({
  // eslint-disable-next-line no-undef
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // eslint-disable-next-line no-undef
  api_key: process.env.CLOUDINARY_API_KEY,
  // eslint-disable-next-line no-undef
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOptions = (width = '', height = '') => {
  return {
    public_id: Date.now(),
    width,
    height,
    crop: 'scale'
  }
}

// eslint-disable-next-line no-undef
const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Upload helpers ***********************************/

const getOrientation = async (file) => {
  try {
    const dimensions = await sizeOf(file)
    console.log('Dims: ', dimensions)
    return dimensions.width < dimensions.height ? 'isPortrait' : 'isLandscape'
  } catch (err) {
    console.error(err)
  }
}

const setOptions =  (width, height, orientation) => {
  // const orientation = await getOrientation(file)
  const ops = orientation === 'isLandscape' ?
    uploadOptions(width, '') :
    uploadOptions('', height)
  return ops
}

//******************* Upload picture ***********************************/
picturesRouter.post('/upload', routeAuth, async (request, response) => {
  const file = request.files.image
  console.log('Original: ', file)
  const userID = request.user.id
  const width = 1600
  const height = 1200
  let pictureToSave

  const user = await User.findById(userID)
  console.log('User: ', user)
  const orientation = await getOrientation(file.tempFilePath)

  const options = orientation && await setOptions(width, height, orientation)

  const newPic = await cloudinary.uploader.upload(file.tempFilePath, options, (error, result) => {
    if (error) response.send({ error })
    return ({ result })
  })
  console.log('Uploaded: ', newPic)


  const makeUrl = (size, c, res_type, type, p_id, format) => {
    const trans = `w_${size},h_${size},${c}`
    // eslint-disable-next-line no-undef
    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`
    // eslint-disable-next-line quotes
    return `${url}/${res_type}/${type}/${trans}/${p_id}.${format}`
  }

  const thumbUrl = makeUrl(500, 'c_fit', newPic.resource_type, newPic.type, newPic.public_id, newPic.format)
  console.log('Thumb: ', thumbUrl)
  pictureToSave = new Picture({
    title: file.name,
    image: newPic.secure_url,
    thumb: thumbUrl,
    publicID: newPic.public_id,
    user: user.id
  })

  const savedPicture = await pictureToSave.save()
  user.pictures = user.pictures.concat(savedPicture._id)
  await user.save()

  const newSavedPicture = await Picture
    .findById(savedPicture._id)
    .populate('user', { username: 1, email: 1 })

  return response.json(newSavedPicture.toJSON())
})

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
  const picture = await Picture.findById(request.params.id)

  if(!picture.publicID || picture.publicID ==='') {
    await picture.remove()
    return response.status(204).end()
  }

  cloudinary.uploader.destroy(picture.publicID, async result => {
    console.log('Delete: ', result)
    await picture.remove()
  }).then(() =>
    response.status(204).json({ message: 'Image deleted successfully' })
  )

})





module.exports = picturesRouter