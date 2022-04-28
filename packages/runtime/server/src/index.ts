import 'bluebird-global'
import './rewire'

process.IS_STANDALONE = true
process.BOTPRESS_VERSION = '13.0.0'

require('./startup/standalone')
