import updateIcon from './updateIcon'

export default async function handleTabChange (tabs) {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
    url: ['https://*/*', 'http://*/*', 'ftp://*/*', 'file://*/*']
  })

  if (!currentTab) return

  const [currentBookmark] = await chrome.bookmarks.search({ url: currentTab.url })

  return updateIcon(currentTab.id, !!currentBookmark)
}
