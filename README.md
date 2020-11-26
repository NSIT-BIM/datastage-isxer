# Tool to list split and merge isx files

  Combine multiple isx files to one or split one in single asset files

## Installation

### Option 1

-   Requirements:
    -   nodejs >12
    -   npm

Clone the repository and run npm install:

    git clone https://gitlab.com/nsitbim/satellites/isxer.git
    cd isxer
    npm install

### Option 2 (standalone)

Download the latest prepackaged binary [artifact](https://gitlab.com/nsitbim/satellites/isxer/-/releases)

:warning: Only prepackaged binaries are available for linux. Windows releases can be made available.

## Synopsis

      $ isxer split -i inputFile.isx -o outputfiles.isx
      $ isxer merge -i inputFiles.isx -o outputfile.isx
      $ isxer list  -i inputFile.isx
      $ isxer version
      $ isxer --help

## Options

      -v, --verbose
      -h, --help                 this message
      -i, --input string[]       source file(s)
      -o, --output string        output file
      -r, --recurse              recurse into directory
      -f, --filter string[]      filter for list or split
      -a, --attributes array[]   Attributes to show
      --format string            Output format(json,csv,table)
      -d, --delimiter string     csv format delimter
      --suffix                   appends a suffix to asset names in output file

## split
Splits input isx file in multiple isx files (one per asset)

      -i, --input InputFile.isx   Isx file to split (defaults to all isx files in current directory)
      -o, --output [name].isx     Target format with placeholders (defaults to [name].isx)
      -f, --filter                Filter on attribute

### Accepted placeholders

-   `name`        Asset name
-   `server`      Server name
-   `project`     Project name
-   `category`    Category (and all sub categories)
-   `type`        Asset type extension (pjb,qjb,srt...)
-   `dSJobType`   Numeric asset type (1, 2 ,3)
-   `jobType`     Text Asset type (server, parallel...)
-   `Y`           Year of last modification
-   `M`           Month of last modification
-   `D`           Day of last modification
-   `H`           Hour of last modification
-   `m`           Minute of last modification

## merge

Combines multiple input isx files in one

      -i, --input InputFiles.isx   List of isx files to merge (accepts wildcards)
      -o, --output File.isx        Target file


## list
Prints metadata contents of input isx file

      -i, --input InputFiles.isx   List of isx files to merge (accepts wildcards)
      --format                     Format of list (json, csv, table)
      -d, --delimiter              Delimter string (for csv format)
      -a, --attributes             Attributes to print (name, path, server, project, category, type, executable)
      --filter                     Filter on attribute


## filter

The filter argument is an array of attribute=value options.

The value is a regular expression, so if the filter is `"name=job"` it will match all assets containing "job" in their name. 
To match an asset strictly named "job" the filter should be `"name=^job$"`

It is possible to pass multiple filters, it will act as an **AND**.

## Examples

1.  Split an isx                                        `$ isxer split -i file.isx`
2.  Organise splited files according to categories       `$ isxer split -i file.isx -o ./[category]/[name].isx`
3. Append "_backup" to assets names   `$ isxer split -i file.isx --suffix _backup`
3.  Date splited files with the last modification date   `$ isxer split -i file.isx -o ./[category]/[name].[Y][M][D].isx`
4.  Merge two isx files in one                           `$ isxer merge -i file1.isx file2.isx -o merged.isx`
5.  Merge all isx files present in current folder        `$ isxer merge -i *.isx -o merged.isx`
6.  Same results as above                                `$ isxer merge -o merged.isx`
7.  Same but will recurse in subfolders                  `$ isxer merge -o merged.isx -r`
8.  List content of isx file                  `$ isxer list -i file.isx`
9. List categories/names of isx file  `$ isxer list -i file.isx --attributes category name --format csv -d "/" `
10. List only parallel jobs in root folder "Job" `$ isxer list -i file.isx --filter "category=^Jobs" "type=sjb" `

## gitlab ci file example

```yaml
image: 'registry.gitlab.com/nsitbim/satellites/isxer:latest'

stages:
  - package

package:
    stage: package
    script:
        - isxer version
        - isxer merge -o merged.isx -r
        - ls -lrt *.isx
    artifacts:
        untracked: true
```