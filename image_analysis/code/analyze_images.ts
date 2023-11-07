import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { executeCommandAsync } from './utils/executeCommand'
import { loadJson, saveFile, deleteFile } from './utils/fileOps'
import { CliArgs, ImageMap, Image } from './types'
import { log } from './utils/logger'

/* start setup */
const args = yargs(hideBin(process.argv))
  .option('images', { type: 'string' })
  .parseSync() as CliArgs

const CUSTOM_IMAGES = args.images ? true : false

const LOG_FILE = `scout_scan${CUSTOM_IMAGES ? `-${args.images}` : ''}`
deleteFile(`logs/${LOG_FILE}.log`)
/* end */

const fetchPage = async pageNum => {
  log(`fetching page ${pageNum}...`, LOG_FILE)
  const res = await fetch(
    `https://hub.docker.com/v2/repositories/library/?page=${pageNum}`,
  )
  return JSON.parse(await res.text())
}

const processPageData = page =>
  page.results.map(
    (image): Image => ({
      name: image.name,
      description: image?.description,
      status: image.status_description,
      starCount: image.star_count,
      pullCount: image.pull_count,
      lastUpdated: image.last_updated,
    }),
  )

const getImages = async (): Promise<ImageMap> => {
  const imageMap: ImageMap = {}
  let pageNum = 1
  let dockerImagePage = await fetchPage(pageNum)
  processPageData(dockerImagePage).forEach(image => {
    imageMap[image.name] = image
  })
  pageNum++
  while (dockerImagePage.next) {
    dockerImagePage = await fetchPage(pageNum)
    processPageData(dockerImagePage).forEach(image => {
      imageMap[image.name] = image
    })
    if (dockerImagePage.next) pageNum++
  }

  log(
    `done processing ${pageNum} pages and ${
      Object.keys(imageMap).length
    } entries...`,
    LOG_FILE,
  )
  return imageMap
}

const parseCustomImage = (imageString: string): Image => {
  if (imageString.includes('--platform')) {
    const strings = imageString.split(' ')
    return {
      name: strings[2],
      platform: `${strings[0]} ${strings[1]}`,
    }
  }
  console.log(imageString)
  return { name: imageString, platform: '' }
}

const downloadImage = (image: string) => `docker pull ${image}`
const scoutImage = (image: string) =>
  `docker scout cves --format sarif --output ./scout_scan_output/${image}.json ${image}`
const deleteImage = (image: string) => `docker rmi ${image}`

const processImage = async (image: Image | string): Promise<Image> => {
  const imageScan: Image =
    typeof image === 'string' ? parseCustomImage(image) : image
  const downloadOut = await executeCommandAsync(
    downloadImage(`${imageScan.platform} ${imageScan.name}`),
  )
  log(`Download complete for ${imageScan.name}`, LOG_FILE)
  imageScan.downloadOutput = downloadOut

  if (!downloadOut.error) {
    const scoutOut = await executeCommandAsync(scoutImage(imageScan.name))
    log(`Scout complete for ${imageScan.name}`, LOG_FILE)
    imageScan.scoutOutput = scoutOut

    const deleteOut = await executeCommandAsync(deleteImage(imageScan.name))
    log(`Delete complete for ${imageScan.name}`, LOG_FILE)
    imageScan.deleteOutput = deleteOut
  } else if (downloadOut.stderr?.includes('toomanyrequests')) {
    log('Too many pulls from Docker Hub... Exiting...', LOG_FILE)
    process.exit(1)
  } else {
    log(downloadOut.error, LOG_FILE)
  }

  return imageScan
}

const CONCURRENCY_LIMIT = 3

const processInBatches = async (
  images: ImageMap | string[],
): Promise<ImageMap> => {
  const imageMap: ImageMap = {}
  const imageKeys = Array.isArray(images) ? images : Object.keys(images)
  let batchCompleted = 1
  for (let i = 0; i < imageKeys.length; i += CONCURRENCY_LIMIT) {
    // use this for testing on a subset of images
    // for (let i = 0; i < 2; i += CONCURRENCY_LIMIT) {
    const batch = imageKeys.slice(i, i + CONCURRENCY_LIMIT)
    log(`starting batch ` + batch, LOG_FILE)
    const batchResults = await Promise.all(
      batch.map(image =>
        typeof image === 'string'
          ? processImage(image)
          : processImage(imageMap[image]),
      ),
    )
    log(`batch ${batchCompleted} completed!`, LOG_FILE)
    batchCompleted++
    batchResults.forEach(result => (imageMap[result.name] = result))
  }
  return imageMap
}

const performScoutAnalysis = async (images: ImageMap): Promise<ImageMap> =>
  await processInBatches(images)

const loadOfficialImages = async (): Promise<ImageMap> => {
  const maybeImages = loadJson('./data/image_cache.json')
  const imageMap: ImageMap = maybeImages.success
    ? maybeImages.data
    : await getImages()

  !maybeImages.success &&
    Object.keys(imageMap).length > 0 &&
    saveFile('./data/image_cache.json', imageMap as any)
  return imageMap
}

const loadCustomImageList = (fileName: string) => {
  const maybeImages = loadJson(fileName)
  if (!maybeImages.success) {
    log('unable to load custom file, exiting...', LOG_FILE)
    process.exit(1)
  }
  return maybeImages.data
}

const main = async () => {
  const images = CUSTOM_IMAGES
    ? loadCustomImageList(args.images)
    : await loadOfficialImages()
  const scoutAnalysis = await performScoutAnalysis(images)
  saveFile('image_overview_report.json', { data: scoutAnalysis } as any)

  log('thank you for analyzing today... goodbye!', LOG_FILE)
}
