const _ = require('lodash')
const nodemailer = require('nodemailer')
const Promise = require('bluebird')

/**
 * @hidden true
 */

const getTransport = async botId => {
  const config = await bp.bots.getBotById(botId)

  if (!config || !config.skillSendEmail || config.skillSendEmail.transportConnectionString === '<<change me>>') {
    throw new Error(
      `You must configure your bot with valid SMTP credentials to send emails. Please see 'bots/botId/bot.config.json'.`
    )
  }

  return config.skillSendEmail.transportConnectionString
}

const extractTextFromPayloads = payloads => {
  const text = _.get(
    payloads.find(p => p.type === 'text'),
    'text',
    ''
  )
  return text.replace('(missing translation) ', '').replace(/([A-Z0-9_ -]+: )/gi, '')
}

const sendEmail = async () => {
  try {
    const transport = await getTransport(event.botId)
    const transporter = nodemailer.createTransport(transport)

    const params = {
      event,
      user: _.get(event, 'state.user', {}),
      session: _.get(event, 'state.session', {}),
      temp: _.get(event, 'state.temp', {}),
      bot: _.get(event, 'state.bot', {})
    }

    const renderedSubject = await bp.cms.renderElement('!' + args.subjectElement, params, event)
    const renderedContent = await bp.cms.renderElement('!' + args.contentElement, params, event)

    const subject = extractTextFromPayloads(renderedSubject)
    const content = extractTextFromPayloads(renderedContent)

    const mailOptions = {
      from: args.fromAddress,
      to: args.toAddress,
      cc: args.ccAddress,
      bcc: args.bccAddress,
      subject: subject,
      text: content,
      html: content
    }

    await Promise.fromCallback(cb => transporter.sendMail(mailOptions, cb))
    event.state.temp.success = true
  } catch (error) {
    event.state.temp.success = false
    event.state.temp.onErrorFlowTo = '#'

    throw error
  }
}

return sendEmail()
