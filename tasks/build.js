const path = require('path')
const os = require('os')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('build', async function () {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let fullRepoPath = await findSkeletonRoot()
    let loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(packagejson.name)
    let buildDestinationPath = path.join(os.tmpdir(), packagejson.name + packagejson.version + '-' + Math.random())
    console.log(`building into ${buildDestinationPath}`)
    let registry = cellInfo.dna.registry || ''
    let imageTag = packagejson.name + packagejson.version
    let cmd = [
      // create dest building container dir
      `mkdir -p ${buildDestinationPath}/${cellInfo.cwd}`,
      // move cell's code into its appropriate place
      `cp -rL . ${buildDestinationPath}/${cellInfo.cwd}`,
      // inject dockerfile into building container root
      `npx angel docker > ${buildDestinationPath}/Dockerfile`,
      // copy cell common dependencies
      `cp -rL ${fullRepoPath}/cells/node_modules ${buildDestinationPath}/cells/node_modules`,
      // copy cell dna
      `cp -rL ${fullRepoPath}/dna ${buildDestinationPath}/dna`,
      // build the container
      `cd ${buildDestinationPath}`,
      `docker build -t ${packagejson.name}:${packagejson.version} .`,
      `docker tag ${packagejson.name}:${packagejson.version} ${registry}:${imageTag}`,
      `docker push ${registry}:${imageTag}`
    ].join(' && ')
    console.log('running:', cmd)
    await angel.exec(cmd)
    console.log(`done, pushed to ${registry}:${imageTag}`)
  })
}
