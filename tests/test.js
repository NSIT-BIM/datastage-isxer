
var origArgs = process.argv

console.log('first test')
var args = ['list', '-i', 'tests/test.isx']
process.argv = origArgs.concat(args)
console.log(process.argv)
require('../src/isxer-cli')
delete require.cache[require.resolve('../src/isxer-cli')]

console.log('second test')
args = ['list', '-i', 'tests/test.isx', '-f', 'name=Jx.*']
process.argv = origArgs.concat(args)
console.log(process.argv)
require('../src/isxer-cli')
delete require.cache[require.resolve('../src/isxer-cli')]

console.log('third test')
args = ['split', '-i', 'tests/test.isx', '-f', 'name=Jx.*']
process.argv = origArgs.concat(args)
console.log(process.argv)
require('../src/isxer-cli')
delete require.cache[require.resolve('../src/isxer-cli')]

setTimeout(function () {
  console.log('fourth test')
  args = ['merge', '-r', '-o', 'test2.isx']
  process.argv = origArgs.concat(args)
  console.log(process.argv)
  require('../src/isxer-cli')
  delete require.cache[require.resolve('../src/isxer-cli')]
}, 3000)
