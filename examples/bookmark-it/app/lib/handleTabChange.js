import updateIcon from './updateIcon'

export default async function handleTabChange (tabs) {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
    url: ['https://*/*', 'http://*/*', 'ftp://*/*', 'file://*/*']
  })

  if (!currentTab) return

  const [currentBookmark] = await browser.bookmarks.search({ url: currentTab.url })

  return updateIcon(currentTab.id, !!currentBookmark)
}
