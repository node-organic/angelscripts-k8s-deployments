module.exports = function (angel) {
  angel.on('delete :path', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'delete', angel.cmdData.path)
  })
}
