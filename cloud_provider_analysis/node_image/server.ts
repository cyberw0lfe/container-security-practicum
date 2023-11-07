const express = require('express')
const app = express()

app.get('/', (req, res) => {
  console.log('something came in...')
  res.send('Success!')
})

app.get('/secret', (req, res) => {
  console.log('secret found!')
  res.send('Found me!')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is up on ${PORT}`)
})
