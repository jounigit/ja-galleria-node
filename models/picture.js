const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const beautifyUnique = require('mongoose-beautiful-unique-validation')

const pictureSchema = new mongoose.Schema({
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
  content: {
    type: String
  },
  image: {
    type: String
  },
  thumb: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

pictureSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// pictureSchema.set('autoIndex', false)
pictureSchema.plugin(beautifyUnique)
pictureSchema.plugin(slug)

module.exports = mongoose.model('Picture', pictureSchema)