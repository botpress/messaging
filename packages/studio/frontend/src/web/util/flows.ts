export function copyName(siblings: string[], nameToCopy: string): string {
  const getName = (i: number) => `${nameToCopy}-copy${i > 0 ? `-${i}` : ''}`
  let i = 0,
    name = getName(i)
  while (siblings.includes(name)) {
    name = getName(++i)
  }
  return name
}
