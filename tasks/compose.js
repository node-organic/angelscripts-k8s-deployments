const path = require('path')

module.exports = function (angel) {
  angel.on('compose', function () {
    let REPO = require('lib/full-repo-path')
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    let cellName = packagejson.name
    let cellPort = 3003 // TODO get it from DNA
    console.log(`version: "3.4"
services:
  ${cellName}:
    image: node:alpine
    volumes:
      - ./:/cells/${cellName}
      - ${REPO}/cells/node_modules:/cells/node_modules
      - ${REPO}/node_modules:/node_modules
      - ${REPO}/dna:/dna
    working_dir: /cells/${cellName}
    ports:
      - "${cellPort}:${cellPort}"
    command: npx nodemon index.js
`)
  })
}
