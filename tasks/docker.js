const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('docker', async function (angel) {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let fullRepoPath = await findSkeletonRoot()
    const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(packagejson.name)
    let nodeVersion = '11.10.1'
    if (packagejson.engines && packagejson.engines.node) {
      nodeVersion = packagejson.engines.node
    }
    if (cellInfo.dna.cellKind === 'webcell') {
      console.log(`FROM nginx:latest
EXPOSE 80
COPY ./dist /usr/share/nginx/html
`)
    } else {
      let common_deps = ['server', 'lib']
      if (packagejson.common_dependencies) {
        common_deps = packagejson.common_dependencies
      }
      console.log(`FROM node:${nodeVersion}-alpine
RUN apk update && apk upgrade && \
  apk add --no-cache bash git openssh

${common_deps.map(function (v) {
    return `COPY cells/node_modules/${v}/package*.json cells/node_modules/${v}/
RUN cd cells/node_modules/${v} && npm install --production
`
  }).join('\n')}

COPY ${cellInfo.dna.cwd}/package*.json ${cellInfo.dna.cwd}/
RUN cd ${cellInfo.dna.cwd} && npm install --production

COPY . .

WORKDIR ${cellInfo.dna.cwd}
ENV NODE_ENV production
CMD ["node", "index.js"]`)
    }
  })
}
