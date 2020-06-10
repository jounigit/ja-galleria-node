const categoriesRouter = require('express').Router()
const User = require('../models/user')
const Category = require('../models/category')
const jwtAuth = require('express-jwt')

const protectedurl = jwtAuth({ secret: process.env.SECRET })

//******************* Get all ***********************************/
categoriesRouter.get('/', async (request, response) => {
  const categories = await Category.find({})

  response.json(categories.map(category => category.toJSON()))
})

//******************* Create new ***********************************/
categoriesRouter.post('/', protectedurl, async (request, response) => {
  const body = request.body
  const userID = request.user.id

  const user = await User.findById(userID)

  const category = new Category({
    title: body.title,
    content: body.content,
    user: user._id
  })

  const savedCategory = await category.save()
  user.categories = user.categories.concat(savedCategory._id)
  await user.save()

  const newSavedCategory = await Category
    .findById(savedCategory._id)
    .populate('user', { username: 1, email: 1 })

  return response.json(newSavedCategory.toJSON())

})

//******************* Get one ***********************************/
categoriesRouter.get('/:id', async (request, response) => {
  const category = await Category.findById(request.params.id)
  if (category) {
    response.json(category.toJSON())
  } else {
    response.status(404).end()
  }
})

//******************* Update one ***********************************/
categoriesRouter.put('/:id', protectedurl, async (request, response) => {
  const body = request.body

  const category = {
    title: body.title,
    content: body.content
  }

  const updatedCategory = await Category.findByIdAndUpdate(request.params.id, category)
  return response.json(updatedCategory.toJSON())
})

//******************* Delete one ***********************************/
categoriesRouter.delete('/:id', protectedurl, async (request, response) => {
  await Category.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = categoriesRouter