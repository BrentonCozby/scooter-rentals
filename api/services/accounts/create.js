const { validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')
const santizeHtml = require('sanitize-html')

async function routeHandler(req, res, next) {
  const {email, password, firstName, lastName, roles} = req.query

  const queryValidation = validateRequiredParams(['email', 'password', 'firstName', 'lastName'], req.query)

  if (!queryValidation.isValid) {
    return res.status(400).json({
      message: 'Missing query parameters',
      queryParamsErrors: queryValidation.messageMap
    })
  }

  let [getErr, account] = await to(queries.get({
    where: { email }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (account && account.length) {
    return res.status(409).json({
      message: `Account already exists with email: ${santizeHtml(email)}.`,
      queryParamsErrors: {
        email: 'Email already exists'
      }
    })
  }

  const [createErr, result] = await to(queries.create({ email, password, firstName, lastName, roles }))

  if (createErr) {
    return next(createErr)
  }

  if (result.rowCount === 0) {
    return next('Account not created.')
  }

  res.json({ message: 'Account created.' })
}

module.exports = [routeHandler]
