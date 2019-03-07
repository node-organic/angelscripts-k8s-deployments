const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('delete :path', async function (angel) {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let fullRepoPath = await findSkeletonRoot()
    let loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(packagejson.name)
    let dnaCellPath = cellInfo.dnaBranchPath.replace(/\./g, '/')
    let fullPath = path.join(fullRepoPath, 'dna/cells', dnaCellPath, angel.cmdData.path + `.yaml`)
    angel.exec(`kubectl delete -f ${fullPath}`)
  })
}
