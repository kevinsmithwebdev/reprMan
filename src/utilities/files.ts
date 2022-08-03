export const writeFile = async (filename: string, contents: string) => {
  const fileHandle = await getNewFileHandle(filename)
  const writable = await fileHandle.createWritable()
  await writable.write(contents)
  await writable.close()
}

export const readFile = async () => {
  const fileHandles = await getOldFileHandles()
  const file = await fileHandles[0].getFile()
  return file.text()
}

export const getNewFileHandle = async (filename: string) => {
  const options = {
    suggestedName: filename,
    types: [
      {
        description: 'Text Files',
        accept: {
          'text/plain': ['.txt'],
        },
      },
    ],
  }
  // @ts-ignore
  return window.showSaveFilePicker(options)
}

export const getOldFileHandles = async () => {
  const options = {
    types: [
      {
        description: 'Text Files',
        accept: {
          'text/plain': ['.txt'],
        },
      },
    ],
  }
  // @ts-ignore
  return window.showOpenFilePicker(options)
}
