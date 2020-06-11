const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Category = require('../models/category')
const User = require('../models/user')

//********** constants *******************************/
const username = 'test'
const email = 'test@mail.com'
const password = 'testpassi'

const initialCategories = [
  {
    title: 'Category 1',
    content: 'HTML is easy',
  },
  {
    title: 'Category 2',
    content: 'Täällä tätä.',
  },
  {
    title: 'Category 3',
    content: 'Täällä 3',
  },
]


//********** user helpers *******************************/

const addTestUser = async () => {
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const testUser = new User({
    username,
    email,
    passwordHash,
  })

  await testUser.save()
}

const getToken = async () => {
  const response = await api
    .post('/api/login')
    .send({
      username,
      password,
    })

  return response.body.token
}
//********** category helpers *******************************/

const categoriesInDb = async () => {
  const categories = await Category.find({})
  return categories.map(category => category.toJSON())
}

const nonExistingId = async () => {
  const category = new Category({ title: 'willremovethissoon' })
  await category.save()
  await category.remove()

  return category._id.toString()
}

module.exports = {
  initialCategories, categoriesInDb, nonExistingId, addTestUser, getToken
}