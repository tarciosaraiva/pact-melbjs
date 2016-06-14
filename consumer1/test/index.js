var path = require('path')
var Pact = require('pact')
var Interceptor = require('pact').Interceptor
var Matcher = require('pact').Matcher
var expect = require('chai').expect
var wrapper = require('@pact-foundation/pact-node')
var request = require('request-promise')

var consumer = require('../src/index')

describe('Pact', function () {
  // when using the wrapper, you will need to tell it where to store the logs
  // make sure you the folders created before hand
  const mockServer = wrapper.createServer({
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
  })

  var interceptor = new Interceptor('http://localhost:1234')

  // this is the response you expect from your Provider
  const EXPECTED_BODY = [
    {id: 1, name: 'Do the laundry', 'done': true},
    {id: 2, name: 'Do the dishes', 'done': false},
    {id: 3, name: 'Do the backyard', 'done': false},
    {id: 4, name: 'Do nothing', 'done': false}
  ]

  var pact

  before(function (done) {
    consumer.listen(9981, done)
  })

  // ensure that there are no more mock servers
  // running once all tests have finished
  after(function () {
    wrapper.removeAllServers()
  })

  // start a new mock server, also setting up Pact
  beforeEach(function (done) {
    mockServer.start().then(function () {
      // in order to use the Verifier, simply pass an object like below
      // it should contain the names of the consumer and provider in normal language
      pact = Pact({ consumer: 'Projects', provider: 'Tasks' })
      interceptor.interceptRequestsOn('http://localhost:9980')
      done()
    })
  })

  // ensure the mock server is stopped and deleted
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
        .willRespondWith(200, { 'Content-Type': Matcher.somethingLike('application/json') }, EXPECTED_BODY)

      // and this is how the verification process invokes your request
      // and writes the Pact file if all is well, returning you the data of the request
      // so you can do your assertions
      pact.verify(requestProjectTasks)
        .then((data) => {
          expect(JSON.parse(data).tasks).to.eql(EXPECTED_BODY)
          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })
})
