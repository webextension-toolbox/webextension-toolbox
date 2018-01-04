const onExtensionFileChange = async (callback) => {
  const changedFiles = await getChangedFiles()
  if (changedFiles.length) {
    callback(changedFiles)
  }
  await wait(1000)
  return onExtensionFileChange(callback)
}

module.exports = onExtensionFileChange

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getChangedFiles = async (callback) => {
  // Get extension directory
  const directory = await browser.runtime.getPackageDirectoryEntry()

  // Get all files from extension directory
  const extensionFiles = await getExtensionFileList(directory)

  // Determin if any of the files changed since last snapshot
  const extensionfilesWithChangeInfo = await compareWithLastSnapshot(extensionFiles)

  // Only return changed files
  return extensionfilesWithChangeInfo.filter(file => file.changed)
}

const getExtensionFileList = async (dir) => {
  return new Promise((resolve) => dir
    .createReader()
    .readEntries((entries) => Promise
      .all(entries.map((entry) => {
        if (entry.isFile) {
          return getFileDescFrom(entry)
        }
        return getExtensionFileList(entry)
      }))
      .then(flatten)
      .then(resolve)
    )
  )
}

const flatten = list => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
)

const getFileDescFrom = async (entry) => {
  return new Promise((resolve) => entry.file((file) => {
    resolve({
      type: file.type,
      path: (entry.fullPath || '').replace(/^\/crxfs\//, ''),
      lastModified: file.lastModified
    })
  }))
}

const compareWithLastSnapshot = (() => {
  let fileLog = new Map()
  return async (extensionFiles) => {
    // Create new FileLog with changes
    const newFileLog = new Map()

    // Loop over each file and check if it has changed
    extensionFiles.forEach((file) => {
      const oldFile = fileLog.get(file.path)

      file.changed = oldFile
        ? file.lastModified !== oldFile.lastModified
        : false

      newFileLog.set(file.path, file)
    })

    // Cache the result for the next compare
    fileLog = newFileLog

    return Array.from(fileLog.values())
  }
})()
