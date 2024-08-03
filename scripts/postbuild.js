#!/usr/bin/env node
// @ts-check
import fs from 'node:fs'
import { minify as minifyHtml } from 'html-minifier'
import { minify as minifyJs } from 'terser'
import { transform as transformCss } from 'lightningcss'

import { getFiles } from './utils.js'

/**
 * @type {import('html-minifier').Options}
 */
const HTMLOptions = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  decodeEntities: true,
  html5: true,
  minifyCSS: true,
  minifyJS: true,
  processConditionalComments: true,
  processScripts: ['text/html'],
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeTagWhitespace: true,
  sortAttributes: true,
  sortClassName: true,
  trimCustomFragments: true,
  useShortDoctype: true,
}

/**
 * @type {import('terser').MinifyOptions}
 */
const JSOptions = {
  compress: true,
  mangle: true,
}

/**
 * @type {string[]}
 */
const targetHtmlExts = ['.html']

/**
 * @type {string[]}
 */
const targetJsExts = ['.js']

/**
 * @type {string[]}
 */
const targetCssExts = ['.css']

/**
 * @param {string} filename
 * @param {string[]} [exts]
 * @returns {boolean} - Whether the file is a target HTML file.
 */
function isTargetHtmlFiles(filename, exts = targetHtmlExts) {
  return exts.some(ext => filename.endsWith(ext))
}

/**
 * @param {string} filename
 * @param {string[]} [exts]
 * @returns {boolean} - Whether the file is a target JS file.
 */
function isTargetJsFiles(filename, exts = targetJsExts) {
  return exts.some(ext => filename.endsWith(ext))
}

/**
 * @param {string} filename
 * @param {string[]} [exts]
 * @returns {boolean} - Whether the file is a target CSS file.
 */
function isTargetCssFiles(filename, exts = targetCssExts) {
  return exts.some(ext => filename.endsWith(ext))
}

/**
 * @param {fs.PathLike} dir
 * @returns {{
 *  html: string[],
 *  js: string[],
 *  css: string[],
 * }} - A record of file paths.
 */
function scanDir(dir) {
  /** @type {string[]} */
  const html = []
  /** @type {string[]} */
  const js = []
  /** @type {string[]} */
  const css = []

  const files = getFiles(dir)

  for (const f of files) {
    if (isTargetHtmlFiles(f))
      html.push(f)
    else if (isTargetJsFiles(f))
      js.push(f)
    else if (isTargetCssFiles(f))
      css.push(f)
  }

  return { html, js, css }
}

/**
 * @param {string} str
 * @returns {Uint8Array} - A Uint8Array of the string.
 */
function strToUint8Array(str) {
  return new TextEncoder().encode(str)
}

/**
 * @returns {Promise<void>}
 */
async function postbuild() { // TODO refactor this function in async/await and map
  const { html, js, css } = scanDir('dist')

  if (html.length !== 0) {
    for (const h of html) {
      const content = fs.readFileSync(h, 'utf-8')
      const minified = minifyHtml(content, HTMLOptions)

      fs.writeFileSync(h, minified)
    }
  }

  if (js.length !== 0) {
    for (const j of js) {
      const content = fs.readFileSync(j, 'utf-8')
      const minified = await minifyJs(content, JSOptions)

      if (minified.code)
        fs.writeFileSync(j, minified.code)
    }
  }

  if (css.length !== 0) {
    for (const c of css) {
      const content = fs.readFileSync(c, 'utf-8')
      const code = strToUint8Array(content)
      transformCss({
        filename: c,
        code,
        minify: true,
      })
    }
  }
}

await postbuild().then(() => console.log('Postbuild completed.'))
