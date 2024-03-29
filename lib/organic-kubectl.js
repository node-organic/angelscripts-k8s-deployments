const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const cellDNAtoYAML = require('./cell-dna-to-yaml')
const pathExists = require('path-exists')
const resolve = require('resolve/sync')

module.exports = async function (angel, kubectlCmd, input, namespace = 'default') {
  const packagejson = require(path.join(process.cwd(), 'package.json'))
  let fullRepoPath = await findSkeletonRoot()
  const libPath = resolve('lib/load-cell-info', {basedir: process.cwd()})
  const loadCellInfo = require(libPath)
  let cellInfo = await loadCellInfo(packagejson.name)
  let dnaCellPath = cellInfo.dnaBranchPath.replace(/\./g, '/')
  let fullPath = path.join(fullRepoPath, 'dna/cells', dnaCellPath, input)
  console.log('targeting:', fullPath)
  let kubeconfigOption = ''
  let kubeconfigPath = path.join(fullRepoPath, '.kubeconfig')
  if (await pathExists(kubeconfigPath)) {
    kubeconfigOption = '--kubeconfig=' + kubeconfigPath
    console.info('using kubeconfig:', kubeconfigPath)
  }
  if (path.extname(fullPath) === '.yaml') {
    angel.exec(`kubectl ${kubectlCmd} -f ${fullPath} --namespace ${namespace} ${kubeconfigOption}`)
  } else {
    let yamlContents = await cellDNAtoYAML(input)
    let child = angel.exec(`kubectl ${kubectlCmd} --namespace ${namespace} ${kubeconfigOption} -f -`)
    child.stdin.write(yamlContents)
    child.stdin.end()
  }
}
