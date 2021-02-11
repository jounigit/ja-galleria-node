/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

const Category = require('../models/category')

let token

//***************** admin succeeds ******************************/

describe('authorized with a valid token', () => {
  beforeAll( async () => {
    await helper.addTestUser()
    token = await helper.getToken()
  })

  beforeEach( async () => {
    await Category.insertMany(helper.initialCategories)
    // console.log('Albums init:', atStart)
  })

  // create
  test('succeeds adding new category', async () => {

    await api
      .post('/api/categories')
      .send({
        title: 'Category added'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  // update
  test('succeeds update with valid id',  async  () => {
    const categoriesAtStart = await helper.allInCollection(Category)
    const category = categoriesAtStart[0]

    const title = 'Updated'
    const newCategory = {
      title
    }

    const response = await api
      .put(`/api/categories/${category.id}`)
      .send(newCategory)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const responseTitle = response.body.title
    expect(title).toContain(responseTitle)
  })

  // delete
  test('succeeds delete with valid id', async () => {
    const categoriesAtStart = await helper.allInCollection(Category)
    const categoryToDelete = categoriesAtStart[0]
    // console.log('ALUKSI::', categoriesAtStart)
    await api
      .delete(`/api/categories/${categoryToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const categoriesAtEnd = await helper.allInCollection(Category)

    // console.log('LOPUKSI::', categoriesAtEnd)
    expect(categoriesAtEnd.length).toBe(categoriesAtStart.length-1)
  })

})
