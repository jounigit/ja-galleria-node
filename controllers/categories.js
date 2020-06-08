const categoriesRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Category = require('../models/category')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

//******************* Get all ***********************************/
categoriesRouter.get('/', async (request, response) => {
  const categories = await Category.find({})

  response.json(categories.map(category => category.toJSON()))
})

//******************* Create new ***********************************/
categoriesRouter.post('/', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.title === undefined && body.content === undefined) {
      return response.status(400).json({ error: 'title and content missing' })
    }

    const user = await User.findById(decodedToken.id)

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
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
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
categoriesRouter.put('/:id', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)

  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (body.title === undefined && body.content === undefined) {
    return response.status(400).json({ error: 'title and content missing' })
  }

  try {
    // const user = await User.findById(decodedToken.id)

    const category = {
      title: body.title,
      content: body.content
    }

    const updatedCategory = await Category
      .findByIdAndUpdate(request.params.id, category)

    if (updatedCategory) {
      return response.json(updatedCategory.toJSON())
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

//******************* Delete one ***********************************/
categoriesRouter.delete('/:id', async (request, response) => {
  await Category.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = categoriesRouter