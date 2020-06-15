var AdmZip = require('adm-zip')
var convert = require('xml-js')
const mkdirp = require('mkdirp')
const template = require('string-placeholder')
var archiver = require('archiver')
const fs = require('fs')
const path = require('path')
// var isexe = require('isexe')
var debug = require('debug')('isxer')
// const util = require('util')

const format = {
  before: '[',
  after: ']'
}

function multiFilter (array, filters) {
  const filterKeys = Object.keys(filters)
  return array.filter((item) => {
    return filterKeys.every((key) => !!~item[key].search(new RegExp(filters[key], 'g')))
  })
}

function buildArtifact (assets, name) {
  var output = fs.createWriteStream(name)
  var archive = archiver('zip')
  output.on('close', function () {})
  output.on('end', function () {})
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.log(err)
    } else {
      throw err
    }
  })
  archive.on('error', function (err) {
    throw err
  })
  archive.pipe(output)
  var manifest = {}

  assets.isx.forEach(function (asset) {
    debug(asset)
    if (asset !== name) {
      console.log('Adding:' + asset)
      try {
        var zip = new AdmZip(asset)
      } catch (ex) {
        debug(ex)
      }
      zip.getEntries().forEach(function (zipEntry) {
        if (zipEntry.entryName !== 'META-INF/IS-MANIFEST.MF') {
          debug(zipEntry.entryName)
          archive.append(zip.readFile(zipEntry.entryName), {
            name: zipEntry.entryName
          })
        }
      })
      var zipmanifest = convert.xml2js(zip.readAsText('META-INF/IS-MANIFEST.MF'))

      if (Object.keys(manifest).length === 0) {
        manifest = zipmanifest
      } else {
        manifest.elements[0].elements.push(zipmanifest.elements[0].elements[0])
      }
    }
  })

  // debug(manifest)
  var xmlmanifest = convert.js2xml(manifest)
  archive.append(Buffer.from(xmlmanifest), { name: 'META-INF/IS-MANIFEST.MF' })

  archive.finalize()
  return output
}

function ListAssets (name, options = {}) {
  var list = []

  var artifact = new AdmZip(name)

  var manifest = convert.xml2js(
    artifact
      .getEntry('META-INF/IS-MANIFEST.MF')
      .getData()
      .toString('utf8')
  )

  // debug(JSON.stringify(manifest, null, 2))

  manifest.elements[0].elements.forEach(function (entry) {
    debug(`->${entry.attributes.name}`)
    var apath = entry.attributes.path
    var element = {
      name: entry.attributes.name,
      path: apath,
      server: apath.split('/')[0],
      project: apath.split('/')[1],
      category: apath
        .split('/')
        .slice(2, -1)
        .join('/'),
      type: apath.split('.').slice(-1)[0],
      executable: entry.elements.filter(
        (t) =>
          t.name === 'additionalInfo' &&
          t.attributes.key === 'includeexecutable'
      )[0].attributes.value
    }
    var element2 = {}
    options.attributes.map((a) => {
      element2[a] = element[a]
    })
    list.push(element2)
  })
  return list
}

function SplitArtifact (options) {
  var name = options.input

  // options = Object.assign({}, defaults, options)
  if (options.filter) {
    var filter = {}
    options.filter.map((f) => {
      filter[f.split('=')[0]] = f.split('=')[1]
    })
    options.filter = filter
  }
  var artifact = new AdmZip(name)

  var manifest = convert.xml2js(
    artifact
      .getEntry('META-INF/IS-MANIFEST.MF')
      .getData()
      .toString('utf8')
  )
  var emptymanifest = JSON.parse(JSON.stringify(manifest))
  delete emptymanifest.elements[0].elements
  manifest.elements[0].elements.forEach(function (entry) {
    var attributes = {}
    var name = entry.attributes.name
    var apath = entry.attributes.path
    var binary =
      apath
        .split('.')
        .slice(0, -1)
        .join('.') + '.bin'
    attributes.name = name.replace(/:/g, '-')
    attributes.path = apath
    attributes.server = apath.split('/')[0]
    attributes.project = apath.split('/')[1]
    attributes.category = apath
      .split('/')
      .slice(2, -1)
      .join('/')
    attributes.type = apath.split('.').slice(-1)[0]
    var asset = convert.xml2js(
      artifact
        .getEntry(apath)
        .getData()
        .toString('utf8')
    )
    var jsonasset = asset.elements[0].attributes
    attributes.jobType = jsonasset.jobType
    attributes.dSJobType = jsonasset.dSJobType
    var lastModificationTimestamp = new Date(
      jsonasset.lastModificationTimestamp
    )
    attributes.lastModificationTimestamp = lastModificationTimestamp
    attributes.Y = lastModificationTimestamp.getFullYear()
    attributes.M =
      (lastModificationTimestamp.getMonth() + 1 < 10 ? '0' : '') +
      parseInt(lastModificationTimestamp.getMonth() + 1)
    attributes.D =
      (lastModificationTimestamp.getDate() < 10 ? '0' : '') +
      parseInt(lastModificationTimestamp.getDate())
    attributes.H = lastModificationTimestamp.getHours()
    attributes.m = lastModificationTimestamp.getMinutes()

    if (
      !options.filter ||
      multiFilter([attributes], options.filter).length > 0
    ) {
      // var asset=new AdmZip();
      if (options.suffix) {
        attributes.name = attributes.name + options.suffix
      }
      var target = template(options.output, attributes, format)
      debug(target)
      mkdirp.sync(path.dirname(target))
      var output = fs.createWriteStream(
        template(target, attributes, format)
      )
      var archive = archiver('zip')
      output.on('close', function () {
      })

      output.on('end', function () {

      })

      archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
          console.error(err)
        } else {
          throw err
        }
      })

      archive.on('error', function (err) {
        throw err
      })

      // pipe archive data to the file
      archive.pipe(output)

      console.log(
        template('Extracting [name] to ' + target, attributes, format)
      )
      var newmanifest = emptymanifest
      if (options.suffix) {
        entry.attributes.name = entry.attributes.name + options.suffix
        entry.attributes.path = entry.attributes.path.split('.')[0] + options.suffix + '.' + entry.attributes.path.split('.')[1]
        entry.elements = entry.elements.map(e => {
          if (e.name === 'id') {
            e.attributes.value = e.attributes.value.split('?')[0] + options.suffix + '?' + e.attributes.value.split('?')[1]
          }
          if (e.name === 'additionalInfo' && e.attributes.key === 'executablepath') {
          //  e.attributes.value = e.attributes.value.split('.')[0] + options.suffix + '.' + e.attributes.value.split('.')[1]
          }
          if (e.name === 'additionalInfo' && e.attributes.key === 'path') {
            e.attributes.value = e.attributes.value.split('.')[0] + options.suffix + '.' + e.attributes.value.split('.')[1]
          }
          return e
        }).filter(e => e.attributes.key !== 'executablepath' && e.attributes.key !== 'includeexecutable')
        asset.elements[0].attributes.name = asset.elements[0].attributes.name + options.suffix
        // debug(util.inspect(asset.elements[0].attributes, false, null, true))
      }
      // debug(util.inspect(entry.elements, false, null, true))
      newmanifest.elements[0].elements = [entry]
      archive.append(Buffer.from(convert.js2xml(newmanifest)), {
        name: 'META-INF/IS-MANIFEST.MF'
      })

      if (options.suffix) {
        archive.append(Buffer.from(convert.js2xml(asset, { spaces: 3, attributeValueFn: encode })), {
          name: entry.attributes.path
        })
      } else {
        archive.append(artifact.readFile(apath), { name: entry.attributes.path })
      }

      debug(entry.attributes.path)

      if (artifact.getEntry(binary) && !options.suffix) {
        archive.append(artifact.readFile(binary), { name: binary })
      }

      archive.finalize()
    }
  })
}

const encode = function (attributeValue) {
  return attributeValue.replace(/&quot;/g, '"') // convert quote back before converting amp
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\u001d/g, '&#x1D;')
    .replace(/\u001e/g, '&#x1E;')
    .replace(/\r/g, '&#xD;')
    .replace(/\n/g, '&#xA;')
    .replace(/'/g, '&apos;')
}

module.exports.mergeIsx = buildArtifact
module.exports.splitIsx = SplitArtifact
module.exports.ListAssets = ListAssets
