const { exec } = require('child_process')
const path = require('path')
const semver = require('semver')
const dependencyTree = require('dependency-tree')
const uniq = require('lodash.uniq')
const resolveModule = require('resolve')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const fg = require('fast-glob')
const {forEachSeries} = require('p-iteration')

module.exports = function (angel) {
  angel.on('changes', async function () {
    let packagejson_path = path.join(process.cwd(), 'package.json')
    let packagejson = require(packagejson_path)
    // check/get last release commit
    let lastReleaseCommit = await getLastReleaseCommit(packagejson.name)
    if (!lastReleaseCommit) {
      console.log('not released')
      return process.exit(1)
    }
    // check local files
    let REPO = await findSkeletonRoot()
    let cwd = process.cwd().replace(REPO + '/', '')
    let cmd = `git diff --name-only ${lastReleaseCommit} | grep ${cwd}`
    let changedFiles = (await execAndReturnOutput(cmd)).split('\n').filter(v => v)
    if (changedFiles.length !== 0) {
      console.log(changedFiles.join('\n'))
      return process.exit(1)
    }

    // get all changed files
    let cmdAll = `git diff --name-only ${lastReleaseCommit}`
    let changedFilesAll = (await execAndReturnOutput(cmdAll)).split('\n').filter(v => v)
    if (changedFilesAll.length === 0) {
      return
    }
    // query and build all cell dependencies as file locations
    let dependencies = await dependenciesList(packagejson.name, packagejson.sources || [])
    dependencies.push(packagejson_path)

    // match cell deps and all changed files
    // inferring need to for release
    let result = []
    for (let i = 0; i < changedFilesAll.length; i++) {
      for (let k = 0; k < dependencies.length; k++) {
        if (dependencies[k].indexOf(changedFilesAll[i]) !== -1) {
          result.push(changedFilesAll[i])
        }
      }
    }
    console.log(result.join('\n'))
    if (result.length) process.exit(1)
  })

  const execAndReturnOutput = function (cmd) {
    return new Promise((resolve, reject) => {
      let child = exec(cmd, {
        cwd: process.cwd(),
        env: process.env
      })
      let output = ''
      child.stdout.on('data', function (chunk) {
        output += chunk.toString()
      })
      child.on('exit', function () {
        resolve(output)
      })
    })
  }

  const getLastReleaseCommit = async function (cellName) {
    let cmd = `git show-ref --tags | grep ${cellName}`
    let tagCommitPairs = (await execAndReturnOutput(cmd)).split('\n').filter(v => v)
    let highestRelease = null
    let highestReleaseCommit = null
    for (let i = 0; i < tagCommitPairs.length; i++) {
      let parts = tagCommitPairs[i].split(' ')
      let commit = parts[0]
      let iRelease = parts[1].replace('refs/tags/', '').replace(cellName + '-', '')
      if (highestRelease === null || semver.lt(highestRelease, iRelease)) {
        highestRelease = iRelease
        highestReleaseCommit = commit
      }
    }
    return highestReleaseCommit
  }

  const filterNodeModules = function (path) {
    if (path.indexOf('cells/node_modules') !== -1 && path.indexOf('cells/node_modules') === path.lastIndexOf('cells/node_modules')) {
      return true
    }
    return path.indexOf('node_modules') === -1
  }

  const dependenciesList = async function (cellName, sources) {
    let localModules = await getLocalOrganellesPaths(cellName)
    localModules = localModules.concat(await getLocalSources(sources))
    let organelleDeps = []
    localModules.forEach(function (srcFile) {
      organelleDeps = organelleDeps.concat(dependencyTree.toList({
        filename: srcFile,
        directory: process.cwd(),
        filter: filterNodeModules
      }))
    })
    return uniq(organelleDeps)
  }

  const getLocalOrganellesPaths = async function (cellName) {
    let fullRepoPath = await findSkeletonRoot()
    const loadCellInfo = require(path.join(fullRepoPath, 'cells/node_modules/lib/load-cell-info'))
    let cellInfo = await loadCellInfo(cellName)
    let sources = []
    for (let key in cellInfo.dna.build) {
      sources.push(cellInfo.dna.build[key].source)
    }
    return Promise.all(sources.map(async (source) => {
      return resolveModulePath(source)
    }))
  }

  const getLocalSources = async function (packageSources) {
    let files = []
    await forEachSeries(packageSources, async (sourcePattern) => {
      files = files.concat(await fg(sourcePattern))
    })
    return files
  }

  const resolveModulePath = async function (modulepath) {
    let basedir = process.cwd()
    return new Promise((resolve, reject) => {
      resolveModule(modulepath, {
        basedir: basedir
      }, (err, res) => {
        if (err) return reject(err)
        resolve(res)
      })
    })
  }
}
