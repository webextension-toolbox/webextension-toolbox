const Joi = require('joi')
const chalk = require('chalk')

const schema = Joi.object({
  // The extension's author, intended for display in the browser's user interface. If the developer key is supplied and it contains the "name" property, it will override the author key. There's no way to specify multiple authors.
  author: Joi.string(),

  // Use the background key to include one or more background
  // scripts, and optionally a background page in your extension.
  background: Joi.object({
    scripts: Joi.array().items(Joi.string()),
    page: Joi.string()
  }).xor('scripts', 'page'),

  // A browser action is a button that your extension adds to the browser's toolbar. The button has an icon, and may optionally have a popup whose content is specified using HTML, CSS, and JavaScript.
  browser_action: Joi.object({
    browser_style: Joi.boolean(),
    default_area: Joi.alternatives([Joi.string(), Joi.object()])
  }),

  // Use the chrome_settings_overrides key to override certain browser settings.
  chrome_settings_overrides: Joi.object({
    homepage: Joi.string(),
    search_provider: Joi.object()
  }),

  // Use the chrome_url_overrides key to provide a custom replacement for the documents loaded into various special pages usually provided by the browser itself.
  chrome_url_overrides: Joi.object({
    bookmark: Joi.string(),
    history: Joi.string(),
    newtab: Joi.string()
  }),

  // Use the commands key to define one or more keyboard shortcuts for your extension.
  commands: Joi.object(),

  // Instructs the browser to load content scripts into web pages whose URL matches a given pattern.
  content_scripts: Joi.array().items(
    Joi.object({
      all_frames: Joi.boolean(),
      css: Joi.array().items(Joi.string()),
      exclude_matches: Joi.array().items(Joi.string()),
      include_globs: Joi.array().items(Joi.string()),
      js: Joi.array().items(Joi.string()),
      match_about_blank: Joi.boolean(),
      matches: Joi.array().items(Joi.string()),
      run_at: Joi.string()
    })
  ),

  // Extensions have a content security policy applied to them by default. The default policy restricts the sources from which they can load<script> and <object> resources, and disallows potentially unsafe practices such as the use of eval(). See Default content security policy to learn more about the implications of this.
  content_security_policy: Joi.string(),

  // This key must be present if the extension contains the _locales directory, and must be absent otherwise. It identifies a subdirectory of _locales, and this subdirectory will be used to find the default strings for your extension.
  default_locale: Joi.string(),

  // A short description of the extension, intended for display in the browser's user interface.
  description: Joi.string(),

  // The name of the extension's developer and their homepage URL, intended for display in the browser's user interface.
  developer: Joi.object({
    name: Joi.string(),
    url: Joi.string()
  }),

  // Use this key to enable your extension to extend the browser's built-in devtools.
  devtools_page: Joi.string(),

  // URL for the extension's home page.
  homepage_url: Joi.string(),

  // The icons key specifies icons for your extension. Those icons will be used to represent the extension in components such as the Add-ons Manager.
  icons: Joi.object(),

  // Use the incognito key to control how the extension works with private browsing windows.
  incognito: Joi.string().valid('spanning', 'split', 'not_allowed'),

  // This key specifies the version of manifest.json used by this extension.
  // Currently, this must always be 2.
  manifest_version: Joi.number().default(2),

  // Name of the extension. This is used to identify the extension in the browser's user interface and on sites like addons.mozilla.org.
  name: Joi.string().max(45).required(),

  // Use the omnibox key to define an omnibox keyword for your extension.
  omnibox: Joi.object({
    keyword: Joi.string()
  }),

  // Use the optional_permissions key to list permissions which you want to ask for at runtime, after your extension has been installed.
  optional_permissions: Joi.array().items(Joi.string()),

  // Use the options_ui key to define an options page for your extension.
  options_ui: Joi.object({
    browser_style: Joi.boolean(),
    open_in_tab: Joi.boolean(),
    page: Joi.string().required()
  }),

  // A page action is an icon that your extension adds inside the browser's URL bar.
  page_action: Joi.object({
    browser_style: Joi.boolean(),
    default_icon: Joi.alternatives(Joi.string(), Joi.object()),
    default_popup: Joi.string(),
    default_title: Joi.string()
  }),

  // Use the permissions key to request special powers for your extension. This key is an array of strings, and each string is a request for a permission.
  permissions: Joi.array().items(Joi.string()),

  // Short name for the extension. If given, this will be used in contexts where the name field is too long. It's recommended that the short name should not exceed 12 characters. If the short name field is not included in manifest.json, then name will be used instead and may be truncated.
  short_name: Joi.string(),

  // A sidebar is a pane that is displayed at the left-hand side of the browser window, next to the web page. The browser provides a UI that enables the user to see the currently available sidebars and to select a sidebar to display.
  sidebar_action: Joi.object({
    browser_style: Joi.boolean(),
    default_icon: Joi.alternatives(Joi.string(), Joi.object()),
    default_panel: Joi.string(),
    default_title: Joi.string()
  }),

  // A basic theme must define an image to add to the header, the accent color to use in the header, and the color of text used in the header.
  theme: Joi.object({
    images: Joi.object({
      headerURL: Joi.string(),
      theme_frame: Joi.string(),
      additional_backgrounds: Joi.array().items(Joi.string())
    }),
    colors: Joi.object(),
    properties: Joi.object()
  }),

  // Version of the extension, formatted as numbers and ASCII characters separated by dots. For the details of the version format, see the Version format page.
  version: Joi.string()
})

module.exports = async function validate (manifestJSON) {
  try {
    var result = await Joi.validate(manifestJSON, schema, {
      allowUnknown: true
    })
  } catch (error) {
    throw new Error('manifest.json: \n' + chalk.reset(error.annotate()))
  }
  return result
}
