const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const pathExists = require('path-exists')
const path = require('path')

module.exports = function (angel) {
  angel.on(/kube (.*)/, async function (angel) {
    const fullRepoPath = await findSkeletonRoot()
    const kubeconfigPath = path.join(fullRepoPath, '.kubeconfig')
    let kubeconfigOption = ''
    if (pathExists(kubeconfigPath)) {
      kubeconfigOption = '--kubeconfig=' + kubeconfigPath
      console.info('using kubeconfig:', kubeconfigPath)
    }
    let cmd = `kubectl ${angel.cmdData[1]} ${kubeconfigOption}`
    console.info('running:', cmd)
    angel.exec(cmd)
  })
}
