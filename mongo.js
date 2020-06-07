const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
`mongodb+srv://jagalleria:${password}@cluster0-g35gx.mongodb.net/jagallery-app?retryWrites=true&w=majority`
//   `mongodb+srv://fullstack:${password}@cluster0-ostce.mongodb.net/test?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const categorySchema = new mongoose.Schema({
  title: String,
  content: String,
  albums: [String]
})

const Category = mongoose.model('Category', categorySchema)

// const category = new Category({
//   title: 'Category 1',
//   content: 'HTML is Easy',
//   albums: ['album 1', 'Album 2']
// })

// category.save().then(result => {
//   console.log('category saved! =', result)
//   mongoose.connection.close()
// })

Category.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})