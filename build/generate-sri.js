#!/usr/bin/env node

/*!
 * Script to generate SRI hashes for use in our docs.
 * Remember to use the same vendor files as the CDN ones,
 * otherwise the hashes won't match!
 *
 * Copyright 2023 The superStrap Authors
 * Licensed under MIT (https://github.com/superstrap/superstrap/blob/main/LICENSE)
 */

'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const sh = require('shelljs')

sh.config.fatal = true

const configFile = path.join(__dirname, '../config.yml')

// Array of objects which holds the files to generate SRI hashes for.
// `file` is the path from the root folder
// `configPropertyName` is the config.yml variable's name of the file
const files = [
  {
    file: 'dist/css/superstrap.min.css',
    configPropertyName: 'css_hash'
  },
  {
    file: 'dist/css/superstrap.rtl.min.css',
    configPropertyName: 'css_rtl_hash'
  },
  {
    file: 'dist/js/superstrap.min.js',
    configPropertyName: 'js_hash'
  },
  {
    file: 'dist/js/superstrap.bundle.min.js',
    configPropertyName: 'js_bundle_hash'
  },
  {
    file: 'node_modules/@popperjs/core/dist/umd/popper.min.js',
    configPropertyName: 'popper_hash'
  }
]

for (const { file, configPropertyName } of files) {
  fs.readFile(file, 'utf8', (error, data) => {
    if (error) {
      throw error
    }

    const algo = 'sha384'
    const hash = crypto.createHash(algo).update(data, 'utf8').digest('base64')
    const integrity = `${algo}-${hash}`

    console.log(`${configPropertyName}: ${integrity}`)

    sh.sed('-i', new RegExp(`^(\\s+${configPropertyName}:\\s+["'])\\S*(["'])`), `$1${integrity}$2`, configFile)
  })
}
