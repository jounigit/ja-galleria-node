/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')
const Album = require('../models/album')
const Category = require('../models/category')

setupDB()

let token

const updateAlbum = async (categoryID, album) => {
  const updated = await api
    .put(`/api/albums/${album.id}`)
    .send({ category: categoryID })
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  console.log('Updated: ', updated.body)
  return updated.body
}

beforeEach( async () => {
  await helper.addTestUser()
  token = await helper.getToken()
  const getA1 = await helper.createDoc('albums', 'album 1', token)
  const getA2 = await helper.createDoc('albums', 'album 2', token)
  const getCat1 = await helper.createDoc('categories', 'category 1', token)
  const getCat2 = await helper.createDoc('categories', 'category 2', token)
  album1 = getA1.body
  album2 = getA2.body
  category1 = getCat1.body
  category2 = getCat2.body
})

//***************** admin succeeds ******************************/
describe('make relation between album and category', () => {

  test('should have album with category', async () => {
    console.log('Cat 1: ', category1)
    const album1Now = await updateAlbum(category1.id, album1)
    expect(category1.id).toEqual(album1Now.category)
  })

  test('should have category with album', async () => {
    const album1Now = await updateAlbum(category1.id, album1)
    const categoryNow = await Category.findById(category1.id)
    expect(album1Now.id).toContain(categoryNow.albums)
  })

  test('should have category with 2 albums', async () => {
    await updateAlbum(category1.id, album1) // add album to category
    await updateAlbum(category1.id, album2) // add album to category
    const atEnd = await Category.findById(category1.id)
    // console.log('End: ', atEnd.albums.length)
    expect(atEnd.albums.length).toBe(category1.albums.length+2)
  })
})

//***************** admin update relation ******************************/
describe('update relation', () => {

  beforeEach( async () => {
    await updateAlbum(category1.id, album1) // add album to category
  })

  test('should have album with new category', async () => {
    const album1Now = await updateAlbum(category2.id, album1)
    await Category.findById(category1.id)
    await Category.findById(category2.id)
    expect(category1.id).not.toEqual(album1Now.category)
    expect(category2.id).toEqual(album1Now.category)
  })

  test('should not have relation with old category', async () => {
    await updateAlbum(category2.id, album1)
    // console.log('Album 1: ',  album1Now)
    const categoryAtEnd = await Category.findById(category1.id)
    // console.log('Category 1: ',  categoryAtEnd)
    expect(categoryAtEnd.albums.length).toBe(0)
  })

})

describe('update duplicate relation', () => {

  beforeEach( async () => {
    await updateAlbum(category1.id, album1) // add album to category
  })

  test('should have no duplicates', async () => {
    await updateAlbum(category1.id, album1)
    const categoryAtEnd = await Category.findById(category1.id)
    // console.log('Category 1: ',  categoryAtEnd)
    expect(categoryAtEnd.albums.length).toBe(1)
  })

})

//***************** admin delete relation ******************************/
describe('delete relation after deleting album or category', () => {

  test('should not have album with category', async () => {
    const album1Start = await updateAlbum(category1.id, album1)

    await api
      .delete(`/api/categories/${category1.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    console.log('CAT 1: ', await Category.findById(category1.id))

    const album1End = await Album.findById(album1.id)
    // console.log('album 1 end: ',  album1End)

    expect(album1End.category).not.toEqual(album1Start.category)
  })

  test('should not have category with album', async () => {
    await await updateAlbum(category1.id, album1)

    await api
      .delete(`/api/albums/${album1.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const categoryNow = await Category.findById(category1.id)
    // console.log('categoryNow: ', categoryNow)

    // await Album.findById(album1.id)
    // console.log('album 1 end: ',  album1End)

    expect(categoryNow.albums.length).toBe(0)
  })
})

