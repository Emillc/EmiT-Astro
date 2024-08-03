// @ts-check
import fs from 'node:fs'

/**
 * @param {fs.PathLike} dir - The directory to search.
 * @returns {string[]} - An array of file paths.
 */
export function getFiles(dir) {
  /** @type {string[]} */
  const results = []
  const files = fs.readdirSync(dir)

  for (const f of files) {
    const path = `${dir}/${f}`
    const stat = fs.statSync(path)
    stat.isDirectory() ? results.push(...getFiles(path)) : results.push(path)
  }

  return results
}
