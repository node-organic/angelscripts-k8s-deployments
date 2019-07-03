module.exports = async function (angel) {
  require('angelabilities-exec')(angel)
  require('./tasks/apply')(angel)
  require('./tasks/delete')(angel)
  require('./tasks/logs')(angel)
  require('./tasks/release')(angel)
  require('./tasks/dna-to-yaml')(angel)
  require('./tasks/changes')(angel)
  process.on('unhandledRejection', (err) => {
    throw err
  })
}
