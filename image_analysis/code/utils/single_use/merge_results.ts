import { merge } from 'lodash'
import { loadJson, appendToFile } from '../fileOps'
import { ImageMap } from '../../types'

const INPUT_PATH_1 = '../../data/parse_results_output.json'
const INPUT_PATH_2 = '../../data/parse_results_output-backfill.json'
const OUTPUT_PATH = '../../data/results_merged.json'
// results only need merged because of
// custom image list scanning for those
// without the latest tag
const mergeResults = () => {
  console.log('loading first input...')
  const first = loadJson(INPUT_PATH_1) as {
    success: boolean
    data: ImageMap
  }

  console.log('loading second input...')
  const second = loadJson(INPUT_PATH_2) as {
    success: boolean
    data: ImageMap
  }

  console.log('merging input objects....')
  return first.success && second.success
    ? merge(first.data, second.data)
    : process.exit(1)
}

const res = mergeResults()
appendToFile(OUTPUT_PATH, JSON.stringify(res))
