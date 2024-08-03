#!/usr/bin/env node
// @ts-check
import fs from 'node:fs'
import Fontmin from 'fontmin'

import { getFiles } from './utils.js'

/**
 * @type {string[]}
 */
const targetFontExts = ['.ttf', '.otf', '.woff', '.woff2', '.eot']

/**
 * @param {fs.PathLike} dir - The directory to search.
 * @param {string[]} [exts] - The fonts extensions to ignore.
 * @returns {Set<string>} - A set of unique characters.
 */
function scanDir(dir, exts = targetFontExts) {
  /** @type {Set<string>} */
  let set = new Set()
  const files = getFiles(dir)

  for (const f of files) {
    if (exts.some(ext => f.endsWith(ext)))
      continue

    const content = fs.readFileSync(f, 'utf-8')
    const currentSet = new Set(content)

    set = new Set([...set, ...currentSet])
  }

  return set
}

/**
 * @param {string} finalString - The final string to generate the final HTML.
 * @returns {void}
 */
function generateFinalHTML(finalString) {
  const fontmin = new Fontmin()
    .src('./public/fonts/*')
    .dest('./dist/fonts')
    .use(
      Fontmin.glyph({
        text: finalString,
        hinting: false,
      }),
    )

  fontmin.run((e) => {
    if (e)
      throw e
  })
}

/**
 * @returns {void}
 */
function fontmin() { // TODO refactor this function in async/await
  const set = scanDir('src')
  const finalString = Array.from(set).join('')

  generateFinalHTML(finalString)

  console.log('font minified!')
}

fontmin()
