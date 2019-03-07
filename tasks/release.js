module.exports = function (angel) {
  angel.on('release', async function () {
    let versionBump = 'patch'
    // bump package.json
    await angel.exec(`npm version ${versionBump} --no-git-tag-version`)
    angel.exec([
      `npx angel build`,
      `npx angel apply deployment`
    ].join(' && '))
  })
}
