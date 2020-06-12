var AdmZip = require('adm-zip')
var convert = require('xml-js')
const mkdirp = require('mkdirp')
const template = require('string-placeholder')
var archiver = require('archiver')
const fs = require('fs')
const path = require('path')
// var isexe = require('isexe')
var debug = require('debug')('isxer')

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
      var zip = new AdmZip(asset)
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

function SplitArtifact (name, options = {}) {
  var defaults = {
    target: './[project]/[category]/[name].isx',
    filter: {}
  }
  options = Object.assign({}, defaults, options)
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

    var jsonasset = convert.xml2js(artifact.readAsText(apath)).elements[0]
      .attributes
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
      var target = template(options.target, attributes, format)
      mkdirp.sync(path.dirname(target))
      var output = fs.createWriteStream(
        template(options.target, attributes, format)
      )
      var archive = archiver('zip')
      output.on('close', function () {
        if (options.nobins) {
          var zip = new AdmZip(template(options.target, attributes, format))

          zip.getEntries().forEach(function (zipEntry) {
            zip.extractEntryTo(
              zipEntry,
              path.dirname(template(options.target, attributes, format)),
              false,
              true
            )
          })
        }
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
        template('Extracting [name] to ' + options.target, attributes, format)
      )
      var newmanifest = emptymanifest
      newmanifest.elements[0].elements = [entry]
      archive.append(Buffer.from(convert.js2xml(newmanifest)), {
        name: 'META-INF/IS-MANIFEST.MF'
      })
      archive.append(artifact.readFile(apath), { name: apath })
      if (options.verbose) {
        console.log(apath)
      }

      if (artifact.getEntry(binary)) {
        archive.append(artifact.readFile(binary), { name: binary })
      }

      archive.finalize()
    }
  })
}

module.exports.mergeIsx = buildArtifact
module.exports.splitIsx = SplitArtifact
module.exports.ListAssets = ListAssets
