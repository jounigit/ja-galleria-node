/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

const Picture = require('../models/picture')

beforeEach( async () => {
  await Picture.insertMany(helper.initialPictures)
})

//****************** succeeds ************************************/

describe('with initial pictures', () => {

  // get all
  test('succeeds return pictures as json', async () => {
    await helper.allInCollection(Picture)
    // console.log('PICS 1: ', pictures)

    await api
      .get('/api/pictures')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all pictures are returned', async () => {
    await helper.allInCollection(Picture)

    const response = await api.get('/api/pictures')

    // console.log(response.body)

    expect(response.body.length).toBe(helper.initialPictures.length)
  })

  // get one
  test('succeeds view a specific picture', async () => {
    const picturesAtStart = await helper.allInCollection(Picture)

    const pictureToSee = picturesAtStart[0]

    const result = await api
      .get(`/api/pictures/${pictureToSee.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual(pictureToSee)
  })
})

//****************** fails ************************************/
// status code 404
describe('if picture does not exist', () => {

  test('fails with statuscode 404', async () => {
    const validNonexistingId = await helper.nonExistingId(Picture)

    await api
      .get(`/api/pictures/${validNonexistingId}`)
      .expect(404)
  })
})
// status code 400
describe('if id is invalid', () => {
  test('fails with statuscode 400', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/pictures/${invalidId}`)
      .expect(400)
  })
})