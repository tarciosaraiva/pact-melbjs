var express = require('express')
var bodyParser = require('body-parser')
var request = require('request-promise')

var server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server.get('/projects/:id/tasks', function (req, res) {
  var reqOpts = {
    uri: `${process.env.EP}/tasks`,
    headers: { 'Accept': 'application/json' },
    json: true
  }

  console.log(`**** Triggering request to ${process.env.EP}`)

  request(reqOpts)
    .then(function (tasks) {
      console.log('**** Received response')
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

server.listen(9981, function () {
  console.log(`**** Consumer listening on 9981. Provider: ${process.env.EP}`)
})
