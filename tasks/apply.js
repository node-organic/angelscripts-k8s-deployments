module.exports = function (angel) {
  angel.on('k8s apply', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply',
      'production', 'default')
  })
  angel.on('k8s apply :branchName', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply',
      angel.cmdData.branchName, 'default')
  })
  angel.on('k8s apply :branchName :namespace', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply',
      angel.cmdData.branchName, angel.cmdData.namespace)
  })
  angel.on('k8s fapply', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply --force',
      'production', 'default')
  })
  angel.on('k8s fapply :branchName', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply --force',
      angel.cmdData.branchName, 'default')
  })
  angel.on('k8s fapply :branchName :namespace', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply --force',
      angel.cmdData.branchName, angel.cmdData.namespace)
  })
}
