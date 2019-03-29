module.exports = async function (angel) {
  require('angelabilities-exec')(angel)
  require('./tasks/apply')(angel)
  require('./tasks/build')(angel)
  require('./tasks/delete')(angel)
  require('./tasks/docker')(angel)
  require('./tasks/logs')(angel)
  require('./tasks/release')(angel)
  require('./tasks/cp')(angel)
}
