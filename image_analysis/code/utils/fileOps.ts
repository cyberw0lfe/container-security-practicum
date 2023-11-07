import {
  existsSync,
  readFileSync,
  writeFileSync,
  appendFile,
  appendFileSync,
  unlinkSync,
} from 'fs'

export const loadJson = (path: string) =>
  existsSync(path)
    ? { success: true, data: JSON.parse(readFileSync(path, 'utf8')) }
    : { success: false }

export const saveFile = (path: string, content: JSON) =>
  writeFileSync(path, JSON.stringify(content, null, 2), 'utf8')

export const appendToFile = (
  path: string,
  content: string,
  synchronous = false,
) => {
  const append = synchronous ? appendFileSync : appendFile
  append(path, content, 'utf-8', err => {
    if (err) throw err
  })
}

export const deleteFile = (path: string) => existsSync(path) && unlinkSync(path)
