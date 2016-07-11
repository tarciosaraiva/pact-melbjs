var Pact = require('pact')
var expect = require('chai').expect
var request = require('request-promise')

describe('Pact', function () {

  // this is the response you expect from your Provider
  const EXPECTED_BODY = [
    {id: 1, name: 'Do the laundry', 'done': true},
    {id: 2, name: 'Do the dishes', 'done': false},
    {id: 3, name: 'Do the backyard', 'done': false},
    {id: 4, name: 'Do nothing', 'done': false}
  ]

  var provider

  // the interceptor will forward requests to the mock server
  // var interceptor = new Pact.Interceptor('http://localhost:1234')

  // start a new mock server
  beforeEach(function () {
    // and setup Pact, passing the names of the consumer and provider
    provider = Pact({ consumer: 'Projects', provider: 'Tasks' })
    // tell interceptor to intercept all requests aimed at the URL
    // interceptor.interceptRequestsOn('http://localhost:9980')
  })

  // ensure the interceptor is stopped at the end of your tests
  // so it does not interfere with other tests
  // afterEach(function () {
  //   interceptor.stopIntercepting()
  // })

  context('with a single request', function () {
    beforeEach(function (done) {
      // This is how you create an interaction
      provider.addInteraction({
        state: 'i have project that needs tasks',
        uponReceiving: 'a request for projects',
        withRequest: {
          method: 'get',
          path: '/tasks',
          headers: { 'Accept': 'application/json' }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': Pact.Matchers.somethingLike('application/json') },
          body: EXPECTED_BODY
        }
      }).then(() => done())
    })

    afterEach(function (done) {
      provider.finalize().then(() => done())
    })

    it('successfully writes Pact file', function (done) {
      // and this is how the verification process invokes your request
      // and writes the Pact file if all is well
      // it returns the data of the request so you can do your assertions
      request('http://localhost:9981/projects/1/tasks')
        .then(provider.verify)
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
