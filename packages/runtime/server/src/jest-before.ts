import { EventEmitter } from 'events'

import { Distro } from './common/getos'

const os = require('os').platform()
const { Debug: _Debug } = require('./debug')

global.DEBUG = _Debug

require('dotenv').config()
if (!process.runtime_env) {
  process.runtime_env = process.env as RuntimeEnvironmentVariables
}

if (!process.BOTPRESS_EVENTS) {
  process.BOTPRESS_EVENTS = new EventEmitter()
}

const distribution =
  os !== 'linux'
    ? {
        os,
        codename: '',
        dist: '',
        release: ''
      }
    : {
        os,
        codename: '',
        dist: 'Alpine Linux', // github checks runs on alpine...
        release: '3.11.6'
      }
process.distro = new Distro(distribution)
