const semver = require('semver')
const path = require('path')
const fs = require('fs')
const writePrettyJSON = function (filepath, jsonDiff) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, JSON.stringify(jsonDiff, null, 2), (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
module.exports = function (angel) {
  angel.on('release', async function (angel) {
    angel.do('release patch production')
  })
  angel.on('release :versionChange :branchName', async function (angel) {
    let packagejson_path = path.join(process.cwd(), 'package.json')
    let packagejson = require(packagejson_path)
    let versionIdentifier
    let versionChange = angel.cmdData.versionChange
    if (versionChange.startsWith('prerelease-')) {
      versionIdentifier = versionChange.split('prerelease-').pop()
      versionChange = 'prerelease'
    }
    let newVersion = semver.inc(packagejson.version, versionChange, versionIdentifier)
    packagejson.version = newVersion
    await writePrettyJSON(packagejson_path, packagejson)
    await angel.exec([
      packagejson.scripts.build || `npx angel build`,
      packagejson.scripts.publish || `npx angel publish`,
      `git add package.json`,
      `git commit -am '${packagejson.name}-${packagejson.version}'`,
      packagejson.scripts.apply || `npx angel k8s apply ${angel.cmdData.branchName}`,
      `git tag -a ${packagejson.name}-${packagejson.version} -m '${packagejson.name}-${packagejson.version}'`,
      `git push --tags`,
      `git push`
    ].join(' && '))
  })
}
