document
  .querySelector('form')
  .addEventListener('submit', async (event) => {
    event.preventDefault()
    const msg = event.target.querySelector('input[type=text]').value
    await browser.tabs.executeScript({
      code: `console.log('${msg}');`
    })
  })
