export default async function handleIconClick ({ url, title }) {
  const [bookmark] = await chrome.bookmarks.search({ url })
  return bookmark
    ? chrome.bookmarks.remove(bookmark.id)
    : chrome.bookmarks.create({ title, url })
}
