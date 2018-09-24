const exec = require('child_process');

var threadClient = function startClient(count) {
  for(var i = 0; i < count - 1; i++){
    exec.fork('./client.js')
  }
};

module.exports = threadClient;
