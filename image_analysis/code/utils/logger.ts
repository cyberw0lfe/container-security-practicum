const moment = require('moment')
import { appendToFile } from './fileOps'

const timestamp = () => moment().format('MMDDYY hh:mm:ss ')

export const log = (message: any, logFile: string, identifier = '') => {
  const formattedMessage = `${timestamp()}: ${identifier} ${message}`
  appendToFile(`./logs/${logFile}.log`, formattedMessage + '\n')
  console.log(formattedMessage)
}
