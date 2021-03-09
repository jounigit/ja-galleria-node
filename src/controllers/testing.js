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
  console.log('Reset test DB!!')
  response.send( 'Test db docs deleted!' )
})

module.exports = router