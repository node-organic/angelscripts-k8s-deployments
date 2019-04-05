const path = require('path')

module.exports = function (angel) {
  angel.on('commit-tag', async function () {
    let packagejson = require(path.join(process.cwd(), 'package.json'))
    await angel.exec([
      `git add package.json`,
      `git commit -am '${packagejson.name}-${packagejson.version}'`,
      `git tag -a ${packagejson.name}-${packagejson.version} -m '${packagejson.name}-${packagejson.version}'`,
      `git push --tags`,
      `git push`
    ].join(' && '))
  })
}
