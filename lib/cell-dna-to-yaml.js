const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = async function (input) {
  const packagejson = require(path.join(process.cwd(), 'package.json'))
  let fullRepoPath = await findSkeletonRoot()
  const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
  let cellInfo = await loadCellInfo(packagejson.name)
  const YAML = require('json-to-pretty-yaml')
  const {selectBranch} = require('organic-dna-branches')
  const loadRootDNA = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-root-dna'))
  process.env.CELLVERSION = packagejson.version
  let DNA = await loadRootDNA()
  let dnaBranch = selectBranch(DNA, 'cells.' + cellInfo.dnaBranchPath + '.' + input)
  let yamlContents = ''
  if (Array.isArray(dnaBranch)) {
    yamlContents = dnaBranch.map(YAML.stringify).join('\n---\n')
  } else {
    yamlContents = YAML.stringify(dnaBranch)
  }
  return yamlContents
}
