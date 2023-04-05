export const ConditionalWrap = ({
  condition,
  wrap,
  children
}: {
  condition: boolean
  wrap: (children: React.ReactElement) => React.ReactElement
  children: React.ReactElement
}) => (condition ? wrap(children) : children)
