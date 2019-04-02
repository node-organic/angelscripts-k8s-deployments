module.exports = function (angel) {
  angel.on('dna-to-yaml :path', async function (angel) {
    let contents = await require('../lib/cell-dna-to-yaml')(angel.cmdData.path)
    console.log(contents)
  })
}
