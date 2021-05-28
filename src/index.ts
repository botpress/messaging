import express from 'express'
import { Api } from './api'
import { App } from './app'
import { Launcher } from './launcher'

const port = process.env.PORT || '3100'
const router = express()

const app = new App()
const api = new Api(app, router)

const launcher = new Launcher(router, port, app, api)
void launcher.launch()
