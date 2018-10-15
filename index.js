const net = require('net');

module.exports = function bridge(opt) {
  opt = opt || {};
  console.log('internal oiptions:\n', opt);

  var address = opt.address;
  var timeout = opt.timeout || 5000;
  var port = opt.port | 522;
  var socket;

  var connected;
  var devices;

  // export our "object" by returning all the accessible methods
  return {
    connect,
    displayDevices,
    getOptions,
    setPosition
  };

  function connect(callback) {
    if (connected) {
      console.log('already connected.');
      return callback();
    }

    if (!socket) {
      socket = new net.Socket();
      socket.on('close', () => {
        console.log('Connection closed.');
        connected = false;
      });
    }

    socket.connect(port, address, function() {
      console.log('Socket connected...');
      waitForResponse('HunterDouglas Shade Controller', function(err) {
        if (err) {
          return callback(err);
        }
        
        connected = true;
        
        // load the devices if necessary
        if (!devices) {
          console.log('Loading devices...');
          return getDevices(callback);
        }

        return callback();
      });
    });
  }

  function getDevices(callback) {
    // setup the listener for the command response
    socket.on('data', function(buffer) {
      // stop listening
      socket.removeAllListeners('data');

      // get the devices and status
      devices = parseDevices(new String(buffer).trim());

      return callback();
    });

    connect(function(err) {
      return err || socket.write('$dat'); 
    });
  }

  // add a listener and wait for the expected text
  function waitForResponse(text, callback) {
    var watchdog = setTimeout(() => {
      callback('Connect timed out.');
    }, timeout);

    socket.on('data', function(buffer) {
      var data = (new String(buffer)).trim().slice(2);
      if (data.indexOf(text) > -1) {
        // stop the watchdog timer and remove 'data' listeners
        clearTimeout(watchdog);
        socket.removeAllListeners('data');

        return callback();
      }
    });
  }

  function getOptions() {
    return opt;
  }

  function parseDevices(str) {
    var lines = str.split('\n\r').map((s) => {
      if (s.indexOf('$cr') >= 0) {
        var roomData = s.substr(5).split('-');
        return {
          id: roomData[0],
          name: roomData[3],
          type: 'room',
          model: roomData[1]
        };
      } else if (s.indexOf('$cs') >= 0) {
        var shadeData = s.substr(5).split('-');
        return {
          id: shadeData[0],
          name: shadeData[3],
          type: 'shade',
          position: 'unknown',
          roomId: shadeData[1]
        };
      } else {
        return;
      }
    }).filter((s) => s);

    return lines;
  }

  function setPosition(shadeId, percent, topDown, callback) {
    var position = ('00' + Math.round(255 * percent).toString()).slice(-3);
    var cmd = `$pss${shadeId}-${topDown ? '18' : '04'}-${position}`;

    // handler for the staged command response
    waitForResponse('$done', function(err) {
      if (err) {
        return callback(err);
      }

      // handler for the rls command response
      waitForResponse('$act00-00-', callback);
      // send the 'go' command ($rls)
      socket.write('$rls')
    });

    // stage the command
    console.log(`Sending command: ${cmd}`);
    socket.write(cmd);
  }

  function displayDevices() {
    var output = '';
    devices.filter(d => d.type === 'room').forEach(room => {
      output += `Room [${room.id}]:\t${room.name}\n`;
      devices.filter(d => d.type = 'shade' && d.roomId === room.id).forEach(shade => {
        output += `\tShade [${shade.id}]:\t${shade.name}\tPosition: ${shade.position}\n`;
      });
    });
    return output;
  }
};
