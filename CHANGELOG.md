# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Updated Dependencies
### Removed
- Support for NodeJS 12.x

## [5.2.2] - 2021-04-19

### Fixed
- Add missing browserlist to package.json

## [5.2.1] - 2021-04-14

### Fixed
- ts-loader should load service_worker to parse if its written in typescript

## [5.2.0] - 2021-04-14

### Changes
- Updated `@webextension-toolbox/webpack-webextension-plugin` and `glob` to latest versions.

## [5.1.1] - 2021-04-11

### Fixed
- Target resolution was incorrect and thus detroying most of the built modules
### Changes

- In the past the `node` option was set to false in webpack config to prevent security issues with usage of eval (See https://github.com/webextension-toolbox/webextension-toolbox/pull/34). This was resolved at the end of life of webpack 4 and does not exist in webpack 5. This option is now set to true by default (not set). This means global is now set by webpack itself. If you want to disable this behavior you can set the `node` option to false in your webpack config. See: https://webpack.js.org/configuration/node/
- Clean webpack plugin was removed in favor of https://webpack.js.org/guides/output-management/#cleaning-up-the-dist-folder which is native in webpack 5.

## [5.0.1] - 2021-04-06
### Changes

- Added support for GPR

## [5.0.0] - 2021-04-05

### Added

- Native Typescript support #93
- Service Worker client support
- Support \_\_ENV\_\_ variable replacement in manifest
- Support for Manifest v3 #196
- Added Option to disable manifest validation (`--no-manifest-validation`)
- Option to define development server port (`--port`) #592
- Manifest.json enviroment keys #158

### Fixed

- Doesn't build when there is no /app/_locales/**/*.json #523
### Changes

- Removed native React support see Section on React.JS in README

### Removed
- [https://github.com/mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill). All browsers now support the `browser` global and thus this should be used over `chrome`. Therefore the removal of pollyfill was nessecary. You can add it back yourself in your own projects if needed

## [4.0.3] - 2021-07-05

### Changed

- Merge pull request #494 from balcsida/bump-plugin 0480141
- Bump webpack-webextension-plugin aca3298
- Merge pull request #483 from webextension-toolbox/dependabot/npm_and_yarn/commander-8.0.0 56b8473
- Bump commander from 8.0.0-2 to 8.0.0 19f8ebb
- Merge pull request #492 from webextension-toolbox/dependabot/npm_and_yarn/core-js-3.15.2 ce8444b
- Merge pull request #493 from webextension-toolbox/dependabot/npm_and_yarn/webpack-5.42.0 4c8f497
- Merge pull request #488 from webextension-toolbox/dependabot/npm_and_yarn/string-replace-loader-3.0.3 51bf23e
- Bump webpack from 5.40.0 to 5.42.0 d3ea350
- Bump string-replace-loader from 3.0.2 to 3.0.3 d613295
- Bump core-js from 3.15.0 to 3.15.2 ba85193
- Merge pull request #485 from balcsida/ghactions/nodeci 4ad6afe
- Merge pull request #487 from webextension-toolbox/dependabot/npm_and_yarn/copy-webpack-plugin-9.0.1 297b9fb
- Bump copy-webpack-plugin from 9.0.0 to 9.0.1 e428f27
- Use Latest version of setup-node 894261d

## [4.0.2] - 2021-06-27

### Changed

- Merge pull request #486 from balcsida/bump_version f9b3933
- Bump webpack-webextension-plugin and node versions a0a025d
- Add version to example extension f50bdc7

## [4.0.1] - 2021-06-22

### Changed

- Fix a small issue with package-lock.json not working on Node 12.x

## [4.0.0] - 2021-06-22

### Changed

- All dependencies are now the latest and greatest - including Webpack, which was bumped from 2.6.1 to 5.40.0. As these dependency updates can introduce breaking changes for certain workflows, that's why the major version got bumped (v3.0.0 to v4.0.0)
- Edge is now Chromium - so it should get the polyfills automatically (kudos to @fapdash for this)
- All CI is now GitHub Actions
- Dependabot keeps us up to date
- Dropped Nodejs v10.x support, picked up v16.x
- Thanks to @dotproto we now have a cleaner README
