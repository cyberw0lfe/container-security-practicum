import { Image, Cve } from '../types'

const getValueForSort = (image: Image, key: string): number => {
  switch (key) {
    case 'lastUpdated':
      return new Date(image.lastUpdated).getTime()
    case 'averageCveScore':
      if (image[key] === undefined) {
        console.log(image.name, ' is undefined for avg cve')
      }
      return image[key]
    default:
      // expecting starCount, pullCount, averageCveScore
      // averageFixableCveScore, averageUnfixableCveScore
      return image[key]
  }
}

const sortImages = (objectArray: Image[], sortKey: string, limit?: number) => {
  const images = [...objectArray].filter(
    v => v.vulnerabilityMap && v[sortKey] !== undefined,
  )
  const length = images.length
  const filteredImages = images.sort(
    (a, b) => getValueForSort(b, sortKey) - getValueForSort(a, sortKey),
  )
  return limit < length ? filteredImages.slice(0, length) : filteredImages
}

const sortCves = (objectArray: Cve[], sortKey: string, limit?: number) => {
  const images = [...objectArray]
  const length = images.length
  const filteredImages = images.sort((a, b) => b[sortKey] - a[sortKey])
  return limit < length ? filteredImages.slice(0, length) : filteredImages
}

export { sortImages, sortCves }
