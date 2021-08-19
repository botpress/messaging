import { BoardLinker } from './linker'

new BoardLinker(
  'http://localhost:3100',
  document.getElementById('board-linker')!,
  document.getElementById('webchat')!,
  document.getElementById('board-watcher')!
)
