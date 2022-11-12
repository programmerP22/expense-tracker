const express = require('express')
const router = express.Router()
const Record = require('../../models/record')
const Category = require('../../models/category')
const dayjs = require('dayjs')

router.get('/new', (req, res) => {
  Category.find()
    .lean()
    .then((categoryList) => {
      return res.render('new', { categoryList })
    })
})

router.post('/', (req, res) => {
  const userId = req.user._id
  req.body.userId = userId
  Record.create(req.body)
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

//進到修改頁面
router.get('/:id/edit', (req, res) => {
  const userId = req.user._id
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
        if (category._id.toString() !== record.categoryId.toString()) {
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
router.put('/:id', (req, res) => {
  const _id = req.params.id
  const { name, date, categoryId, amount } = req.body
  const userId = req.user._id
  Record.findByIdAndUpdate({ _id, userId }, { name, date, categoryId, amount })
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

router.delete('/:id', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id
  return Record.findOne({ _id, userId })
    .then(record => record.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

module.exports = router