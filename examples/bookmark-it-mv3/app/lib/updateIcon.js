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
    chrome.action.setIcon({
      tabId,
      path: hasBookmark
        ? filledStarIcon
        : emtyStarIcon
    }),
    chrome.action.setTitle({
      tabId,
      title: hasBookmark ? chrome.i18n.getMessage('unbookmarkTitle') : chrome.i18n.getMessage('bookmarkTitle')
    })
  ])
}
