import { DirectoryListingOptions, Flow } from 'botpress/sdk'
import _ from 'lodash'
import path from 'path'
import { decodeFolderPath } from '../../common/http'
import { FlowView, NodeView } from '../../common/typings'
import { StudioServices } from '../studio-router'
import { Instance } from '../utils/bpfs'
import { CustomStudioRouter } from '../utils/custom-studio-router'

const FLOW_DIR = 'flows'

const parseFlowNameMiddleware = (req: any, _: any, next: any) => {
  const { flowName } = req.params
  if (flowName) {
    req.params.flowName = decodeFolderPath(flowName)
  }
  next()
}

function toUiPath(flowPath: string) {
  return flowPath.replace(/\.flow\.json$/i, '.ui.json')
}

export class FlowsRouter extends CustomStudioRouter {
  constructor(services: StudioServices) {
    super('Flows', services.logger)
  }

  private async parseFlow(flowPath: string): Promise<Omit<FlowView, 'currentMutex'>> {
    const flow = (await Instance.readFile(path.join(FLOW_DIR, flowPath)).then((buf) =>
      JSON.parse(buf.toString())
    )) as Flow
    const uiEq = await Instance.readFile(path.join(FLOW_DIR, toUiPath(flowPath))).then((buf) =>
      JSON.parse(buf.toString())
    )

    const nodeViews: NodeView[] = flow.nodes.map((n) => {
      const uiNode = uiEq.nodes.find((uiNode: any) => uiNode.id === n.id)
      return {
        next: [],
        ...n,
        ...uiNode.position
      }
    })

    return {
      name: flowPath,
      location: flowPath,
      nodes: nodeViews,
      links: uiEq.links,
      ..._.pick(flow, ['version', 'catchAll', 'startNode', 'skillData', 'label', 'description'])
    }
  }

  setupRoutes() {
    const router = this.router

    router.get(
      '/',
      this.checkTokenHeader,
      this.needPermissions('read', 'bot.flows'),
      this.asyncMiddleware(async (req, res) => {
        const botId = req.params.botId
        const options: DirectoryListingOptions = { excludes: '*.ui.json', sortOrder: { column: 'filePath' } }
        const flowsPath = await Instance.directoryListing(FLOW_DIR, options)
        const flows = await Promise.map(flowsPath, (flowPath) => this.parseFlow(flowPath))
        res.send(flows)
      })
    )

    router.post(
      '/',
      this.checkTokenHeader,
      this.needPermissions('write', 'bot.flows'),
      this.asyncMiddleware(async (req, res) => {
        const { botId } = req.params
        const flow = <FlowView>req.body.flow

        const uiContent = {
          nodes: flow.nodes.map((node) => ({ id: node.id, position: _.pick(node, 'x', 'y') })),
          links: flow.links
        }

        const flowContent = {
          ..._.pick(flow, ['version', 'catchAll', 'startNode', 'skillData', 'label', 'description']),
          nodes: flow.nodes.map((node) => _.omit(node, 'x', 'y', 'lastModified'))
        }

        const flowPath = <string>flow.location
        const uiPath = toUiPath(flowPath)

        await Promise.all([
          Instance.upsertFile(path.join(FLOW_DIR, flowPath), JSON.stringify(flowContent, undefined, 2)),
          Instance.upsertFile(path.join(FLOW_DIR, uiPath), JSON.stringify(uiContent, undefined, 2))
        ])
      })
    )

    this.router.post(
      '/:flowName',
      this.checkTokenHeader,
      this.needPermissions('write', 'bot.flows'),
      parseFlowNameMiddleware,
      this.asyncMiddleware(async (req, res) => {
        const { botId, flowName } = req.params
        const flow = <FlowView>req.body.flow

        if (flow.name && flowName !== flow.name) {
          // rename flow
          const prevPath = path.join(FLOW_DIR, flow.name)
          const newPath = path.join(FLOW_DIR, flowName)
          await Promise.all([
            await Instance.moveFile(prevPath, newPath),
            await Instance.moveFile(toUiPath(prevPath), toUiPath(newPath))
          ])
        } else {
          // update flow content
          const uiContent = {
            nodes: flow.nodes.map((node) => ({ id: node.id, position: _.pick(node, 'x', 'y') })),
            links: flow.links
          }

          const flowContent = {
            ..._.pick(flow, ['version', 'catchAll', 'startNode', 'skillData', 'label', 'description']),
            nodes: flow.nodes.map((node) => _.omit(node, 'x', 'y', 'lastModified'))
          }

          const flowPath = <string>flow.location
          const uiPath = toUiPath(flowPath)

          await Promise.all([
            Instance.upsertFile(path.join(FLOW_DIR, flowPath), JSON.stringify(flowContent, undefined, 2)),
            Instance.upsertFile(path.join(FLOW_DIR, uiPath), JSON.stringify(uiContent, undefined, 2))
          ])

          // TODO notify on flow change to qna & what not
          // using something like await coreActions.notifyFlowChanges(modification)
          return res.sendStatus(200)
        }
      })
    )

    this.router.post(
      '/:flowName/delete',
      this.checkTokenHeader,
      this.needPermissions('write', 'bot.flows'),
      parseFlowNameMiddleware,
      this.asyncMiddleware(async (req, res) => {
        const { botId, flowName } = req.params
        const uiPath = toUiPath(flowName)

        await Promise.all([
          Instance.deleteFile(path.join(FLOW_DIR, flowName)),
          Instance.deleteFile(path.join(FLOW_DIR, uiPath))
        ])

        res.sendStatus(200)
      })
    )
  }
}
