var webpackConfig = require('./webpack.config');

module.exports = function (config) {

  config.set({

    basePath: '',

    frameworks: ['mocha', 'sinon'],


    // Either target the testindex.js file to get one
    // big webpack bundle full of tests, which are then
    // run.  Or else, target individual test files
    // directly, in which case you get a webpack bundleOptions
    // for each test file.
    // https://github.com/webpack/karma-webpack

    // individual test bundles
    files: [
      'test/index.js'
    ],

    exclude: [],

    // individual test bundles
    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },

    client: {
      // https://github.com/karma-runner/karma/issues/961
      captureConsole: true,
      mocha: {
        ui: 'bdd'
      }
    },

    webpack: webpackConfig,

    plugins: [
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-phantomjs-launcher'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-safari-launcher'),
      require('karma-sauce-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-sinon')
    ],

    webpackServer: {
      stats: {
        colors: true
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false

  });

};
