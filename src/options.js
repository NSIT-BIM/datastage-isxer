const optionDefinitions = [
  { name: 'command'/*, group:'main' */, defaultOption: true },
  { name: 'verbose'/*, group:'main' */, alias: 'v', type: Boolean },
  { name: 'help'/*, group:'main' */, alias: 'h', type: Boolean, description: 'this message' },
  { name: 'input', multiple: true, alias: 'i', type: String, description: 'source file(s)' },
  { name: 'output', alias: 'o', type: String, description: 'output file' },
  { name: 'recurse', alias: 'r', type: Boolean, description: 'recurse into directory' },
  { name: 'filter', alias: 'f', multiple: true, type: String, description: 'filter for list or split' },
  { name: 'attributes', multiple: true, alias: 'a', defaultValue: ['name', 'path', 'server', 'project', 'category', 'type', 'executable'], type: Array, description: 'Attributes to show' },
  { name: 'format', type: String, description: 'Output format(json,csv,table)' },
  { name: 'delimiter', type: String, alias: 'd', defaultValue: ';', description: 'csv format delimter' },
  { name: 'suffix', alias: 's', type: String, description: 'suffix to add to object name on split' }
]

const sections = [
  {
    header: 'Tool to list split and merge isx files',
    content: 'Combine multiple isx files to one or split one in single asset files'
  },
  {
    header: 'Synopsis',
    content: [
      '$ isxer split -i inputFile.isx -o outputfiles.isx',
      '$ isxer merge -i inputFiles.isx -o outputfile.isx',
      '$ isxer list  -i inputFile.isx',
      '$ isxer {bold --help}'
    ]
  },
  {
    header: 'Options',
    optionList: optionDefinitions,
    group: ['_none']
  },
  {
    header: 'split',
    optionList: [
      {
        name: 'input',
        alias: 'i',
        typeLabel: '{underline InputFile.isx}',
        description: 'Isx file to split (defaults to all isx files in current directory)'
      },
      {
        name: 'output',
        alias: 'o',
        typeLabel: '{underline [name].isx}',
        description: 'Target format with placeholders (defaults to [name].isx)'
      }
    ]
  },
  {
    header: 'merge',
    optionList: [
      {
        name: 'input',
        alias: 'i',
        typeLabel: '{underline InputFiles.isx}',
        description: 'List of isx files to merge (accepts wildcards)'
      },
      {
        name: 'output',
        alias: 'o',
        typeLabel: '{underline File.isx}',
        description: 'Target file'
      }
    ]
  },
  {
    header: 'Accepted placeholders',
    content: [
      {
        desc: 'name',
        example: 'Asset name'
      },
      {
        desc: 'server',
        example: 'Server name'
      },
      {
        desc: 'project',
        example: 'Project name'
      },
      {
        desc: 'category',
        example: 'Category (and all sub categories)'
      },
      {
        desc: 'type',
        example: 'Asset type extension (pjb,qjb,srt...)'
      },
      {
        desc: 'dSJobType',
        example: 'Numeric asset type (1, 2 ,3)'
      },
      {
        desc: 'jobType',
        example: 'Text Asset type (server, parallel...)'
      },
      {
        desc: 'Y',
        example: 'Year of last modification'
      },
      {
        desc: 'M',
        example: 'Month of last modification'
      },
      {
        desc: 'D',
        example: 'Day of last modification'
      },
      {
        desc: 'H',
        example: 'Hour of last modification'
      },
      {
        desc: 'm',
        example: 'Minute of last modification'
      }
    ]
  },
  {
    header: 'Examples',
    content: [
      {
        desc: '1. Split an isx ',
        example: '$ isxer split -i file.isx -o ./[name].isx'
      },
      {
        desc: '2. Organise splited files according to categories',
        example: '$ isxer split -i file.isx -o ./[category]/[name].isx'
      },
      {
        desc: '3. Date splited files with the last modification date',
        example: '$ isxer split -i file.isx -o ./[category]/[name].[Y][M][D].isx'
      },
      {
        desc: '4. Merge two isx files in one',
        example: '$ isxer merge -i file1.isx file2.isx -o merged.isx'
      },
      {
        desc: '5. Merge all isx files present in current folder',
        example: '$ isxer merge -i *.isx -o merged.isx'
      },
      {
        desc: '6. Same results as above',
        example: '$ isxer merge -o merged.isx'
      },
      {
        desc: '7. Same but will recurse in subfolders',
        example: '$ isxer merge -o merged.isx -r'
      }
    ]
  }
]

module.exports.sections = sections
module.exports.optionDefinitions = optionDefinitions
