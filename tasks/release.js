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
    angel.do('release patch')
  })
  angel.on('release :versionChange', async function (angel) {
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
      `git add package.json`,
      `git commit -am '${packagejson.name}-${newVersion}'`,
      `git tag -a ${packagejson.name}-${newVersion} -m '${packagejson.name}-${newVersion}'`,
      `git push --tags`,
      `git push`,
      `npx angel build`,
      `npx angel publish`,
      `npx angel apply deployment`
    ].join(' && '))
  })
}
