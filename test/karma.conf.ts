// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

// var webpackConfig = require('../../build/webpack.test.conf')

// module.exports = function (config) {
//   config.set({
//     // to run in additional browsers:
//     // 1. install corresponding karma launcher
//     //    http://karma-runner.github.io/0.13/config/browsers.html
//     // 2. add it to the `browsers` array below.
//     browsers: ['PhantomJS'],
//     frameworks: ['mocha', 'sinon-chai'],
//     reporters: ['spec', 'coverage'],
//     files: ['./index.js'],
//     preprocessors: {
//       './index.js': ['webpack', 'sourcemap']
//     },
//     webpack: webpackConfig,
//     webpackMiddleware: {
//       noInfo: true
//     },
//     coverageReporter: {
//       dir: './coverage',
//       reporters: [
//         { type: 'lcov', subdir: '.' },
//         { type: 'text-summary' }
//       ]
//     }
//   })
// }



// Karma configuration
// Generated on Wed Feb 08 2017 10:44:29 GMT+0800 (中国标准时间)

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      './index.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    // 为测试文件添加 webpack preprocessors
    preprocessors: {
      './index.js': ['webpack', "sourcemap", 'coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
    coverageReporter: {
      type: 'html',
      dir: './coverage/'
    },
 

    // 添加以下部分
    webpack: {
      module: {
        rules: [{
          enforce: "post",
          test: /index\.js$/, // 源文件
          exclude: /(test|node_modules|bower_components)\//, // 排除的文件
          loader: 'istanbul-instrumenter-loader'
        }]
      }
    },
  })
}
