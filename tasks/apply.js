module.exports = function (angel) {
  angel.on('apply :path', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply', angel.cmdData.path)
  })
  angel.on('fapply :path', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply --force', angel.cmdData.path)
  })
}
