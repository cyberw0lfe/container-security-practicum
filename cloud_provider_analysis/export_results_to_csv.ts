import {
  appendFileSync,
  existsSync,
  unlinkSync,
  readdirSync,
  readFileSync,
} from 'fs'
import { extname } from 'path'

interface Provider {
  files: String[]
  results: any
}

interface ProviderScan {
  aws: Provider
  azure: Provider
  digitalocean: Provider
  gcp: Provider
  ibm: Provider
}

const outputPath = './kube-bench.csv'
const providers = ['aws', 'azure', 'digitalocean', 'gcp', 'ibm']

const providerScan: ProviderScan = {
  aws: { files: [], results: {} },
  azure: { files: [], results: {} },
  digitalocean: { files: [], results: {} },
  gcp: { files: [], results: {} },
  ibm: { files: [], results: {} },
}

const getJsonFiles = (dir: string) =>
  readdirSync(`${dir}/output/`).filter(file => extname(file) === '.json')

const loadJson = (path: string) =>
  existsSync(path)
    ? { success: true, data: JSON.parse(readFileSync(path, 'utf8')) }
    : { success: false }

const getProviderOutput = () => {
  providers.forEach(
    provider => (providerScan[provider].files = getJsonFiles(provider)),
  )
}

const getTestType = description =>
  description.includes('Manual')
    ? 'Manual'
    : description.includes('Automated')
    ? 'Automated'
    : 'Other'

const parseScanResults = () => {
  appendFileSync(
    outputPath,
    'test,provider,result,scored,type,description,file\n',
    'utf-8',
  )
  providers.forEach(provider => {
    providerScan[provider].files.forEach(file => {
      const result = loadJson(`${provider}/output/${file}`)
      if (result.success) {
        result.data.Controls.forEach(control =>
          control.tests.forEach(test =>
            test.results.forEach(res => {
              const line = `${res.test_number},${provider},${res.status},${
                res.scored
              },${getTestType(res.test_desc)},${res.test_desc.replace(
                ',',
                '-',
              )},${file}\n`
              appendFileSync(outputPath, line, 'utf-8')
            }),
          ),
        )
      } else {
      }
    })
  })
}

const main = () => {
  existsSync(outputPath) && unlinkSync(outputPath)
  getProviderOutput()
  parseScanResults()
  // append output to csv
}

main()
