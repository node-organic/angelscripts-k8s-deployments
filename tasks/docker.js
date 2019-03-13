const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('docker', async function (angel) {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let fullRepoPath = await findSkeletonRoot()
    let loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(packagejson.name)
    // TODO: use only production node_modules
    console.log(`FROM node:11.10.1-alpine
COPY . .
WORKDIR ${cellInfo.dna.cwd}
ENV CELL_MODE _production
CMD ["node", "index.js"]`)
  })
}
