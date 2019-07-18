const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

const updateContainerImage = function (branch, cellName, imageValue) {
  let branches = Array.isArray(branch) ? branch : [ branch ]
  let set = false
  for (let branch of branches) {
    if (branch.kind === 'Deployment') {
      let containers = branch.spec.template.spec.containers
      for (let container of containers) {
        if (container.name === cellName && !container.image) {
          container.image = imageValue
          set = true
          return branch
        }
      }
    }
  }
  if (!set) throw new Error('failed to find cell container with name ' + cellName)
}

module.exports = async function (input) {
  const packagejson = require(path.join(process.cwd(), 'package.json'))
  let fullRepoPath = await findSkeletonRoot()
  const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
  let cellInfo = await loadCellInfo(packagejson.name)
  const YAML = require('json-to-pretty-yaml')
  const {selectBranch} = require('organic-dna-branches')
  const loadRootDNA = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-root-dna'))
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
