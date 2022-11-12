const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const Record = require('./models/record')
const dayjs = require('dayjs')

// const categoryList = require('./models/seeds/category')



const Category = require('./models/category')
const User = require('./models/user');
const record = require('./models/record');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

//home page
app.get('/', (req, res) => {
  const categoryId = req.query.categoryId
  Category.find()
  .lean()
  .then((data) => {
    const categoryList = data
    if (!categoryId){
      Record.find()
        .lean()
        .sort({ date: 'desc' })
        .then((records) => {
          let totalAmount = 0

          // records.forEach(record => {
          //   totalAmount += record.amount
          //   record.date = dayjs(record.date).format('YYYY-MM-DD')
          //   record.icon = categoryList.find(category => category._id.toString() === record.categoryId.toString()).icon
          // });
          records = records.map((record, recordIndex) => {
            totalAmount += record.amount
            record.date = dayjs(record.date).format('YYYY-MM-DD')
            record.icon = categoryList.find(category => category._id.toString() === record.categoryId.toString()).icon
            if(recordIndex % 2 === 0) {
              record.background = true
            }
            return record
          })


          totalAmount = totalAmount.toString()
          res.render('index', { records, totalAmount, categoryList })
        }) 
    } else {
      // sort function
      let categoryType =''
      Record.find({ categoryId })
        .lean()
        .sort({ date: 'desc' })
        .then((records) => {
          let totalAmount = 0
          // records.forEach((record, recordIndex) => {
          //   totalAmount += record.amount
          //   record.date = dayjs(record.date).format('YYYY-MM-DD')
          //   record.icon = categoryList.find(category => category._id.toString() === record.categoryId.toString()).icon
          //   categoryType = categoryList.find(category => category._id.toString() === record.categoryId.toString()).name
          // });

          records = records.map((record, recordIndex) => {
            totalAmount += record.amount
            record.date = dayjs(record.date).format('YYYY-MM-DD')
            record.icon = categoryList.find(category => category._id.toString() === record.categoryId.toString()).icon
            categoryType = categoryList.find(category => category._id.toString() === record.categoryId.toString()).name
            if (recordIndex % 2 === 0) {
              record.background = true
            }
            return record
          })
          totalAmount = totalAmount.toString()
          res.render('index', { records, totalAmount, categoryList, categoryType})
        }) 
    }
  }) 
  .catch(error => console.error(error)) 
})


app.get('/records/new', (req, res) => {
  Category.find()
    .lean()
    .then((data) => {   
      const categoryList = data    
      return res.render('new', { categoryList })
    })
})


//要再改userId的設定
app.post('/records', (req, res) => {
  const newRecord = req.body
  newRecord.userId = "636e7dd337bf29d3eea1c3f8"
  Record.create(newRecord)
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

//進到修改頁面
app.get('/records/:id/edit', (req, res) => {
  // const userId = req.user._id
  const userId = "636e7dd337bf29d3eea1c3f8"
  const _id = req.params.id
  let categoryType = ''
  let categoryList = []
  return Promise.all([
    Record.findOne({ _id, userId }).lean(),
    Category.find().lean()
  ])
    .then(([record, categoryListData]) => {
      record.date = dayjs(record.date).format('YYYY-MM-DD')
      categoryListData.forEach((category) => {
        if (category._id.toString() !== record.categoryId.toString()){
          categoryList.push(category)
        } else {
          categoryType = category.name
        }
      })
      return res.render('edit', { record, categoryList, categoryType })
    })
    .catch(error => console.log(error))
})



//修改功能
app.put('/records/:id', (req, res) => {
  const _id = req.params.id
  const { name, date, categoryId, amount } = req.body
  // const userId = req.user._id 先用下面的
  const userId = "636e7dd337bf29d3eea1c3f8"

  Record.findByIdAndUpdate({ _id, userId }, { name, date, categoryId, amount })
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

app.delete('/records/:id', (req, res) => {
  const id = req.params.id
  const userId = "636e7dd337bf29d3eea1c3f8"
  // return Record.findOne(id, userId)
  return Record.findById(id)
    .then(record => record.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})



// users
app.get('/login', (req, res) => {
  res.render('login')
})






app.listen('3000', () => {
  console.log('App is running on http://localhost:3000')
})

