// @ts-nocheck
const fs = require('fs')
const gulp = require('gulp')
const gutil = require('gulp-util')
const webpack = require('webpack')
const babel = require('gulp-babel')
const uglify = require('uglify-js')
const docgenerator = require('./tools/docgenerator')

const ENTRY = './src/main.js'
const HEADER = './src/header.js'
const VERSION = './src/version.js'
const COMPILE_SRC = './src/**/*.js'
const COMPILE_LIB = './lib'
const FILE = 'math.js'
const FILE_MIN = 'math.min.js'
const FILE_MAP = 'math.min.map'
const DIST = __dirname + '/dist'
const REF_SRC = './lib/'
const REF_DEST = './docs/reference/functions'
const REF_ROOT = './docs/reference'
const MATH_JS = DIST + '/' + FILE

// generate banner with today's date and correct version
function createBanner () {
  const today = gutil.date(new Date(), 'yyyy-mm-dd') // today, formatted as yyyy-mm-dd
  const version = require('./package.json').version

  return String(fs.readFileSync(HEADER))
    .replace('@@date', today)
    .replace('@@version', version)
}

// generate a js file containing the version number
function updateVersionFile () {
  const version = require('./package.json').version

  // generate file with version number
  fs.writeFileSync(VERSION, 'module.exports = \'' + version + '\';\n' +
      '// Note: This file is automatically generated when building math.js.\n' +
      '// Changes made in this file will be overwritten.\n')
}

const bannerPlugin = new webpack.BannerPlugin({
  banner: createBanner(),
  entryOnly: true,
  raw: true
})

const webpackConfig = {
  entry: ENTRY,
  output: {
    library: 'math',
    libraryTarget: 'umd',
    path: DIST,
    globalObject: 'this',
    filename: FILE
  },
  externals: [
    'crypto' // is referenced by decimal.js
  ],
  plugins: [
    bannerPlugin
    // new webpack.optimize.ModuleConcatenationPlugin()
    // TODO: ModuleConcatenationPlugin seems not to work. https://medium.com/webpack/webpack-3-official-release-15fd2dd8f07b
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  optimization: {
    minimize: false
  },
  cache: true
}

const uglifyConfig = {
  sourceMap: {
    filename: FILE,
    url: FILE_MAP
  },
  output: {
    comments: /@license/
  }
}

// create a single instance of the compiler to allow caching
const compiler = webpack(webpackConfig)

gulp.task('bundle', [], function (cb) {
  // update the banner contents (has a date in it which should stay up to date)
  bannerPlugin.banner = createBanner()

  updateVersionFile()

  compiler.run(function (err, stats) {
    if (err) {
      gutil.log(err)
    }

    gutil.log('bundled ' + MATH_JS)

    cb()
  })
})

gulp.task('compile', function () {
  return gulp.src(COMPILE_SRC)
    .pipe(babel())
    .pipe(gulp.dest(COMPILE_LIB))
})

gulp.task('minify', ['bundle'], function () {
  const oldCwd = process.cwd()
  process.chdir(DIST)

  try {
    const result = uglify.minify({
      'math.js': fs.readFileSync(FILE, 'utf8')
    }, uglifyConfig)

    if (result.error) {
      throw result.error
    }

    fs.writeFileSync(FILE_MIN, result.code)
    fs.writeFileSync(FILE_MAP, result.map)

    gutil.log('Minified ' + FILE_MIN)
    gutil.log('Mapped ' + FILE_MAP)
  } catch (e) {
    throw e
  } finally {
    process.chdir(oldCwd)
  }
})

// test whether the docs for the expression parser are complete
gulp.task('validate', ['minify'], function (cb) {
  const child_process = require('child_process')

  // this is run in a separate process as the modules need to be reloaded
  // with every validation (and required modules stay in cache).
  child_process.execFile('node', ['./tools/validate'], function (err, stdout, stderr) {
    if (err instanceof Error) {
      throw err
    }
    process.stdout.write(stdout)
    process.stderr.write(stderr)
    cb()
  })
})

gulp.task('docs', ['compile'], function () {
  docgenerator.iteratePath(REF_SRC, REF_DEST, REF_ROOT)
})

// The watch task (to automatically rebuild when the source code changes)
// Does only generate math.js, not the minified math.min.js
gulp.task('watch', ['bundle', 'compile'], function () {
  gulp.watch(['index.js', 'src/**/*.js'], ['bundle', 'compile'])
})

// The default task (called when you run `gulp`)
gulp.task('default', ['bundle', 'compile', 'minify', 'validate', 'docs'])
