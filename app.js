const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')
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

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

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



app.get('/', (req, res) => {
  Category.find()
  .lean()
  .then((data) => {
    const categoryList = data
    Record.find()
      .lean()
      .sort({ date: 'desc' })
      .then((records) => {
        let totalAmount = 0
        records.forEach(record => {
          totalAmount += record.amount
          record.date = dayjs(record.date).format('YYYY-MM-DD')
          record.icon = categoryList.find(category => category._id.toString() === record.categoryId.toString()).icon
        });
        totalAmount = totalAmount.toString()
        res.render('index', { records, totalAmount })
      }) 


  }) 
  .catch(error => console.error(error)) 
})



app.listen('3000', () => {
  console.log('App is running on http://localhost:3000')
})

