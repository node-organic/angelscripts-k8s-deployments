const path = require('path')
const resolve = require('resolve/sync')

const updateContainerImage = function (branch, cellName, imageValue) {
  let branches = Array.isArray(branch) ? branch : [ branch ]
  for (let branch of branches) {
    if (branch.kind === 'Deployment' || branch.kind === 'StatefulSet') {
      let containers = branch.spec.template.spec.containers
      for (let container of containers) {
        if (container.name === cellName && !container.image) {
          container.image = imageValue
        }
      }
    }
  }
}

module.exports = async function (input) {
  const packagejson = require(path.join(process.cwd(), 'package.json'))
  const loadCellInfoPath = resolve('lib/load-cell-info', {basedir: process.cwd()})
  const loadCellInfo = require(loadCellInfoPath)
  let cellInfo = await loadCellInfo(packagejson.name)
  const YAML = require('json-to-pretty-yaml')
  const {selectBranch} = require('organic-dna-branches')
  const loadRootDnaPath = resolve('lib/load-root-dna', {basedir: process.cwd()})
  const loadRootDNA = require(loadRootDnaPath)
  let image = cellInfo.dna.registry + '/' + packagejson.name + ':' + packagejson.version
  let DNA = await loadRootDNA()
  let dnaBranch = selectBranch(DNA, 'cells.' + cellInfo.dnaBranchPath + '.' + input)
  updateContainerImage(dnaBranch, packagejson.name, image)
  let yamlContents = ''
  if (Array.isArray(dnaBranch)) {
    yamlContents = dnaBranch.map(YAML.stringify).join('\n---\n')
  } else {
    yamlContents = YAML.stringify(dnaBranch)
  }
  return yamlContents
}
