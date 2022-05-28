import { Service } from '@botpress/framework'
import _ from 'lodash'
import path from 'path'
import { FileService } from '../files/service'
import { PathService } from '../paths/service'
import { Flow } from './types'

export class FlowService extends Service {
  constructor(private paths: PathService, private files: FileService) {
    super()
  }

  async setup() {}

  async list(): Promise<Flow[]> {
    const paths = await this.paths.listFilesRecursive('flows')
    const flowPaths = paths.filter((x) => this.isFlowFile(x)).sort()

    return Promise.all(flowPaths.map((x) => this.get(x)))
  }

  async get(flowPath: string): Promise<Flow> {
    const flowFile = await this.files.get(flowPath)
    const uiFile = await this.files.get(this.toUiPath(flowPath))

    const nodes = flowFile.nodes.map((node: any) => {
      const uiNode = uiFile.nodes.find((uiNode: any) => uiNode.id === node.id)
      return {
        next: [],
        ...node,
        ...uiNode.position
      }
    })

    return {
      name: path.relative('flows', flowPath),
      location: path.relative('flows', flowPath),
      nodes,
      links: uiFile.links,
      ..._.pick(flowFile, ['version', 'catchAll', 'startNode', 'skillData', 'label', 'description'])
    }
  }

  isFlowFile(path: string) {
    return path.endsWith('.flow.json')
  }

  toUiPath(flowPath: string) {
    return flowPath.replace('.flow.json', '.ui.json')
  }
}
