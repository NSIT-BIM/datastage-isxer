const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')
const isxer = require('./lib/isxer')
// const fs = require('fs')
const recursive = require('recursive-readdir')
const path = require('path')
const cli = require('./options')
const debug = require('debug')('isxer')

var optionDefinitions = cli.optionDefinitions
var sections = cli.sections

function ignoreFunc (file, stats) {
  if (options.recurse) {
    return (path.extname(file) !== '.isx' && !stats.isDirectory()) || path.basename(file) === path.basename(options.output)
  } else {
    return path.dirname(file) !== '.' || path.extname(file) !== '.isx' || path.basename(file) === path.basename(options.output)
  }
}

async function listIsx (isxpath, options) {
  var test = await recursive(isxpath, ['.*', ignoreFunc]).then(
    (files) => {
      // console.log("files are", files);
      return files
    },
    function (error) {
      console.error('something exploded', error)
    }
  )
  return test
}

async function merge (options) {
  if (!options.output) {
    console.error('--output must be specified')
    process.exit(1)
  }
  optionDefinitions[optionDefinitions.findIndex((object) => object.name === 'input')] = {
    multiple: true,
    defaultValue: await listIsx('./', options),
    name: 'input',
    alias: 'i',
    type: String,
    description: 'source file(s)'
  }
  options = commandLineArgs(optionDefinitions)
  debug(options)

  isxer.mergeIsx({ isx: options.input }, options.output, options.verbose)
}

async function split (options) {
  if (!options.input) {
    console.error('--input must be specified')
    process.exit(1)
  }
  optionDefinitions[optionDefinitions.findIndex((object) => object.name === 'input')] = {
    multiple: false,
    name: 'input',
    alias: 'i',
    type: String,
    description: 'source file'
  }
  optionDefinitions[optionDefinitions.findIndex((object) => object.name === 'output')] = {
    name: 'output',
    alias: 'o',
    type: String,
    description: 'output files',
    defaultValue: './[category]/[name].isx'
  }
  options = commandLineArgs(optionDefinitions)
  debug(options)
  isxer.splitIsx(options.input, { target: options.output, filter: options.filter }, options.verbose)
}

function multiFilter (array, filters) {
  const filterKeys = Object.keys(filters)
  return array.filter((item) => {
    return filterKeys.every((key) => !!~item[key].search(new RegExp(filters[key], 'g')))
  })
}

var options = commandLineArgs(optionDefinitions)
const usage = commandLineUsage(sections)
if (options.verbose) { console.log(options) }

if (options.help || !options.command) {
  console.log(usage)
  process.exit(0)
}

if (options.command === 'split') {
  split(options)
}

if (options.command === 'merge') {
  merge(options)
}

if (options.command === 'list') {
  if (!options.input) {
    console.error('--input must be specified')
    process.exit(1)
  }
  optionDefinitions[optionDefinitions.findIndex(object => object.name === 'input')] = {
    multiple: false,
    name: 'input',
    alias: 'i',
    type: String,
    description: 'source file'
  }
  options = commandLineArgs(optionDefinitions)
  if (options.filter) {
    var filter = {}
    options.filter.map((f) => {
      filter[f.split('=')[0]] = f.split('=')[1]
    })
    options.filter = filter
  }
  debug(options)
  var list = isxer.ListAssets(options.input, options, options.verbose)
  if (options.filter) {
    list = multiFilter(list, options.filter)
  }

  if (options.format === 'json') {
    console.log(JSON.stringify(list))
  } else if (options.format === 'table') {
    console.table(list)
  } else if (options.format === 'csv') {
    var header = Object.keys(list[0])
    console.log(header.join(options.delimiter))
    list.map((l) => {
      console.log(header.map((c) => {
        return l[c]
      }).join(options.delimiter))
    })
  } else {
    console.log(list)
  }
}
