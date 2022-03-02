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
      // KNOWN MV3 ISSUE: chrome.i18n.getMessage not a function
      // See: https://groups.google.com/a/chromium.org/g/chromium-extensions/c/dG6JeZGkN5w
      title: hasBookmark ? chrome.i18n.getMessage('unbookmarkTitle') : chrome.i18n.getMessage('bookmarkTitle')
    })
  ])
}
