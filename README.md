![](https://img.shields.io/badge/release-v1.0.1-blue)
# Tool to list split and merge isx files

  Combine multiple isx files to one or split one in single asset files

## Installation
### Option 1
* Requirements:
  * nodejs >12
  * npm

Clone the repository and run npm install:
```
git clone https://gitlab.com/nsitbim/satellites/isxer.git
cd isxer
npm install
```


### Option 2

Download the latest prepackaged binary release: [v1.0.1](https://gitlab.com/nsitbim/satellites/isxer/uploads/98f87594c9ffdb806ff2b2a6def2f778/isxer)


:warning: Only prepackaged binaries are available for linux. Windows releases will be made available depending on demand.

## Synopsis

```
  $ isxer command split -i inputFile.isx -o outputfiles.isx
  $ isxer command merge -i inputFiles.isx -o outputfile.isx
  $ isxer command list  -i inputFile.isx
  $ isxer --help
```

## Options

```
  -v, --verbose
  -h, --help                 this message
  -i, --input string[]       source file(s)
  -o, --output string        output file
  -r, --recurse              recurse into directory
  -f, --filter string[]      filter for list or split
  -a, --attributes array[]   Attributes to show
  --format string            Output format(json,csv,table)
  -d, --delimiter string     csv format delimter
```


## split

```
  -i, --input InputFile.isx   Isx file to split (defaults to all isx files in current directory)
  -o, --output [name].isx     Target format with placeholders (defaults to [name].isx)
```
### Accepted placeholders

* `name`        Asset name
* `server`      Server name
* `project`     Project name
* `category`    Category (and all sub categories)
* `type`        Asset type extension (pjb,qjb,srt...)
* `dSJobType`   Numeric asset type (1, 2 ,3)
* `jobType`     Text Asset type (server, parallel...)
* `Y`           Year of last modification
* `M`           Month of last modification
* `D`           Day of last modification
* `H`           Hour of last modification
* `m`           Minute of last modification

## merge
```
  -i, --input InputFiles.isx   List of isx files to merge (accepts wildcards)
  -o, --output File.isx        Target file
```

## Examples

1. Split an isx                                        `$ isxer -i file.isx -o ./[name].isx`
2. Organise splited files according to categories       `$ isxer -i file.isx -o ./[category]/[name].isx`
3. Date splited files with the last modification date   `$ isxer -i file.isx -o ./[category]/[name].[Y][M][D].isx`
4. Merge two isx files in one                           `$ isxer -i file1.isx file2.isx -o merged.isx`
5. Merge all isx files present in current folder        `$ isxer -i *.isx -o merged.isx`
6. Same results as above                                `$ isxer -o merged.isx`
7. Same but will recurse in subfolders                  `$ isxer -o merged.isx -r`