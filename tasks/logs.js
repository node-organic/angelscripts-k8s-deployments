const path = require('path')

module.exports = function (angel) {
  angel.on('logs', function () {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let kubetailScript = path.resolve(__dirname, '../bin/kubetail.sh')
    angel.exec(`/bin/bash ${kubetailScript} --selector app=${packagejson.name} --since 10m --timestamps`)
  })
}
