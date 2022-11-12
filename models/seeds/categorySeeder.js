const mongoose = require('mongoose')
const Category = require('../category')
const categoryList = require('./category.json')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  Category.create(categoryList)
    .then(() => {
      console.log('category seeds created!')
      return process.exit()
    })
    .catch(error => console.log(error))
})

