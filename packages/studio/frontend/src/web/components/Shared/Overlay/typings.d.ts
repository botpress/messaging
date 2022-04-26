export interface OverlayProps {
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}
