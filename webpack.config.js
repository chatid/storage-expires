module.exports = {
  entry: {
    'storage-expires': './storage-expires'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd'
  }
};