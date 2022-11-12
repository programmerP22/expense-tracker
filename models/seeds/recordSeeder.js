const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Category = require('../category')
const User = require('../user')
const userList = require('./user.json')
const Record = require('../record')
const recordList = require('./record.json')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  Promise.all([
    Category.find()
      .lean()
      .then((data) => {
        const categoryData = data
        recordList.forEach(record => {
          record.categoryId = categoryData.find(category => category.name === record.category)._id
        })
      })
    ,
    Promise.all(
    userList.map((user, userIndex) => {
      const { name, email, password, recordIndex } = user
      return User.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
      })
        .then(user => {
          const userRecord = []
          recordList.forEach((record, recordIndex) => {
            if (recordIndex % 2 === userIndex % 2) {
              record.userId = user._id
              userRecord.push(record)
            }
          })
          return Record.create(userRecord)
        })
    })
    )
  ])
  .then(() => {
    console.log('record and user seeds created!')
    process.exit()
  })
  .catch(error => console.log(error))
})