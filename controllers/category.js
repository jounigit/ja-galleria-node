const categoryRouter = require('express').Router()
const Category = require('../models/category')

//******************* Get all ***********************************/
categoryRouter.get('/', async (request, response) => {
  const categories = await Category.find({})

  response.json(categories.map(category => category.toJSON()))
})

//******************* Create new ***********************************/
categoryRouter.post('/', async (request, response) => {
  const body = request.body
  console.log('BODY==', body)

  try {
    if (body.title === undefined && body.content === undefined) {
      return response.status(400).json({ error: 'title and content missing' })
    }

    const category = new Category({
      title: body.title,
      content: body.content
    })

    const savedCategory = await category.save()

    const newSavedCategory = await Category
      .findById(savedCategory._id)

    return response.json(newSavedCategory)
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

//******************* Get one ***********************************/
categoryRouter.get('/:id', async (request, response) => {
  const category = await Category.findById(request.params.id)
  if (category) {
    response.json(category.toJSON())
  } else {
    response.status(404).end()
  }
})

//******************* Update one ***********************************/
categoryRouter.put('/:id', async (request, response) => {
  try {
    const body = request.body

    const category = {
      title: body.title,
      content: body.content
    }

    const updatedCategory = await Category
      .findByIdAndUpdate(request.params.id, category)

    if (updatedCategory) {
      return response.json(updatedCategory)
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

//******************* Delete one ***********************************/
categoryRouter.delete('/:id', async (request, response) => {
  await Category.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = categoryRouter