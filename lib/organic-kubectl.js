const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const cellDNAtoYAML = require('./cell-dna-to-yaml')

module.exports = async function (angel, kubectlCmd, input, namespace = 'default') {
  const packagejson = require(path.join(process.cwd(), 'package.json'))
  let fullRepoPath = await findSkeletonRoot()
  const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
  let cellInfo = await loadCellInfo(packagejson.name)
  let dnaCellPath = cellInfo.dnaBranchPath.replace(/\./g, '/')
  let fullPath = path.join(fullRepoPath, 'dna/cells', dnaCellPath, input)
  console.log('targeting:', fullPath)
  if (path.extname(fullPath) === '.yaml') {
    angel.exec(`kubectl ${kubectlCmd} -f ${fullPath} --namespace ${namespace}`)
  } else {
    let yamlContents = await cellDNAtoYAML(input)
    let child = angel.exec(`kubectl ${kubectlCmd} --namespace ${namespace} -f -`)
    child.stdin.write(yamlContents)
    child.stdin.end()
  }
}
