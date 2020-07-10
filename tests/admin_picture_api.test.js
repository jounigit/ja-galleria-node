/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

const Picture = require('../models/picture')

let token

//***************** admin succeeds ******************************/

describe('authorized with a valid token', () => {
  beforeAll( async () => {
    await helper.addTestUser()
    token = await helper.getToken()
  })

  beforeEach( async () => {
    await Picture.insertMany(helper.initialPictures)
  })

  // create
  test('succeeds adding new picture', async () => {

    await api
      .post('/api/pictures')
      .send({
        title: 'Picture added'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  // update
  test('succeeds update with valid id',  async  () => {
    const picturesAtStart = await helper.allInCollection(Picture)
    const picture = picturesAtStart[0]

    const title = 'Updated'
    const newPicture = {
      title
    }

    const response = await api
      .put(`/api/pictures/${picture.id}`)
      .send(newPicture)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const responseTitle = response.body.title
    expect(title).toContain(responseTitle)
  })

  // delete
  test('succeeds delete with valid id', async () => {
    const picturesAtStart = await helper.allInCollection(Picture)
    const toDelete = picturesAtStart[0]

    await api
      .delete(`/api/pictures/${toDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const picturesAtEnd = await helper.allInCollection(Picture)

    expect(picturesAtEnd.length).toBe(picturesAtStart.length-1)
  })
})

//****************** fails ************************************/
// status code 401
describe('unauthorized fails with status 401 at protected routes', () => {

  beforeEach( async () => {
    await Picture.insertMany(helper.initialPictures)
  })

  test('fails add new',  async  () => {
    await api
      .post('/api/pictures')
      .send({
        title: 'Picture 1'
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails update with valid id',  async  () => {
    const picturesAtStart = await helper.allInCollection(Picture)
    const picture = picturesAtStart[0]

    const title = 'Updated'
    const newPicture = {
      title
    }

    await api
      .put(`/api/pictures/${picture.id}`)
      .send(newPicture)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails delete with valid id',  async  () => {
    const picturesAtStart = await helper.allInCollection(Picture)
    const pic = picturesAtStart[0]

    await api
      .delete(`/api/pictures/${pic.id}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})
