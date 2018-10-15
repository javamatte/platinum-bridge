const bridge = require('../platinum-bridge')({ test: 'foo', address: '192.168.1.149' });

console.log('---Conecting...');

bridge.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('--- Connected!');
  console.log(bridge.displayDevices());

  var shadeId = '01';
  var position = 0.20;
  var topDown = true;
  bridge.setPosition(shadeId, position, topDown, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Set shade[${shadeId}] to ${position}% ${topDown ? ' (top down) ': ''}`);
  })
});
