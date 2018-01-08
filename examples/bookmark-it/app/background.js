import handleTabChange from './lib/handleTabChange'
import handleIconClick from './lib/handleIconClick'

// listen from browserAction clicks
browser.browserAction.onClicked.addListener(handleIconClick)

// listen for bookmarks being created
browser.bookmarks.onCreated.addListener(handleTabChange)

// listen for bookmarks being removed
browser.bookmarks.onRemoved.addListener(handleTabChange)

// listen to tab URL changes
browser.tabs.onUpdated.addListener(handleTabChange)

// listen to tab switching
browser.tabs.onActivated.addListener(handleTabChange)

// listen for window switching
browser.windows.onFocusChanged.addListener(handleTabChange)

// update when the extension loads initially
handleTabChange()
