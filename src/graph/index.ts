import madge from 'madge'

export const getDependencyGraphObj = (entry: string, config?: any) => {
  return madge(entry, {
    fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    ...config,
  }).then((res) => res.obj())
}