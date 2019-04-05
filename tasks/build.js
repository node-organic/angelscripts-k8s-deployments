const path = require('path')
const os = require('os')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('build', async function () {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let fullRepoPath = await findSkeletonRoot()
    const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(packagejson.name)
    let buildDestinationPath = path.join(os.tmpdir(), packagejson.name + packagejson.version + '-' + Math.random())
    console.log(`building into ${buildDestinationPath}`)
    let registry = cellInfo.dna.registry || ''
    let imageTag = packagejson.name + ':' + packagejson.version
    let cmd = ''
    if (cellInfo.dna.cellKind === 'docker') {
      let cmd = [
        `docker build -t ${imageTag} .`
      ].join(' && ')
      console.log('running:', cmd)
      await angel.exec(cmd)
      console.log(`done, pushed to ${registry}/${imageTag}`)
      return
    }
    if (cellInfo.dna.cellKind === 'webcell') {
      cmd = [
        // build assets/js/css into /dist forlder
        `npm run compile`,
        // create dest folder
        `mkdir -p ${buildDestinationPath}`,
        // move cell's code into its appropriate place
        `cp -rL ./dist ${buildDestinationPath}`,
        // inject dockerfile into building container root
        `npx angel docker > ${buildDestinationPath}/Dockerfile`
      ]
    } else {
      cmd = [
        // move cell's code into its appropriate place
        // use angel cp to exclude gitingored files
        `npx angel cp ${cellInfo.dna.cwd} ${buildDestinationPath}/${cellInfo.dna.cwd}`,
        // copy cell common dependencies
        `npx angel cp cells/node_modules/server ${buildDestinationPath}/cells/node_modules/server`,
        // copy cell common dependencies
        `npx angel cp cells/node_modules/lib ${buildDestinationPath}/cells/node_modules/lib`,
        // copy cell dna
        `npx angel cp dna ${buildDestinationPath}/dna`,
        // inject dockerfile into building container root
        `npx angel docker > ${buildDestinationPath}/Dockerfile`
      ]
    }
    cmd = cmd.concat([
      // build the container
      `cd ${buildDestinationPath}`,
      `docker build -t ${imageTag} .`
    ])
    cmd = cmd.join(' && ')
    console.log('running:', cmd)
    await angel.exec(cmd)
    console.log(`done, build ${imageTag}`)
  })
}
