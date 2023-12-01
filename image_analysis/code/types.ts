interface CliArgs {
  images?: string
}

interface VulnerabilityMap {
  vulnerabilityMap: RuleMap
  severities: Severities
}

interface RuleMap {
  [key: string]: Rule
}

interface Rule {
  severityLevel: string
  severityScore: number
  isFixed: boolean
  fix: string
  description: string
}

interface Severities {
  low: Severity
  medium: Severity
  high: Severity
  critical: Severity
  unspecified: Severity
}

interface Severity {
  fix: number
  noFix: number
}

interface ImageMap {
  [index: string]: Image
}

interface Image {
  name: string
  description?: string | undefined
  status?: string
  starCount?: number
  pullCount?: number
  lastUpdated?: string
  downloadOutput?: ExecOutput
  scoutOutput?: ExecOutput
  deleteOutput?: ExecOutput
  averageCveScore?: number
  averageFixableCveScore?: number
  averageUnfixableCveScore?: number
  vulnerabilityMap?: VulnerabilityMap
  severities?: Severities
  platform?: string
}

interface ExecOutput {
  stdout: string | null
  error: string | null
  stderr: string | null
}

interface SeveritySums {
  criticalFixable: number
  criticalUnfixable: number
  highFixable: number
  highUnfixable: number
  mediumFixable: number
  mediumUnfixable: number
  lowFixable: number
  lowUnfixable: number
  unspecifiedFixable: number
  unspecifiedUnfixable: number
}

interface ImagesBySeverity {
  criticalFixable: string[]
  criticalUnfixable: string[]
  highFixable: string[]
  highUnfixable: string[]
  mediumFixable: string[]
  mediumUnfixable: string[]
  lowFixable: string[]
  lowUnfixable: string[]
  unspecifiedFixable: string[]
  unspecifiedUnfixable: string[]
}

interface Cve {
  name: string
  score: number
  count: number
  fixed: boolean
}

interface CveStats {
  [key: string]: Cve
}

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

export {
  CliArgs,
  VulnerabilityMap,
  RuleMap,
  Rule,
  Severities,
  ExecOutput,
  ImageMap,
  Image,
  SeveritySums,
  ImagesBySeverity,
  CveStats,
  Cve,
  ImageStats,
}
