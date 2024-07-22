#!/usr/bin/env node
import fs from 'node:fs'
import Fontmin from 'fontmin'

function getFiles(dir) {
  const results = []
  const files = fs.readdirSync(dir)

  for (const f of files) {
    const path = `${dir}/${f}`
    const stat = fs.statSync(path)
    stat.isDirectory() ? results.push(...getFiles(path)) : results.push(path)
  }

  return results
}

function scanDir(dir) {
  let set = new Set()
  const files = getFiles(dir)

  for (const f of files) {
    const fontExts = ['.ttf', '.otf', '.woff', '.woff2', '.eot']

    if (fontExts.some(ext => f.endsWith(ext)))
      continue

    const content = fs.readFileSync(f, 'utf-8')
    const currentSet = new Set(content)

    set = new Set([...set, ...currentSet])
  }

  return set
}

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

function main() {
  const set = scanDir('src')
  const finalString = Array.from(set).join('')

  generateFinalHTML(finalString)

  console.log('font minified!')
}

main()
