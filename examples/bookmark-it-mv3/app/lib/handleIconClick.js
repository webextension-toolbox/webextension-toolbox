export default async function handleIconClick ({ url, title }) {
  const [bookmark] = await browser.bookmarks.search({ url })
  return bookmark
    ? browser.bookmarks.remove(bookmark.id)
    : browser.bookmarks.create({ title, url })
}
