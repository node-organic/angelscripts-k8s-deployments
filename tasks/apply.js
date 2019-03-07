const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('apply :path', async function (angel) {
    const packagejson = require(path.join(process.cwd(), 'package.json'))
    let fullRepoPath = await findSkeletonRoot()
    const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(packagejson.name)
    let dnaCellPath = cellInfo.dnaBranchPath.replace(/\./g, '/')
    let fullPath = path.join(fullRepoPath, 'dna/cells', dnaCellPath, angel.cmdData.path)
    console.log('targeting:', fullPath)
    if (path.extname(fullPath) === '.yaml') {
      angel.exec(`kubectl apply -f ${fullPath}`)
    } else {
      const YAML = require('json-to-pretty-yaml')
      const {selectBranch} = require('organic-dna-branches')
      const loadRootDNA = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-root-dna'))
      process.env.CELLVERSION = packagejson.version
      process.env.CELLNAME = packagejson.name
      process.env.REPOSITORY = cellInfo.dna.registry
      let DNA = await loadRootDNA()
      let deploymentBranch = selectBranch(DNA, 'cells.' + cellInfo.dnaBranchPath + '.deployment')
      let yamlContents = ''
      if (Array.isArray(deploymentBranch)) {
        yamlContents = deploymentBranch.map(YAML.stringify).join('\n---\n')
      } else {
        yamlContents = YAML.stringify(deploymentBranch)
      }
      console.log('YAML', yamlContents)
      let child = angel.exec(`kubectl apply -f -`)
      child.stdin.write(yamlContents)
      child.stdin.end()
    }
  })
}
