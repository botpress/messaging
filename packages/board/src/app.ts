import { BoardLinker } from './linker'
import 'regenerator-runtime/runtime'

new BoardLinker(
  document.getElementById('board-linker')!,
  document.getElementById('webchat')!,
  document.getElementById('board-watcher')!
)
