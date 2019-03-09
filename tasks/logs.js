const path = require('path')

module.exports = function (angel) {
  angel.on('logs', function () {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    angel.exec(`kubectl logs -l app=${packagejson.name}`)
  })
}
