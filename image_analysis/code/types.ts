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
  vulnerabilityMap?: VulnerabilityMap
  severities?: Severities
  platform?: string
}

interface ExecOutput {
  stdout: string | null
  error: string | null
  stderr: string | null
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
}
