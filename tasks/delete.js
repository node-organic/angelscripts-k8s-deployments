module.exports = function (angel) {
  angel.on('k8s delete', async function (angel) {
    angel.do('k8s delete production default')
  })
  angel.on('k8s delete :branchName', async function (angel) {
    angel.do(`k8s delete ${angel.cmdData.branchName} default`)
  })
  angel.on('k8s delete :branchName :namespace', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'delete',
      angel.cmdData.branchName, angel.cmdData.namespace)
  })
}
