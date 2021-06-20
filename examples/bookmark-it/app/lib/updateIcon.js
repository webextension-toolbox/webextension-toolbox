const filledStarIcon = {
  19: 'icons/star-filled-19.png',
  38: 'icons/star-filled-38.png'
}

const emtyStarIcon = {
  19: 'icons/star-empty-19.png',
  38: 'icons/star-empty-38.png'
}

export default async function updateIcon (tabId, hasBookmark) {
  return Promise.all([
    browser.browserAction.setIcon({
      tabId,
      path: hasBookmark
        ? filledStarIcon
        : emtyStarIcon
    }),
    browser.browserAction.setTitle({
      tabId,
      title: hasBookmark ? browser.i18n.getMessage('unbookmarkTitle') : browser.i18n.getMessage('bookmarkTitle')
    })
  ])
}
