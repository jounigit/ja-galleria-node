/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

const Album = require('../models/album')

//********** ******************************************/
beforeEach( async () => {
  await Album.insertMany(helper.initialAlbums)
})
//********** album succeeds ********************************/
describe('with initial albums', () => {

  // get all
  test('succeeds return albums as json', async () => {

    await api
      .get('/api/albums')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all albums are returned', async () => {
    const response = await api.get('/api/albums')

    expect(response.body.length).toBe(helper.initialAlbums.length)
  })

  // get one
  test('succeeds view a specific album', async () => {
    const atStart = await helper.allInCollection(Album)

    const albumToSee = atStart[0]

    const result = await api
      .get(`/api/albums/${albumToSee.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual(albumToSee)
  })
})

//****************** fails ************************************/
// status code 404
describe('if category does not exist', () => {

  test('fails with statuscode 404', async () => {
    const validNonexistingId = await helper.nonExistingId(Album)

    await api
      .get(`/api/albums/${validNonexistingId}`)
      .expect(404)
  })
})
// status code 400
describe('if id is invalid', () => {
  test('fails with statuscode 400', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/albums/${invalidId}`)
      .expect(400)
  })
})

// status code 401
describe('unauthorized fails with status 401 at protected routes', () => {

  test('fails add new',  async  () => {
    await api
      .post('/api/albums')
      .send({
        title: 'Album 1'
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails update with valid id',  async  () => {
    const albumsAtStart = await helper.allInCollection(Album)
    const category = albumsAtStart[0]

    await api
      .put(`/api/albums/${category.id}`)
      .send({
        title: 'Album update'
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails delete with valid id',  async  () => {
    const albumsAtStart = await helper.allInCollection(Album)
    const category = albumsAtStart[0]

    await api
      .delete(`/api/albums/${category.id}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})