const mongoose = require('mongoose')
const Category = require('../category')
// const categoryList = require('./category.json')
const User = require('../user')
const userList = require('./user.json')
const Record = require('../record')
const recordList = require('./record.json')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

// db.once('open',  () => {
//   Category.find()
//     .lean()
//     .then((data) => {
//       const categoryData = data
//       recordList.forEach(record => {
//         record.categoryId = categoryData.find(category => category.name === record.category)._id 
//       })
//     })
//   .then(() => {
//     Promise.all(
//       userList.map((user, userIndex) => {
//         console.log(user, userIndex)
//         return User.create(user)
//           .then(user => {
//             const userRecord = []
//             recordList.forEach((record, recordIndex) => {
//               if (recordIndex % 2 === userIndex % 2) {
//                 record.userId = user._id
//                 userRecord.push(record)
//               }
//             })
//             return Record.create(userRecord)
//           })
//       })
//     )
//   })
//   .then(() => {
//     console.log('user seeds created!')
//     process.exit()
//   })
//   .catch(error => console.log(error))
// })


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
      return User.create(user)
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
    console.log('user seeds created!')
    process.exit()
  })
  .catch(error => console.log(error))
})