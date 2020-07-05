const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const beautifyUnique = require('mongoose-beautiful-unique-validation')
// mongoose.plugin(slug)

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    slug: 'title',
    slugPaddingSize: 4,
    unique: true
  },
  content: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
})

albumSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// albumSchema.set('autoIndex', false)
albumSchema.plugin(beautifyUnique)
albumSchema.plugin(slug)

module.exports = mongoose.model('Album', albumSchema)