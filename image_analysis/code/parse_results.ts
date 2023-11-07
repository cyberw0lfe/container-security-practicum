import * as fs from 'fs'
import * as path from 'path'
import { loadJson, saveFile, deleteFile } from './utils/fileOps'
import { log } from './utils/logger'
import { VulnerabilityMap, RuleMap, Rule, Severities } from './types'

const SCOUT_DIRECTORY = './scout_scan_output'
const LOG_FILE = 'parse_scout_results'
deleteFile(`logs/${LOG_FILE}.log`)

const parseRules = (rules: any[]): VulnerabilityMap => {
  const vulnerabilityMap: RuleMap = {}
  const severities: Severities = {
    low: {
      fix: 0,
      noFix: 0,
    },
    medium: {
      fix: 0,
      noFix: 0,
    },
    high: {
      fix: 0,
      noFix: 0,
    },
    critical: {
      fix: 0,
      noFix: 0,
    },
    unspecified: {
      fix: 0,
      noFix: 0,
    },
  }
  rules.forEach(rule => {
    const isFixed = rule.properties.fixed_version === 'not fixed' ? false : true
    const severityLevel = rule.properties.cvssV3_severity.toLowerCase()
    vulnerabilityMap[rule.id] = {
      severityLevel,
      severityScore: parseFloat(rule.properties['security-severity']),
      isFixed,
      fix: rule.properties.fixed_version,
      description: rule.help.text,
    } as Rule

    isFixed
      ? severities[severityLevel].fix++
      : severities[severityLevel].noFix++
  })

  return { vulnerabilityMap, severities }
}

const formatResults = (files: string[]) => {
  const analysis = {}
  files.forEach(file => {
    if (path.extname(file) === '.json') {
      const scoutOutput = loadJson(path.join(SCOUT_DIRECTORY, file))
      const vulnMap = scoutOutput.success
        ? parseRules(scoutOutput.data.runs[0].tool.driver.rules)
        : {}
      analysis[file.split('.')[0]] = vulnMap
    }
  })
  return analysis
}

fs.readdir(SCOUT_DIRECTORY, (err, files) => {
  if (err) throw err
  log(`analyzing output from ${files.length} scans`, LOG_FILE)
  const formattedResults = formatResults(files)
  saveFile('./data/parse_results_output.json', formattedResults as any)
})
