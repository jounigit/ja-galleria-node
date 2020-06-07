const express = require('express')
const app = express()

let category = {
  id: 2,
  title: 'Category 2',
  content:
    'Kategorian sisältöä.',
  user: {
    id: 1,
    name: 'User 1',
    email: 'user@example.net',
    email_verified_at: '2019-09-04 15:33:50',
    is_admin: 0,
    created_at: '2019-09-04 15:33:50',
    updated_at: '2019-09-04 15:33:50',
    deleted_at: null
  },
  albums: [
    {
      id: 1,
      user_id: 1,
      category_id: 2,
      title: 'Kuvat 1',
      slug: 'kuvat-1',
      content:
        'Kuvat 1 sisältöä.'
    },
    {
      id: 2,
      user_id: 2,
      category_id: 2,
      title: 'Kuvat 2',
      slug: 'kuvat-2',
      content:
        'Kuvat 2 sisältöä.'
    }
  ]
}

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/category', (req, res) => {
  res.json(category)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
