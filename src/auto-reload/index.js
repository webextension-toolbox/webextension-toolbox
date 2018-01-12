const { chrome } = window

/**
 * Triggers callback as soon as
 * any extension file changed
 *
 * @param {Function} callback
 */
const onExtensionFileChange = async (callback) => {
  const changedFiles = await getChangedFiles()
  if (changedFiles.length) {
    callback(changedFiles)
  }
  await wait(1000)
  return onExtensionFileChange(callback)
}

/**
 * Resolves a Promise after
 * ms milliseconds
 *
 * @param   {Number} ms
 * @returns {Promise}
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Gets all changes files,
 * by comparing the current files
 * with an older snapshot
 *
 * @returns {Promise}
 */
const getChangedFiles = async () => {
  // Get extension directory
  const directory = await getPackageDirectoryEntry()

  // Get all files from extension directory
  const extensionFiles = await getExtensionFileList(directory)

  // Determin if any of the files changed since last snapshot
  const extensionfilesWithChangeInfo = await compareWithLastSnapshot(extensionFiles)

  // Only return changed files
  return extensionfilesWithChangeInfo.filter(file => file.changed)
}

/**
 * Returns a DirectoryEntry object
 * representing the package directory.
 *
 * @param   {Object} ms
 * @returns {Promise}
 */
const getPackageDirectoryEntry = () => {
  return new Promise((resolve) =>
    chrome.runtime.getPackageDirectoryEntry(resolve)
  )
}

/**
 * Extracts all files from a directory
 * in a flat form
 *
 * @returns {Promise}
 */
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

/**
 * Flattens array a single level deep.
 *
 * @param {Array} list
 */
const flatten = list => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
)

/**
 * Converts a fileEntry to a
 * simple js object with, type, path & lastModified
 *
 * @param {FileEntry} entry
 * @returns {Promise}
 */
const getFileDescFrom = async (entry) => {
  return new Promise((resolve) => entry.file((file) => {
    resolve({
      type: file.type,
      path: (entry.fullPath || '').replace(/^\/crxfs\//, ''),
      lastModified: file.lastModified
    })
  }))
}

/**
 * Compares the fileList snapshots
 * and returns a new one with
 * a changed flag
 */
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

console.log(`%cautoReload: enabled`, 'color: grey;')
onExtensionFileChange(async (changedFiles) => {
  // Check if there is an open page (contentscripts?)
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, ([tab]) => {
    // Reload current contentscript if anything changed
    if (tab) {
      chrome.tabs.reload(tab.id)
    }

    // Reload entire extension
    chrome.runtime.reload()
  })
})
