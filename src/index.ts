import express from 'express'
import { Api } from './api'
import { App } from './app'
import { Launcher } from './launcher'

const port = process.env.PORT || '3100'
const exp = express()

const app = new App(exp)
const api = new Api(app, exp)

const launcher = new Launcher(exp, port, app, api)
void launcher.launch()
