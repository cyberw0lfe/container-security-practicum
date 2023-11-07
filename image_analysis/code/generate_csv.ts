import { appendToFile, deleteFile, loadJson, saveFile } from './utils/fileOps'
import { ImageMap } from './types'
import { log } from './utils/logger'

const LOG_FILE = './logs/generate_csv.log'
const INPUT_PATH = './data/parse_results_output.json'
const OUTPUT_PATH = './data/parse_results_output.csv'

deleteFile(OUTPUT_PATH)

const results = loadJson(INPUT_PATH) as {
  success: boolean
  data: ImageMap
}

if (results.success) {
  appendToFile(
    OUTPUT_PATH,
    'Name,Description,Status,Star Count,Pull Count,Last Updated,Low - Fixable,Low - No Fix,Medium - Fixable,Medium - No Fix,High - Fixable,High - No Fix,Critical - Fixable,Critical - No Fix,Unspecified - Fixable,Unspecified - No Fix\n',
    true,
  )
  const images = Object.keys(results.data)
  images.map(imageName => {
    const {
      name,
      description = '',
      status = '',
      starCount = -1,
      pullCount = -1,
      lastUpdated = '',
      severities,
    } = results.data[imageName]
    appendToFile(
      OUTPUT_PATH,
      `${name || imageName},${description.replace(
        /,/g,
        '',
      )},${status},${starCount},${pullCount},${lastUpdated},${severities?.low
        .fix},${severities?.low.noFix},${severities?.medium.fix},${severities
        ?.medium.noFix},${severities?.high.fix},${severities?.high
        .noFix},${severities?.critical.fix},${severities?.critical
        .noFix},${severities?.unspecified.fix},${severities?.unspecified
        .noFix}\n`,
      true,
    )
  })
} else {
  log('could not import results file...', LOG_FILE)
}
