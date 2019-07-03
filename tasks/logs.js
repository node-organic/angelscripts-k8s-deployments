const path = require('path')
const {exec} = require('child_process')
const chalk = require('chalk')
chalk.enabled = true
chalk.level = 3

const getPodsForCell = require('organic-stem-k8s-get-pods')

const colorMap = ['white', 'orange', 'green', 'silver', 'blue', 'yellow']

module.exports = function (angel) {
  angel.on('logs', async function () {
    let packagejson = require(path.join(process.cwd(), 'package.json'))

    let pods = await getPodsForCell({cellName: packagejson.name})
    pods.forEach(function (pod, podIndex) {
      let cmd = `kubectl logs -f ${pod} --timestamps --since 10m`
      let podColor = colorMap[podIndex]
      console.log(chalk.keyword(podColor)(cmd))
      let child = exec(cmd, {
        cwd: process.cwd(),
        maxBuffer: Infinity,
        env: process.env
      })
      child.stderr.pipe(process.stderr)
      child.stdout.on('data', function (chunk) {
        console.log(chalk.bgKeyword('blue')(podIndex.toString()), chalk.keyword(podColor)(chunk.toString()))
      })
      child.stderr.on('data', function (chunk) {
        console.log(chalk.bgKeyword('blue')(podIndex.toString()), chalk.keyword(podColor)(chunk.toString()))
      })
    })
  })
}
