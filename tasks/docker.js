const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('docker', async function (angel) {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let fullRepoPath = await findSkeletonRoot()
    const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(packagejson.name)
    if (cellInfo.dna.cellKind === 'webcell') {
      console.log(`FROM nginx:latest
EXPOSE 80
COPY ./dist /usr/share/nginx/html
`)
    } else {
      console.log(`FROM node:11.10.1-alpine
RUN apk update && apk upgrade && \
  apk add --no-cache bash git openssh
COPY ${cellInfo.dna.cwd}/package*.json ${cellInfo.dna.cwd}/
RUN cd ${cellInfo.dna.cwd} && npm install
COPY cells/node_modules/server/package*.json cells/node_modules/server/
RUN cd cells/node_modules/server && npm install
COPY cells/node_modules/lib/package*.json cells/node_modules/lib/
RUN cd cells/node_modules/lib && npm install
COPY . .
WORKDIR ${cellInfo.dna.cwd}
ENV CELL_MODE _production
ENV NODE_ENV production
CMD ["node", "index.js"]`)
    }
  })
}
