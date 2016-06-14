var wrapper = require('@pact-foundation/pact-node')

var provider = require('../src/index')

describe('Pact', function () {

  before(function (done) {
    provider.listen(9980, done)
  })

  it('should honour Pact with Consumer 1', function (done) {
    var opts = {
      providerBaseUrl: 'http://localhost:9980',
      pactUrls: [ '/Users/tarcio/dev/projects/pact-melbjs/pacts/projects-tasks.json' ],
      providerStatesUrl: 'http://localhost:9980/providerStates',
      providerStatesSetupUrl: 'http://localhost:9980/providerStatesSetup',
    }

    wrapper.verifyPacts(opts)
      .then(done)
      .catch(function (err) {
        done(err)
      })
  })

})
