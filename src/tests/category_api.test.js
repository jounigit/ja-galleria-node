/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

const Category = require('../models/category')

beforeEach( async () => {
  await Category.insertMany(helper.initialCategories)
})

//****************** succeeds ************************************/

describe('with initial categories', () => {

  // get all
  test('succeeds return categories as json', async () => {
    await helper.allInCollection(Category)

    await api
      .get('/api/categories')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all categories are returned', async () => {
    await helper.allInCollection(Category)
    // console.log('CAT 2: ', categories)

    const response = await api.get('/api/categories')

    expect(response.body.length).toBe(helper.initialCategories.length)
  })

  // get one
  test('succeeds view a specific category', async () => {
    const categoriesAtStart = await helper.allInCollection(Category)

    const categoryToSee = categoriesAtStart[0]

    const result = await api
      .get(`/api/categories/${categoryToSee.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual(categoryToSee)
  })
})

//****************** fails ************************************/
// status code 404
describe('if category does not exist', () => {

  test('fails with statuscode 404', async () => {
    const validNonexistingId = await helper.nonExistingId(Category)

    await api
      .get(`/api/categories/${validNonexistingId}`)
      .expect(404)
  })
})
// status code 400
describe('if id is invalid', () => {
  test('fails with statuscode 400', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/categories/${invalidId}`)
      .expect(400)
  })
})

// status code 401
describe('unauthorized fails with status 401 at protected routes', () => {

  test('fails add new',  async  () => {
    await api
      .post('/api/categories')
      .send({
        title: 'Category 1'
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails update with valid id',  async  () => {
    const categoriesAtStart = await helper.allInCollection(Category)
    const category = categoriesAtStart[0]

    await api
      .put(`/api/categories/${category.id}`)
      .send({
        title: 'Category update'
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails delete with valid id',  async  () => {
    const categoriesAtStart = await helper.allInCollection(Category)
    const category = categoriesAtStart[0]

    await api
      .delete(`/api/categories/${category.id}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})