const onExtensionFileChange = require('./onExtensionFileChange')

log('enabled')

onExtensionFileChange(async (changedFiles) => {
  const [extensionTab] = await browser.tabs.query({
    active: true,
    url: `${window.location.origin}/*`
  })

  // If we have any open extension tabs,
  // don't do a full extension reload.
  // Instead only reload the extension tabs.
  if (extensionTab) {
    log('soft reloading extension page')
    return browser.tabs.reload(extensionTab.id)
  }

  // Reload current contentscript if anything changed
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true
  })

  if (tab) {
    await browser.tabs.reload(tab.id)
  }

  // Reload entire extension
  browser.runtime.reload()
})

function log (str) {
  console.log(`%cautoReload: ${str}`, 'color: grey;')
}
