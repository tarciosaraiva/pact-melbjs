var path = require('path')
var wrapper = require('@pact-foundation/pact-node')

var mockServer = wrapper.createServer({
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2
})

mockServer.start()
mockServer.on('start', function () {
  run()

  after(() => {
    wrapper.removeAllServers()
  })
})
