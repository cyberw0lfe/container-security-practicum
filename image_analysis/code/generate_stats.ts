import { appendToFile, deleteFile, loadJson } from './utils/fileOps'
import { Cve, Image, ImageMap } from './types'
import { log } from './utils/logger'
import imageScanStats from './utils/generate_stats_init'
import { sortImages, sortCves } from './utils/sortByKey'

const LOG_FILE = 'generate_stats'
const INPUT_PATH = './data/results_merged.json'
const OUTPUT_PATH = './data/final_results/stats_results.json'
const SEVERITIES = ['low', 'medium', 'high', 'critical', 'unspecified']

const logger = message => log(message, LOG_FILE)

// collection of severity averages by image to find mean later
const severityAverages: number[] = []
const fixableSeverityAverages: number[] = []
const unfixableSeverityAverages: number[] = []

// Grab overall severity counts and arrays of images per severity
const processSeverities = (scan: Image) => {
  SEVERITIES.forEach(sev => {
    if (scan.name && scan.severities) {
      const { fix, noFix } = scan.severities[sev]
      fix > 0 &&
        imageScanStats.imagesBySeverity[`${sev}Fixable`].push(scan.name)
      noFix > 0 &&
        imageScanStats.imagesBySeverity[`${sev}Unfixable`].push(scan.name)
      imageScanStats.severityCounts[`${sev}Fixable`] += fix
      imageScanStats.severityCounts[`${sev}Unfixable`] += noFix
    }
  })
}

// Collect map of all CVEs across scans
// Calculate average severity scores
const processVulnMap = (image: Image) => {
  if (image.vulnerabilityMap) {
    const cves = Object.keys(image.vulnerabilityMap)
    let fixableSevTotal = 0
    let unfixableSevTotal = 0
    // process each CVE in the image scan
    cves.forEach(cve => {
      const { severityScore, isFixed } = image.vulnerabilityMap[cve]
      isFixed
        ? (fixableSevTotal += severityScore)
        : (unfixableSevTotal += severityScore)

      cve in imageScanStats.cveStats
        ? (imageScanStats.cveStats[cve].count += 1)
        : (imageScanStats.cveStats[cve] = {
            name: cve,
            score: severityScore,
            count: 1,
            fixed: isFixed,
          })
    })

    const divisor = cves.length === 0 ? 1 : cves.length
    const averageSev = (fixableSevTotal + unfixableSevTotal) / divisor
    const averageFixableSev = fixableSevTotal / divisor
    const averageUnfixableSev = unfixableSevTotal / divisor
    // save totals
    image.averageCveScore = averageSev
    image.averageFixableCveScore = averageFixableSev
    image.averageUnfixableCveScore = averageUnfixableSev
    severityAverages.push(averageSev)
    fixableSeverityAverages.push(averageFixableSev)
    unfixableSeverityAverages.push(averageUnfixableSev)
  }
}

// calculate the average cve severity score across all images
const calculateAverageCveScores = () => {
  imageScanStats.severityAverageAllImages =
    severityAverages.reduce((acc, cur) => acc + cur, 0) /
    severityAverages.length
  imageScanStats.fixableSeverityAverageAllImages =
    fixableSeverityAverages.reduce((acc, cur) => acc + cur, 0) /
    fixableSeverityAverages.length
  imageScanStats.unfixableSeverityAverageAllImages =
    unfixableSeverityAverages.reduce((acc, cur) => acc + cur, 0) /
    unfixableSeverityAverages.length
}

const getImageArray = () =>
  Object.entries(imageScanStats.imageMap).map(([k, v]) => v)

const getCveArray = () =>
  Object.entries(imageScanStats.cveStats).map(([k, v]) => v)

const sortImagesByStats = (imageArray: Image[]) => {
  imageScanStats.byStarCount = sortImages(imageArray, 'starCount')
  imageScanStats.byPullCount = sortImages(imageArray, 'pullCount')
  imageScanStats.byPublishDate = sortImages(imageArray, 'lastUpdated')
  imageScanStats.byAverageCve = sortImages(imageArray, 'averageCveScore')
  imageScanStats.byAverageFixable = sortImages(
    imageArray,
    'averageFixableCveScore',
  )
  imageScanStats.byAverageUnfixable = sortImages(
    imageArray,
    'averageUnfixableCveScore',
  )
}

const sortCvesByStats = (cveArray: Cve[]) => {
  imageScanStats.cvesByCount = sortCves(cveArray, 'count')
  imageScanStats.cvesBySeverity = sortCves(cveArray, 'score')
  imageScanStats.fixedCves = cveArray.filter(v => v.fixed)
  imageScanStats.unfixedCves = cveArray.filter(v => !v.fixed)
}

const printResultsToFiles = () => {
  const files = Object.keys(imageScanStats)
  files.forEach(file => {
    const path = `./data/final_results/${file}.json`
    deleteFile(path)
    appendToFile(path, JSON.stringify(imageScanStats[file]))
  })
}

const main = () => {
  logger('deleting previous output...')
  deleteFile(OUTPUT_PATH)
  logger('loading image scans')
  const imageScans = loadJson(INPUT_PATH)
  if (!imageScans.success) {
    console.log('failed to load images... exiting!')
    process.exit(1)
  }
  imageScanStats.imageMap = imageScans.data as ImageMap

  const images = Object.keys(imageScanStats.imageMap)
  logger('processing severities and vulnerabilities per image..')
  images.forEach((imageName: string) => {
    const image = imageScanStats.imageMap[imageName]
    processSeverities(image)
    processVulnMap(image)
  })

  logger('sorting images by stats...')
  const imageArray: Image[] = getImageArray()
  sortImagesByStats(imageArray)

  logger('sorting CVEs by stats...')
  const cveArray: Cve[] = getCveArray()
  sortCvesByStats(cveArray)

  logger('calculating average cve scores...')
  calculateAverageCveScores()

  logger('writing output to file')
  appendToFile(OUTPUT_PATH, JSON.stringify(imageScanStats))
  printResultsToFiles()
}

main()
