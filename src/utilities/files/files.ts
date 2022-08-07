import { FileType } from 'state/sagas/files/constants'

export const writeFile = async (fileHandle: any, contents: any) => {
  const writable = await fileHandle.createWritable()
  await writable.write(contents)
  await writable.close()
}

export const readFile = async (fileHandle: any): Promise<string | Blob> => {
  const file = await fileHandle.getFile()

  if (file.name.endsWith('.xlsx')) {
    return file.slice()
  }

  return file.text()
}

export const getNewFileHandle = async (
  suggestedName: string,
  types: FileType[]
) => {
  const options = { suggestedName, types }
  // @ts-ignore
  return window.showSaveFilePicker(options)
}

export const getExistingFileHandles = async (types: FileType[]) => {
  const options = { types }
  // @ts-ignore
  return window.showOpenFilePicker(options)
}
