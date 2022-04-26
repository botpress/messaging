const jsRange = (str: string) => {
  return str.match(/{{((?!}}).)*}}/gm)
}

export default jsRange
