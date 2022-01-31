import { SlackChoicesRenderer } from './choices'
import { SlackImageRenderer } from './image'
import { SlackTextRenderer } from './text'

export const SlackRenderers = [new SlackTextRenderer(), new SlackImageRenderer(), new SlackChoicesRenderer()]
