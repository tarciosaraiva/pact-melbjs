var express = require('express')
var bodyParser = require('body-parser')
var request = require('request-promise')

var server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server.get('/projects/:id/tasks', function (req, res) {
  var reqOpts = {
    uri: 'http://localhost:9980/tasks',
    headers: { 'Accept': 'application/json' },
    json: true
  }

  request(reqOpts)
    .then(function (tasks) {
      res.json({
        id: req.params.id,
        name: 'Project ' + req.params.id,
        due: '2016-02-11T09:46:56.023Z',
        tasks: tasks
      })
    })
    .catch(function (err) {
      res.status(500).send(err)
    })
})

// server.listen(9981, function () {
//   console.log('listening on 9981')
// })

module.exports = server
