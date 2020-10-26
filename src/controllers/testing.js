const router = require('express').Router()
const Category = require('../models/category')
const Album = require('../models/album')
const User = require('../models/user')
const Picture = require('../models/picture')

router.post('/reset', async (request, response) => {
  await User.deleteMany({})
  await Album.deleteMany({})
  await Category.deleteMany({})
  await Picture.deleteMany({})
  response.status(204).end()
})

module.exports = router