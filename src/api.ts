import { Router } from 'express'
import { App } from './app'

export class Api {
  constructor(private app: App, private router: Router) {}

  setup() {
    this.router.get('/', (req, res) => {
      const prop = req.body.prop
      res.send(`This is the messaging server! ${prop}`)
    })
  }
}
