import express from 'express'
const router = express.Router()

// placeholder
router.get('/showroom', (req, res) => {
  res.redirect('/showroom/1')
})

router.get('/showroom/:id', (req, res) => {
  const id = parseInt(req.params.id)
  res.render('default')
})

export default router
