const express = require('express')
const router = express.Router()
const dayjs = require('dayjs')
const Record = require('../../models/record')
const Category = require('../../models/category')
const categorySeed = require('../../models/category')

//homepage
router.get('/', (req, res) => {
  const userId = req.user._id
  const categoryId = req.query.categoryId
  Category.find()
    .lean()
    .then((categoryList) => {
      if (!categoryId) {
        Record.find({ userId })
          .lean()
          .sort({ date: 'desc' })
          .then((records) => {
            let totalAmount = 0
            records = records.map((record, recordIndex) => {
              totalAmount += record.amount
              record.date = dayjs(record.date).format('YYYY-MM-DD')
              record.icon = categoryList.find(category => category._id.toString() === record.categoryId.toString()).icon
              if (recordIndex % 2 === 0) {
                record.background = true
              }
              return record
            })
            totalAmount = totalAmount.toString()
            res.render('index', { records, totalAmount, categoryList })
          })
      } else {
        //根據「類別」篩選支出
        let categoryType = ''
        Promise.all([
          Category.find({_id: categoryId})
            .lean()
            .then((category) => {
              categoryType = category[0].name
            })
        ])
        .then(() => {
          Record.find({ categoryId, userId })
            .lean()
            .sort({ date: 'desc' })
            .then((records) => {
              let totalAmount = 0
              records = records.map((record, recordIndex) => {
                totalAmount += record.amount
                record.date = dayjs(record.date).format('YYYY-MM-DD')
                record.icon = categoryList.find(category => category._id.toString() === record.categoryId.toString()).icon
                if (recordIndex % 2 === 0) {
                  record.background = true
                }
                return record
              })
              totalAmount = totalAmount.toString()
              res.render('index', { records, totalAmount, categoryList, categoryType })
            })
        })
      }
    })
    .catch(error => console.error(error))
})

module.exports = router