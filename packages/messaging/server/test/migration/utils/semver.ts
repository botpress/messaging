interface Versions {
  patch: string
  minor: string
  major: string
}
type VersionType = 'patch' | 'minor' | 'major'

export const increment = (version: string, type: VersionType = 'patch'): string => {
  const versions = deconstruct(version)

  up(versions, type)

  return construct(versions)
}

const up = (v: Versions, type: VersionType): void => {
  v[type] = String(Number(v[type]) + 1)

  switch (type) {
    case 'minor':
      v.patch = '0'
      break
    case 'major':
      v.patch = '0'
      v.minor = '0'
      break
    default:
      break
  }
}

export const decrement = (version: string, type: VersionType = 'patch'): string => {
  const versions = deconstruct(version)

  down(versions, type)

  return construct(versions)
}

const down = (v: Versions, type: VersionType): void => {
  const nextTypes: { [type: string]: VersionType } = {
    patch: 'minor',
    minor: 'major'
  }

  if (v[type] === '0') {
    v[type] = '99'

    const nextType = nextTypes[type]
    if (nextType) {
      return down(v, nextType)
    }
  }

  v[type] = String(Number(v[type]) - 1)
}

const deconstruct = (version: string): Versions => {
  const [major, minor, patch] = version.split('.')

  return {
    patch,
    minor,
    major
  }
}
const construct = (versions: Versions) => `${versions.major}.${versions.minor}.${versions.patch}`
