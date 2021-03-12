const categoriesRouter = require('express').Router()
const User = require('../models/user')
const Category = require('../models/category')
const jwtAuth = require('express-jwt')
const { grantAccess } = require('../utils/accessControl')

// eslint-disable-next-line no-undef
const routeAuth = jwtAuth({ secret: process.env.SECRET })

//******************* Get all ***********************************/
categoriesRouter.get('/', async (req, res) => {
  const categories = await Category.find({})
    // .populate( { path: 'albums', model: 'Album' } )
    .populate( 'user', { username: 1 } )
  res.json(categories.map(category => category.toJSON()))
})

//******************* Create new ***********************************/
categoriesRouter.post('/', routeAuth, async (req, res) => {
  const { title, content } = req.body
  const userID = req.user.id

  const user = await User
    .findById(userID)
    .populate('album', { title: 1 })

  const category = new Category({
    title,
    content,
    user: user._id
  })

  const savedCategory = await category.save()
  // console.log('Category saved: ', savedCategory)
  user.categories = user.categories.concat(savedCategory._id)
  await user.save()

  const newSavedCategory = await Category
    .findById(savedCategory._id)
    .populate('user', { username: 1, email: 1 })

  return res.json(newSavedCategory.toJSON())

})

//******************* Get one ***********************************/
categoriesRouter.get('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (category) {
    res.json(category.toJSON())
  } else {
    res.status(404).end()
  }
})

// const updatePermission = (user, documentUser, resource) => {
//   return (user.id === documentUser) ? ac.can(user.role).updateOwn(resource) : ac.can(user.role).updateAny(resource)
// }

//******************* Update one ***********************************/
categoriesRouter.put('/:id', routeAuth, async (req, res) => {
  console.log('Req user: ', req.user)

  const category = await Category.findById(req.params.id)

  const access = grantAccess(req.user, category.user, 'updateOwn', 'updateAny', 'category')
  if (!access) { return res.status(403).json({ error: 'You don\'t have enough permission' }) }

  await category.updateOne(req.body)

  const updatedCategory = await Category.findById(req.params.id)
    .populate('user', { username: 1, email: 1 })
  return res.json(updatedCategory.toJSON())
})

//******************* Delete one ***********************************/
categoriesRouter.delete('/:id', routeAuth, async (req, res) => {

  const category = await Category.findById(req.params.id)

  const access = grantAccess(req.user, category.user, 'deleteOwn', 'deleteAny', 'category')
  if (!access) { return res.status(403).json({ error: 'You don\'t have enough permission' }) }

  await category.remove()
  res.status(204).end()
})

module.exports = categoriesRouter


// const permission = (req.user.id === category.user) ? ac.can(req.user.role).updateOwn('category')
//   : ac.can(req.user.role).updateAny('category')

// updatePermission(req.user, category.user, category)

// if (!permission.granted) {
//   return res.status(403).json({ error: 'You don\'t have enough permission' })
// }