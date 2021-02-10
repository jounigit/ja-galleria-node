/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

let token
let testUser

//********************** succeeds ******************************/

describe('Tests with valid email and password', () => {
  const username = helper.username
  const password = helper.password
  const newUser = 'newuser'
  const newEmail = 'new@mail.com'
  const newPassword = 'newpass'

  beforeEach( async () => {
    testUser = await helper.addTestUser()
  })

  test('should login', async () => {
    const response = await api
      .post('/api/login')
      .send({
        username,
        password,
      })
      .expect(200)

    console.log('Lgged in: ', response.body)
    expect(response.body.user).toBe(username)
  })

  test('should signup new user', async () => {
    const response = await api
      .post('/api/users')
      .send({
        username: newUser,
        email: newEmail,
        password: newPassword
      })
      .expect(200)

    console.log('Lgged in: ', response.body)
    expect(response.body.username).toBe(newUser)
  })

  test('should resign/delete user', async () => {
    token = await helper.getToken()
    console.log('Test user: ', testUser)
    const userId = testUser._id

    await api
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

})




