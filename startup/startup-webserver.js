var Service = require('node-windows').Service;

var svc = new Service({
  name: 'SoS Display Webserver',
  description: 'Sanctuary of Self Display Webserver.',
  script: 'C:\\Users\\James\\Desktop\\sos-display\\startup\\http-server'
});

svc.on('install',function(){
  svc.start();
});

svc.install();
