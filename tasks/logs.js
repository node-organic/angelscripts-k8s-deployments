const path = require('path')
const {exec} = require('child_process')
const chalk = require('chalk')
chalk.enabled = true
chalk.level = 3

const findSkeletonRoot = require('organic-stem-skeleton-find-root')

const colorMap = ['white', 'orange', 'green', 'silver', 'blue', 'yellow']

module.exports = function (angel) {
  angel.on('logs', async function () {
    let packagejson = require(path.join(process.cwd(), 'package.json'))

    let pods = await getPodsForCell(packagejson.name)
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

const getDeploymentSelectorsForCell = function (cellInfo) {
  let deployments = cellInfo.dna.deployment
  if (!Array.isArray(deployments)) deployments = [deployments]

  for (let i = 0; i < deployments.length; i++) {
    if (deployments[i].kind === 'Deployment') {
      return deployments[i].spec.selector.matchLabels
    }
  }
}

const getPodsForCell = async function (cellName) {
  const root = await findSkeletonRoot()
  const loadCellInfo = require(path.join(root, 'cells/node_modules/lib/load-cell-info'))
  const cellInfo = await loadCellInfo(cellName)
  let matchLabelsSelector = getDeploymentSelectorsForCell(cellInfo)
  if (!matchLabelsSelector) throw new Error('failed to find deployment for ' + cellName)
  const labels = []
  for (let key in matchLabelsSelector) {
    labels.push(`-l=${key}=${matchLabelsSelector[key]}`)
  }
  return new Promise((resolve, reject) => {
    let cmd = `kubectl get pods ${labels.join(' ')} --no-headers -o name`
    console.info('get pods matching', labels)
    exec(cmd, function (err, stdout, stderr) {
      if (err) return reject(err)
      resolve(stdout.split('\n').map((value) => {
        return value.replace('pod/', '')
      }).filter(v => v))
    })
  })
}
