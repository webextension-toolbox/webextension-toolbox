import handleTabChange from './lib/handleTabChange'
import handleIconClick from './lib/handleIconClick'

// listen from browserAction clicks
chrome.action.onClicked.addListener(handleIconClick)

// listen for bookmarks being created
chrome.bookmarks.onCreated.addListener(handleTabChange)

// listen for bookmarks being removed
chrome.bookmarks.onRemoved.addListener(handleTabChange)

// listen to tab URL changes
chrome.tabs.onUpdated.addListener(handleTabChange)

// listen to tab switching
chrome.tabs.onActivated.addListener(handleTabChange)

// listen for window switching
chrome.windows.onFocusChanged.addListener(handleTabChange)

// update when the extension loads initially
handleTabChange()
