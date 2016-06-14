var wrapper = require('@pact-foundation/pact-node')

// your provider
var provider = require('../src/index')

describe('Pact', function () {

  // ensures the provider is up and running
  before(function (done) {
    provider.listen(9980, done)
  })

  it('should honour Pact with Consumer 1', function (done) {
    // tell the wrapper
    // 1: where it should send requests to
    // 2: where are the pacts located
    // 3: which states he's going to test
    // 4: how to setup the states
    var opts = {
      providerBaseUrl: 'http://localhost:9980',
      pactUrls: [ '/Users/tarcio/dev/projects/pact-melbjs/pacts/projects-tasks.json' ],
      providerStatesUrl: 'http://localhost:9980/providerStates',
      providerStatesSetupUrl: 'http://localhost:9980/providerStatesSetup',
    }

    // if all is well, a green tick will show the end
    // otherwise a large output will display the failure scenarios
    wrapper.verifyPacts(opts)
      .then(done)
      .catch(function (err) {
        done(err)
      })
  })
})
