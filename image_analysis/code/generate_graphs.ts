import { ChartData } from 'chart.js'
import { loadJson } from './utils/fileOps'
import { log } from './utils/logger'
import { Cve, Image, ImageStats, ImagesBySeverity, SeveritySums } from './types'
import generateGraph from './utils/generateGraph'

const LOG_FILE = 'generate_graphs'
const INPUT_PATH = './data/final_results/stats_results.json'

interface ImageGraphData {
  title: string
  data: Image[]
}

interface CveGraphData {
  title: string
  data: Cve[]
}

const logger = message => log(message, LOG_FILE)

const loadInitialData = () => {
  logger('loading scan data')
  const loadedData = loadJson(INPUT_PATH)
  if (!loadedData.success) {
    console.log('failed to load images... exiting!')
    process.exit(1)
  }
  return loadedData.data as ImageStats
}

const selectImageArrays = ({
  byStarCount,
  byPullCount,
  byPublishDate,
  byAverageCve,
  byAverageFixable,
  byAverageUnfixable,
}: ImageStats): ImageGraphData[] => [
  { title: 'Images by Star Count vs Vulnerabilites', data: byStarCount },
  { title: 'Images by Pull Count vs Vulnerabilites', data: byPullCount },
  {
    title: 'Images by Last Publish Date vs Vulnerabilites',
    data: byPublishDate,
  },
  {
    title: 'Images by Average CVE Score vs Vulnerabilites',
    data: byAverageCve,
  },
  {
    title: 'Images by Average Fixable CVE Score vs Vulnerabilites',
    data: byAverageFixable,
  },
  {
    title: 'Images by Average Unfixable CVE Score vs Vulnerabilites',
    data: byAverageUnfixable,
  },
]

const selectCveArrays = ({
  cvesByCount,
  cvesBySeverity,
  fixedCves,
  unfixedCves,
}: ImageStats): CveGraphData[] => [
  { title: 'CVEs by Severity vs Count', data: cvesBySeverity },
  { title: 'Fixed CVEs by Severity vs Count', data: fixedCves },
  { title: 'Unfixed CVEs by Severity vs Count', data: unfixedCves },
]

const prepareImageDataForGraphing = (images: Image[]) => {
  const unF = []
  const unU = []
  const lowF = []
  const lowU = []
  const medF = []
  const medU = []
  const highF = []
  const highU = []
  const critF = []
  const critU = []
  images.forEach(image => {
    const { unspecified, low, medium, high, critical } = image.severities
    unF.push(unspecified.fix)
    unF.push(unspecified.noFix)
    lowF.push(low.fix)
    lowU.push(low.noFix)
    medF.push(medium.fix)
    medU.push(medium.noFix)
    highF.push(high.fix)
    highU.push(high.noFix)
    critF.push(critical.fix)
    critU.push(critical.noFix)
  })
  return { unF, unU, lowF, lowU, medF, medU, highF, highU, critF, critU }
}

const generateImageScanGraphs = (preparedImageData: ImageGraphData[]) => {
  preparedImageData.forEach(imageArray => {
    const title = imageArray.title
    const imageNameLabels = imageArray.data.map(i => i.name)
    const { unF, unU, lowF, lowU, medF, medU, highF, highU, critF, critU } =
      prepareImageDataForGraphing(imageArray.data)

    const data: ChartData<'bar', number[], string> = {
      labels: imageNameLabels,
      datasets: [
        {
          label: 'Unspecified - F',
          data: unF,
          backgroundColor: 'rgba(144, 238, 144, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'Unspecified - U',
          data: unU,
          backgroundColor: 'rgba(124, 252, 0, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'Low - F',
          data: lowF,
          backgroundColor: 'rgba(60, 179, 113, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'Low - U',
          data: lowU,
          backgroundColor: 'rgba(173, 255, 47, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'Medium - F',
          data: medF,
          backgroundColor: 'rgba(255, 255, 0, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'Medium - U',
          data: medU,
          backgroundColor: 'rgba(255, 165, 0, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'High - F',
          data: highF,
          backgroundColor: 'rgba(255, 140, 0, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'High - U',
          data: highU,
          backgroundColor: 'rgba(255, 69, 0, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'Critical - F',
          data: critF,
          backgroundColor: 'rgba(255, 0, 0, 0.8)',
          stack: 'Stack 0',
        },
        {
          label: 'Critical - U',
          data: critU,
          backgroundColor: 'rgba(139, 0, 0, 0.8)',
          stack: 'Stack 0',
        },
      ],
    }

    generateGraph.barChart(data, title, logger, { showLegend: true })
  })
}

const generateCveGraphs = (preparedCveData: CveGraphData[]) => {
  preparedCveData.forEach(cveArray => {
    const title = cveArray.title
    const labels = cveArray.data.map(c => `${c.name} - ${c.score}`)
    const countData = cveArray.data.map(c => c.count)

    const data: ChartData<'bar', number[], string> = {
      labels,
      datasets: [
        {
          label: 'Count',
          data: countData,
          backgroundColor: 'rgba(33, 150, 243, 0.8)',
          stack: 'Stack 0',
        },
      ],
    }

    generateGraph.barChart(data, title, logger, { extraWide: true })
  })
}

const SEVERITY_LABELS = [
  'Critical Fixable',
  'Critical Unfixable',
  'High Fixable',
  'High Unfixable',
  'Medium Fixable',
  'Medium Unfixable',
  'Low Fixable',
  'Low Unfixable',
  'Unspecified Fixable',
  'Unspecified Unfixable',
]

const generateSeverityGraph = (title: string, countData: number[]) => {
  const data: ChartData<'bar', number[], string> = {
    labels: SEVERITY_LABELS,
    datasets: [
      {
        label: 'Count',
        data: countData,
        backgroundColor: 'rgba(33, 150, 243, 0.8)',
        stack: 'Stack 0',
      },
    ],
  }

  generateGraph.barChart(data, title, logger, {
    showDataLabels: true,
    largeXLabels: true,
  })
}

const generateSeverityCountGraph = ({
  criticalFixable,
  criticalUnfixable,
  highFixable,
  highUnfixable,
  mediumFixable,
  mediumUnfixable,
  lowFixable,
  lowUnfixable,
  unspecifiedFixable,
  unspecifiedUnfixable,
}: SeveritySums) => {
  const countData = [
    criticalFixable,
    criticalUnfixable,
    highFixable,
    highUnfixable,
    mediumFixable,
    mediumUnfixable,
    lowFixable,
    lowUnfixable,
    unspecifiedFixable,
    unspecifiedUnfixable,
  ]
  generateSeverityGraph('Severity vs Total Count', countData)
  generatePieGraph('Severity Distribution by Total Count', countData)
}

const generateUniqueImagesPerSeverity = ({
  criticalFixable,
  criticalUnfixable,
  highFixable,
  highUnfixable,
  mediumFixable,
  mediumUnfixable,
  lowFixable,
  lowUnfixable,
  unspecifiedFixable,
  unspecifiedUnfixable,
}: ImagesBySeverity) => {
  const countData = [
    criticalFixable.length,
    criticalUnfixable.length,
    highFixable.length,
    highUnfixable.length,
    mediumFixable.length,
    mediumUnfixable.length,
    lowFixable.length,
    lowUnfixable.length,
    unspecifiedFixable.length,
    unspecifiedUnfixable.length,
  ]

  generateSeverityGraph('Severity vs Unique Image Count', countData)
  generatePieGraph('Severity Distribution by Unique Images', countData)
}

const generatePieGraph = (title: string, sliceData: number[]) => {
  const data: ChartData<'pie', number[], string> = {
    labels: SEVERITY_LABELS,
    datasets: [
      {
        label: 'Count',
        data: sliceData,
        backgroundColor: [
          'rgba(139, 0, 0, 0.8)',
          'rgba(255, 0, 0, 0.8)',
          'rgba(255, 69, 0, 0.8)',
          'rgba(255, 140, 0, 0.8)',
          'rgba(255, 165, 0, 0.8)',
          'rgba(255, 255, 0, 0.8)',
          'rgba(173, 255, 47, 0.8)',
          'rgba(60, 179, 113, 0.8)',
          'rgba(124, 252, 0, 0.8)',
          'rgba(144, 238, 144, 0.8)',
        ],
      },
    ],
  }

  generateGraph.pieChart(data, title, logger, {
    showDataLabels: true,
    showLegend: true,
  })
}

const main = () => {
  const imageScanStats = loadInitialData()

  const preparedImageData = selectImageArrays(imageScanStats)
  const cveArrayResults = selectCveArrays(imageScanStats)
  const {
    severityAverageAllImages,
    unfixableSeverityAverageAllImages,
    fixableSeverityAverageAllImages,
    severityCounts,
    imagesBySeverity,
  } = imageScanStats

  generateImageScanGraphs(preparedImageData)
  generateCveGraphs(cveArrayResults)

  generateSeverityCountGraph(severityCounts)
  generateUniqueImagesPerSeverity(imagesBySeverity)
  logger(
    `Leftover statistics:\n\tSeverity Average - ${severityAverageAllImages}\n\tUnfixable Average - ${unfixableSeverityAverageAllImages}\n\tFixable Average - ${fixableSeverityAverageAllImages}`,
  )
}

main()
