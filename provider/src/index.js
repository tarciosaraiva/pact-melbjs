var express = require('express')
var bodyParser = require('body-parser')

var server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server.get('/tasks', function (req, res) {
  res.json([
    {id: 1, name: 'Do the laundry', 'done': true},
    {id: 2, name: 'Do the dishes', 'done': false},
    {id: 3, name: 'Do the backyard', 'done': false},
    {id: 4, name: 'Do nothing', 'done': false}
  ])
})

server.get('/providerStates', function (req, res) {
  res.json({ 'Projects' : ['i have project that needs tasks'] })
})

server.post('/providerStates', function (req, res) {
  res.sendStatus(201, {})
})

server.listen(9980, function () {
  console.log('listening on 9980')
})

// module.exports = server
