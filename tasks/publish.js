const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('publish', async function () {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let fullRepoPath = await findSkeletonRoot()
    const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(packagejson.name)
    let registry = cellInfo.dna.registry || ''
    let imageTag = packagejson.name + ':' + packagejson.version
    let cmd = [
      `docker tag ${imageTag} ${registry}/${imageTag}`,
      `docker push ${registry}/${imageTag}`
    ].join(' && ')
    console.log('publishing:', cmd)
    await angel.exec(cmd)
    console.log(`done, pushed ${registry}/${imageTag}`)
  })
}
