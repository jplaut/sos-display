var Service = require('node-windows').Service;

var svc = new Service({
  name: 'SoS Kinect Server',
  description: 'Sanctuary of Self Kinect Server.',
  script: 'C:\\Users\\kinectdev\\Desktop\\sos-display\\kinect2-server\\index.js'
});

svc.on('install',function(){
  svc.start();
});

svc.install();
