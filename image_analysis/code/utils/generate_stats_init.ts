import {
  CveStats,
  Cve,
  Image,
  ImageMap,
  ImagesBySeverity,
  SeveritySums,
} from '../types'

interface ImageStats {
  imageMap: ImageMap
  byStarCount: Image[]
  byPullCount: Image[]
  byPublishDate: Image[]
  byAverageCve: Image[]
  byAverageFixable: Image[]
  byAverageUnfixable: Image[]
  cveStats: CveStats
  cvesByCount: Cve[]
  cvesBySeverity: Cve[]
  fixedCves: Cve[]
  unfixedCves: Cve[]
  imagesBySeverity: ImagesBySeverity
  severityCounts: SeveritySums
  severityAverageAllImages: number
  unfixableSeverityAverageAllImages: number
  fixableSeverityAverageAllImages: number
}

export default {
  imageMap: {},
  byStarCount: [],
  byPullCount: [],
  byPublishDate: [],
  byAverageCve: [],
  byAverageFixable: [],
  byAverageUnfixable: [],
  cveStats: {},
  severityAverageAllImages: 0,
  unfixableSeverityAverageAllImages: 0,
  fixableSeverityAverageAllImages: 0,
  severityCounts: {
    criticalFixable: 0,
    criticalUnfixable: 0,
    highFixable: 0,
    highUnfixable: 0,
    mediumFixable: 0,
    mediumUnfixable: 0,
    lowFixable: 0,
    lowUnfixable: 0,
    unspecifiedFixable: 0,
    unspecifiedUnfixable: 0,
  },
  imagesBySeverity: {
    criticalFixable: [],
    criticalUnfixable: [],
    highFixable: [],
    highUnfixable: [],
    mediumFixable: [],
    mediumUnfixable: [],
    lowFixable: [],
    lowUnfixable: [],
    unspecifiedFixable: [],
    unspecifiedUnfixable: [],
  },
} as ImageStats
