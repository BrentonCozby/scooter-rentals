const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { verifyOneOfRolesMiddleware, to } = require('@utils/index.js')

async function routeHandler(req, res, next) {
  const {accountId} = req.params
  const {selectFields, where, orderBy} = req.query

  let conditions = where || null

  if (accountId) {
    conditions = where || {}
    conditions.accountId = accountId
  }

  const [getErr, accountList] = await to(queries.get({
    selectFields: (selectFields || '').split(','),
    where: conditions,
    orderBy
  }))

  if (getErr) {
    return next(getErr)
  }

  if (accountList.length === 0) {
    return res.status(404).json({message: `No account(s) found`})
  }

  res.json(accountList)
}

module.exports = [
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler
]
