var path = require('path')
var Pact = require('pact')
var expect = require('chai').expect
// var Matcher = require('pact').Matcher
var request = require('request-promise')
var Interceptor = require('pact').Interceptor
var wrapper = require('@pact-foundation/pact-node')

// this is our consumer
var consumer = require('../src/index')

describe('Pact', function () {
  // when using the wrapper, tell it where to store the logs and pacts
  const mockServer = wrapper.createServer({
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
  })

  // the interceptor will forward requests to the mock server
  var interceptor = new Interceptor('http://localhost:1234')

  // this is the response you expect from your Provider
  const EXPECTED_BODY = [
    {id: 1, name: 'Do the laundry', 'done': true},
    {id: 2, name: 'Do the dishes', 'done': false},
    {id: 3, name: 'Do the backyard', 'done': false},
    {id: 4, name: 'Do nothing', 'done': false}
  ]

  var pact

  // start your consumer
  before(function (done) {
    consumer.listen(9981, done)
  })

  // ensure that there are no more mock servers
  // running once all tests have finished
  after(function () {
    wrapper.removeAllServers()
  })

  // start a new mock server
  beforeEach(function (done) {
    mockServer.start().then(function () {
      // and setup Pact, passing the names of the consumer and provider
      pact = Pact({ consumer: 'Projects', provider: 'Tasks' })
      // tell interceptor to intercept all requests aimed at the URL
      interceptor.interceptRequestsOn('http://localhost:9980')
      done()
    })
  })

  // ensure the mock server is stopped and deleted
  // once all tests are completed
  afterEach(function (done) {
    mockServer.delete().then(function () {
      interceptor.stopIntercepting()
      done()
    })
  })

  context('with a single request', function () {
    it('successfully writes Pact file', function (done) {
      // your function that returns a promise
      function requestProjectTasks () {
        return request('http://localhost:9981/projects/1/tasks')
      }

      // This is how you create an interaction
      pact
        .interaction()
        .given('i have project that needs tasks')
        .uponReceiving('a request for projects')
        .withRequest('get', '/tasks', null, { 'Accept': 'application/json' })
        .willRespondWith(200, { 'Content-Type': 'application/json' }, EXPECTED_BODY)
        // .willRespondWith(200, { 'Content-Type': Matcher.somethingLike('application/json') }, EXPECTED_BODY)

      // and this is how the verification process invokes your request
      // and writes the Pact file if all is well
      // it returns the data of the request so you can do your assertions
      pact.verify(requestProjectTasks)
        .then((data) => {
          expect(data).to.not.be.null
          var jsonData = JSON.parse(data)
          expect(jsonData).to.have.property('tasks')
          expect(jsonData.tasks).to.eql(EXPECTED_BODY)
          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })
})
