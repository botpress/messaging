import { FlowView, NodeView } from 'common/typings'
import _ from 'lodash'
import { DefaultLinkModel, DiagramEngine, DiagramModel, DiagramWidget, PointModel } from 'storm-react-diagrams'
import { hashCode } from '~/util'
import { ZOOM_MIN, ZOOM_MAX, ZOOM_SPEED_SCALAR, ZOOM_IN_OUT_AMT, DIAGRAM_PADDING } from './constants'

import { FlowNode } from './debugger'
import { BlockModel } from './nodes/Block'

interface NodeProblem {
  nodeName: string
  missingPorts: any
}

type ExtendedDiagramModel = {
  linksHash?: number
} & DiagramModel

const passThroughNodeProps: string[] = [
  'name',
  'onEnter',
  'onReceive',
  'next',
  'skill',
  'conditions',
  'type',
  'content',
  'activeWorkflow'
]

// Must be identified by the deleteSelectedElement logic to know it needs to delete something
export const nodeTypes = ['standard', 'trigger', 'skill-call', 'say_something', 'execute', 'listen', 'router', 'action']

// Default transition applied for new nodes 1.5
export const defaultTransition = { condition: 'true', node: '' }

export interface Point {
  x: number
  y: number
}

const createNodeModel = (node, modelProps) => {
  return new BlockModel(modelProps)
}

export class DiagramManager {
  private diagramEngine: DiagramEngine
  private activeModel: ExtendedDiagramModel
  private diagramWidget: DiagramWidget
  private diagramWidgetEl: HTMLDivElement
  private highlightedNodes?: FlowNode[] = []
  private highlightedLinks?: string[] = []
  private highlightFilter?: string
  private currentFlow: FlowView
  private isReadOnly: boolean
  private storeDispatch
  private zoomLevelFloat: number

  constructor(engine, storeActions) {
    this.diagramEngine = engine
    this.storeDispatch = storeActions
  }

  initializeModel() {
    this.activeModel = new DiagramModel()
    this.activeModel.setGridSize(5)
    this.activeModel.linksHash = null
    this.activeModel.setLocked(this.isReadOnly)

    const currentFlow = this.currentFlow
    if (!currentFlow) {
      return
    }

    const nodes = this.getBlockModelFromFlow(currentFlow)
    this.activeModel.addListener({ zoomUpdated: (e) => this.storeDispatch.zoomToLevel?.(Math.floor(e.zoom)) })

    this.activeModel.addAll(...nodes)
    nodes.forEach((node) => this._createNodeLinks(node, nodes, this.currentFlow.links))

    this.diagramEngine.setDiagramModel(this.activeModel)

    // defer initial center & zoom because
    // we need one paint to know node sizes
    setTimeout(this.zoomToFit.bind(this), 0)
    // Setting the initial links hash when changing flow
    this.getLinksRequiringUpdate()
    this.highlightLinkedNodes()
  }

  /** Sets the internal zoom level, and returns a "safe" zoom level */
  setZoomLevelFloat = (delta: number) => {
    const zoom = Math.min(
      Math.max((this.zoomLevelFloat || this.activeModel.getZoomLevel()) + delta, ZOOM_MIN),
      ZOOM_MAX
    )
    const safeZoom = Math.round(zoom)
    // Update internal zoom state
    this.zoomLevelFloat = zoom
    return safeZoom
  }

  handleDiagramWheel = (e: WheelEvent) => {
    if (!this.diagramWidget.props.allowCanvasZoom) {
      return
    }
    e.preventDefault()
    e.stopImmediatePropagation()
    const previousZoom = this.activeModel.getZoomLevel()

    const delta = (this.diagramWidget.props.inverseZoom ? -e.deltaY : e.deltaY) / ZOOM_SPEED_SCALAR
    const currentZoom = this.setZoomLevelFloat(delta)

    if (previousZoom !== currentZoom) {
      this.activeModel.setZoomLevel(currentZoom)

      // Recenter
      const { left, top } = this.diagramWidgetEl.getBoundingClientRect()
      this.centerDiagramAfterZoom(previousZoom, currentZoom, { x: e.clientX - left, y: e.clientY - top })
    }
  }

  centerDiagramAfterZoom = (previousZoom: number, currentZoom: number, centerOn?: { x: number; y: number }) => {
    const { width, height } = this.diagramWidgetEl.getBoundingClientRect()
    const previousZoomFactor = previousZoom / 100
    const zoomFactor = currentZoom / 100
    const widthDiff = width * zoomFactor - width * previousZoomFactor
    const heightDiff = height * zoomFactor - height * previousZoomFactor

    const center = centerOn || { x: width / 2, y: height / 2 }

    const xFactor = (center.x - this.activeModel.getOffsetX()) / previousZoomFactor / width
    const yFactor = (center.y - this.activeModel.getOffsetY()) / previousZoomFactor / height
    this.activeModel.setOffset(
      this.activeModel.getOffsetX() - widthDiff * xFactor,
      this.activeModel.getOffsetY() - heightDiff * yFactor
    )
    this.diagramEngine.enableRepaintEntities([])
    this.diagramWidget.forceUpdate()
  }

  zoomIn = () => {
    const previousZoom = this.activeModel.getZoomLevel()
    const currentZoom = this.setZoomLevelFloat(ZOOM_IN_OUT_AMT)
    if (previousZoom !== currentZoom) {
      this.activeModel.setZoomLevel(currentZoom)
      this.centerDiagramAfterZoom(previousZoom, currentZoom)
    }
  }

  zoomOut = () => {
    const previousZoom = this.activeModel.getZoomLevel()
    const currentZoom = this.setZoomLevelFloat(-ZOOM_IN_OUT_AMT)
    if (previousZoom !== currentZoom) {
      this.activeModel.setZoomLevel(currentZoom)
      this.centerDiagramAfterZoom(previousZoom, currentZoom)
    }
  }

  zoomToLevel = (zoom: number) => {
    const previousZoom = this.activeModel.getZoomLevel()
    const currentZoom = this.setZoomLevelFloat(zoom - previousZoom)
    if (previousZoom !== currentZoom) {
      this.activeModel.setZoomLevel(currentZoom)
      this.centerDiagramAfterZoom(previousZoom, currentZoom)
    }
  }

  getBlockModelFromFlow(flow: FlowView) {
    return flow.nodes.map((node: NodeView) => {
      node.x = _.round(node.x)
      node.y = _.round(node.y)

      return createNodeModel(node, {
        ...node,
        isStartNode: flow.startNode === node.name,
        isHighlighted: this.shouldHighlightNode(node)
      })
    })
  }

  shouldHighlightNode(node: NodeView): boolean {
    const queryParams = new URLSearchParams(window.location.search)

    if (this.highlightFilter?.length <= 1 && !this.highlightedNodes.length) {
      return false
    } else if (queryParams.get('highlightedNode') === node.id || queryParams.get('highlightedNode') === node.name) {
      return true
    }

    const matchNodeName = !!this.highlightedNodes?.find(
      (x) => x.flow === this.currentFlow?.name && node.name?.includes(x.node)
    )

    let matchCorpus
    if (this.highlightFilter) {
      const corpus = [node.name, node.id, JSON.stringify(node.content || {})].join('__').toLowerCase()

      matchCorpus = corpus.includes(this.highlightFilter.toLowerCase())
    }

    return matchNodeName || matchCorpus
  }

  shouldHighlightLink(linkId: string) {
    return this.highlightedLinks.includes(linkId)
  }

  // Syncs model with the store (only update changes instead of complete initialization)
  syncModel() {
    if (!this.activeModel) {
      return this.initializeModel()
    }

    // Don't serialize more than once
    const snapshot = _.once(this._serialize)

    // Remove nodes that have been deleted
    _.keys(this.activeModel.getNodes()).forEach((nodeId) => {
      if (!_.find(this.currentFlow.nodes, { id: nodeId })) {
        this._deleteNode(nodeId)
      }
    })

    this.currentFlow &&
      this.currentFlow.nodes.forEach((node: NodeView) => {
        const model = this.activeModel.getNode(node.id) as BlockModel
        if (!model) {
          // Node doesn't exist
          this._addNode(node)
        } else if (model.lastModified !== node.lastModified) {
          // Node has been modified
          this._syncNode(node, model, snapshot())
          // TODO: Implement this correctly.
          // Fixes an issue where links are at position 0,0 after adding a transition)
          this.diagramEngine['flowBuilder'].checkForLinksUpdate()
        } else {
          // @ts-ignore
          model.setData({
            ..._.pick(node, passThroughNodeProps),
            isStartNode: this.currentFlow.startNode === node.name,
            isHighlighted: this.shouldHighlightNode(node)
          })
        }
      })

    this.cleanPortLinks()
    this.activeModel.setLocked(this.isReadOnly)
    this.diagramWidget.forceUpdate()

    this.highlightLinkedNodes()
  }

  clearModel() {
    this.activeModel = new DiagramModel()
    this.activeModel.setGridSize(5)
    this.activeModel.linksHash = null
    this.activeModel.setLocked(this.isReadOnly)

    this.diagramEngine.setDiagramModel(this.activeModel)
    this.diagramWidget && this.diagramWidget.forceUpdate()
  }

  disconnectPorts(model: any) {
    const ports = model.getPorts()

    Object.keys(ports).forEach((p) => {
      _.values(ports[p].links).forEach((link) => {
        this.activeModel.removeLink(link)
        ports[p].removeLink(link)
      })
    })
  }

  highlightLinkedNodes() {
    this.highlightedLinks = []

    const nodeNames = this.highlightedNodes.filter((x) => x.flow === this.currentFlow?.name).map((x) => x.node)
    if (!nodeNames) {
      return
    }

    const links = _.values(this.activeModel.getLinks())
    links.forEach((link) => {
      const outPort = link.getSourcePort().name.startsWith('out') ? link.getSourcePort() : link.getTargetPort()
      const targetPort = link.getSourcePort().name.startsWith('out') ? link.getTargetPort() : link.getSourcePort()

      const output = outPort?.getParent()['name']
      const input = targetPort?.getParent()['name']

      if (nodeNames.includes(output) && nodeNames.includes(input)) {
        this.highlightedLinks.push(link.getID())
      }
    })

    this.diagramWidget.forceUpdate()
  }

  sanitizeLinks() {
    // Sanitizing the links, making sure that:
    // 1) All links are connected to ONE [out] and [in] port
    // 2) All ports have only ONE outbound link
    const links = _.values(this.activeModel.getLinks())
    links.forEach((link) => {
      // If there's not two ports attached to the link
      if (!link.getSourcePort() || !link.getTargetPort()) {
        link.remove()
        return this.diagramWidget.forceUpdate()
      }

      // We need at least one input port
      if (link.getSourcePort().name !== 'in' && link.getTargetPort().name !== 'in') {
        link.remove()
        return this.diagramWidget.forceUpdate()
      }

      // We need at least one output port
      if (!link.getSourcePort().name.startsWith('out') && !link.getTargetPort().name.startsWith('out')) {
        link.remove()
        return this.diagramWidget.forceUpdate()
      }

      // If ports have more than one output link
      const ports = [link.getSourcePort(), link.getTargetPort()]
      ports.forEach((port) => {
        if (!port) {
          return
        }
        const portLinks = _.values(port.getLinks())
        if (port.name.startsWith('out') && portLinks.length > 1) {
          _.last(portLinks).remove()
          this.diagramWidget.forceUpdate()
        }
      })

      // We don't want to link node to itself
      const outPort = link.getSourcePort().name.startsWith('out') ? link.getSourcePort() : link.getTargetPort()
      const targetPort = link.getSourcePort().name.startsWith('out') ? link.getTargetPort() : link.getSourcePort()
      if (outPort.getParent().getID() === targetPort.getParent().getID()) {
        link.remove()
        return this.diagramWidget.forceUpdate()
      }
    })
  }

  getRealPosition(event): Point {
    let { x, y } = this.diagramEngine.getRelativePoint(event.x || event.clientX, event.y || event.clientY)

    const zoomFactor = this.activeModel.getZoomLevel() / 100

    x /= zoomFactor
    y /= zoomFactor

    x -= this.activeModel.getOffsetX() / zoomFactor
    y -= this.activeModel.getOffsetY() / zoomFactor

    return { x, y }
  }

  cleanPortLinks() {
    const allLinkIds = _.values(this.activeModel.getLinks()).map((x) => x.getID())

    // Loops through all nodes to extract all their ports
    const allPorts = _.flatten(
      _.values(this.activeModel.getNodes())
        .map((x) => x.ports)
        .map(_.values)
    )

    // For each ports, if it has an invalid link, it will be removed
    allPorts.map((port) =>
      Object.keys(port.links)
        .filter((x) => !allLinkIds.includes(x))
        .map((x) => port.links[x].remove())
    )
  }

  getLinksRequiringUpdate() {
    this.cleanPortLinks()
    const newLinks = this._serializeLinks()
    const newLinksHash = hashCode(JSON.stringify(newLinks))

    if (!this.activeModel.linksHash || this.activeModel.linksHash !== newLinksHash) {
      this.activeModel.linksHash = newLinksHash
      return newLinks
    }
  }

  getActiveModelOffset(): { offsetX: number; offsetY: number } {
    return { offsetX: this.activeModel.offsetX, offsetY: this.activeModel.offsetY }
  }

  setCurrentFlow(currentFlow: FlowView) {
    this.currentFlow = currentFlow
  }

  setHighlightFilter(filter?: string) {
    this.highlightFilter = filter
  }

  setHighlightedNodes(nodes?: FlowNode[]) {
    this.highlightedNodes = nodes ?? []
  }

  setReadOnly(readOnly: boolean) {
    this.isReadOnly = readOnly
  }

  setDiagramContainer(diagramWidget, diagramWidgetEl) {
    this.diagramWidget = diagramWidget
    this.diagramWidgetEl = diagramWidgetEl
  }

  getSelectedNode() {
    return _.first(this.activeModel.getSelectedItems() || [])
  }

  unselectAllElements() {
    this.activeModel.getSelectedItems().map((x) => x.setSelected(false))
  }

  getNodeProblems(): NodeProblem[] {
    const nodes = this.activeModel.getNodes()
    return Object.keys(nodes)
      .map((node) => ({
        nodeName: (nodes[node] as BlockModel).name,
        missingPorts: (nodes[node] as BlockModel).next.filter((n) => n.node === '').length
      }))
      .filter((x) => x.missingPorts > 0)
  }

  private _deleteNode(nodeId: string) {
    const ports = this.activeModel.getNode(nodeId).getPorts()
    this.activeModel.removeNode(nodeId)

    _.values(ports).forEach((port) => {
      _.values(port.getLinks()).forEach((link) => {
        this.activeModel.removeLink(link)
      })
    })
  }

  private _addNode(node: NodeView) {
    const model = createNodeModel(node, {
      ...node,
      isStartNode: this.currentFlow.startNode === node.name,
      isHighlighted: this.shouldHighlightNode(node)
    })

    this.activeModel.addNode(model)
    // Select newly inserted nodes
    this.storeDispatch.switchFlowNode(node.id)
    model.setSelected(true)

    // Open Node Properties
    setTimeout(() => {
      // Call again to make sure that the correct node is selected
      this.storeDispatch.switchFlowNode(node.id)
      this.storeDispatch.openFlowNodeProps()
    }, 150)

    model.lastModified = node.lastModified
  }

  private _syncNode(node: NodeView, model: BlockModel, snapshot) {
    // @ts-ignore
    model.setData({
      ..._.pick(node, passThroughNodeProps),
      isStartNode: this.currentFlow.startNode === node.name,
      isHighlighted: this.shouldHighlightNode(node)
    })

    model.setPosition(node.x, node.y)

    const ports = model.getOutPorts()
    ports.forEach((port) => {
      _.values(port.links).forEach((link) => {
        this.activeModel.removeLink(link)
        port.removeLink(link)
      })
    })

    // Recreate all the links
    // If there's an existing link saved for target,port .. reuse the point locations

    const allNodes = _.values(this.activeModel.getNodes())
    this._createNodeLinks(model, allNodes, snapshot.links)
    model.lastModified = node.lastModified
  }

  private _createNodeLinks(node, allNodes, existingLinks = []) {
    if (!_.isArray(node.next)) {
      return
    }

    node.next.forEach((next, index) => {
      const target = next.node
      if (/^END$/i.test(target)) {
        // Handle end connection
      } else if (/\.flow/i.test(target)) {
        // Handle subflow connection
      } else {
        const sourcePort = node.ports[`out${index}`]
        const targetNode = _.find(allNodes, { name: next.node })

        if (!targetNode) {
          // TODO Show warning that target node doesn't exist
          return
        }

        const existingLink = _.find(existingLinks, {
          source: node.id,
          target: targetNode.id,
          sourcePort: sourcePort.name
        })

        const targetPort = targetNode.ports['in']

        const link = new DefaultLinkModel()
        link.setSourcePort(sourcePort)
        link.setTargetPort(targetPort)

        if (existingLink) {
          link.setPoints(
            existingLink.points.map((pt) => {
              return new PointModel(link, { x: pt.x, y: pt.y })
            })
          )
        }

        this.activeModel.addLink(link)
      }
    })
  }

  zoomToFit() {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    for (const node of this.getBlockModelFromFlow(this.currentFlow)) {
      const el = document.querySelector(`[data-nodeid="${node.id}"]`) as HTMLElement
      if (!el) {
        continue
      }
      if (node.x < minX) {
        minX = node.x
      }
      if (node.y < minY) {
        minY = node.y
      }
      if (node.x + el.offsetWidth > maxX) {
        maxX = node.x + el.offsetWidth
      }
      if (node.y + el.offsetHeight > maxY) {
        maxY = node.y + el.offsetHeight
      }
    }

    let { width, height } = this.diagramWidgetEl.getBoundingClientRect()
    width = width - 2 * DIAGRAM_PADDING
    height = height - 2 * DIAGRAM_PADDING
    const containerAspectRatio = height / width

    const totalFlowWidth = maxX - minX
    const totalFlowHeight = maxY - minY
    const graphAspectRatio = totalFlowHeight / totalFlowWidth

    const prevZoom = this.activeModel.getZoomLevel()
    const toZoom = 100 * (containerAspectRatio <= graphAspectRatio ? height / totalFlowHeight : width / totalFlowWidth)
    const safeZoom = this.setZoomLevelFloat(toZoom - prevZoom)
    const offsetX = -minX * (safeZoom / 100) + (width - totalFlowWidth * (safeZoom / 100)) / 2 + DIAGRAM_PADDING
    const offsetY = -minY * (safeZoom / 100) + (height - totalFlowHeight * (safeZoom / 100)) / 2 + DIAGRAM_PADDING

    this.activeModel.setZoomLevel(safeZoom)
    this.activeModel.setOffsetX(offsetX)
    this.activeModel.setOffsetY(offsetY)
    this.diagramWidget.forceUpdate()
  }

  private _serialize = () => {
    const model = this.activeModel.serializeDiagram()
    const nodes = model.nodes.map((node: any) => {
      return {
        ..._.pick(node, 'id', 'name', 'onEnter', 'onReceive'),
        next: node.next.map((next, index) => {
          const port = _.find(node.ports, { name: `out${index}` })

          if (!port || !port.links || !port.links.length) {
            return next
          }

          const link = _.find(model.links, { id: port.links[0] })
          // @ts-ignore
          const otherNodeId = link && (link.source === node.id ? link.target : link.source)
          const otherNode = _.find(model.nodes, { id: otherNodeId })

          if (!otherNode) {
            return next
          }

          return { condition: next.condition, node: otherNode['name'] }
        }),
        position: _.pick(node, 'x', 'y')
      }
    })

    const links = this._serializeLinks()

    return { links, nodes }
  }

  private _serializeLinks() {
    const diagram = this.activeModel.serializeDiagram()

    const links = diagram.links.map((link) => {
      const instance = this.activeModel.getLink(link.id)
      const model = {
        source: link.source,
        sourcePort: instance.getSourcePort().name,
        target: link.target,
        points: link.points.map((pt) => ({ x: Math.floor(pt.x), y: Math.floor(pt.y) }))
      }

      if (instance.getSourcePort().name === 'in') {
        // We reverse the model so that target is always an input port
        model.source = link.target
        model.sourcePort = instance.getTargetPort()?.name
        model.target = link.source
        model.points = _.reverse(model.points)
      }

      return model
    })

    return _.sortBy(links, ['source', 'target'])
  }
}
