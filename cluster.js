var cluster = require('cluster');
var os = require('os');
var http = require('http');

//Get the No. of CPU
var numCPUs = os.cpus().length;

var workers = {};
if (cluster.isMaster) {
  // Main procss
  cluster.on('exit', function(worker){
    //When a operating processs died, reopen it
    delete workers[worker.pid];
      worker = cluster.fork();
      workers[worker.pid] = worker;
  });
  // Initialize the same number of process as CPUs
  for (var i=0; i<numCPUs; i++) {
    var worker = cluster.fork();
    worker[worker.pid] = worker;
  }
} else{
  //Operating procss, open the server

  app = require('./app');


}
//When the main process is over, close all process
process.on('SIGTERM', function(){
  for (var pid in workers){
    proces.kill(pid);
  }
  process.exit(0);
});
