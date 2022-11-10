const mongoose = require('mongoose')
const User = require('../user')
const userList = require('./user.json')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  User.create(userList)
    .then(() => {
      console.log('user seeds created!')
      return process.exit()
    })
    .catch(error => console.log(error))
})