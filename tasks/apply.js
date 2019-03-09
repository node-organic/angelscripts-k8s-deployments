module.exports = function (angel) {
  angel.on('apply :path', async function (angel) {
    require('../lib/organic-kubectl')(angel, 'apply', angel.cmdData.path)
  })
}
