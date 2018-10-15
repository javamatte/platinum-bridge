# platinum-bridge

A simple interface for communicating with a Hunter Douglas Platinum Bridge controlling Platinum (Power Rise) blinds

## Currently supported
- Query known devices and scenes and parse the results (`$dat` command)
- Position standard (topDown) blinds by percentage open
- Position two-rail (topDown/bottomUp) blinds by percentage

## Coming soon...
- Execute pre-existing scenes
- Create/Update scenes
- Queue multiple commands for simultaneous execution

## Example

Create a bridge instance:
``` javascript
const bridge = require('../platinum-bridge')({ address: 'Your Bridge IP' });
```

Connect to the bridge with a standard callback executed on connection:
``` javascript
bridge.connect(callback);
```

Set topDown/bottomUp blind's upper bar to 25% open
``` javascript
var shadeId = '01';
var position = 0.25;
var topDown = true;
bridge.setPosition(shadeId, position, topDown, callback);
```

## Tests
Well, that's embarrassing... there don't seem to be any.

## This library doesn't support \<feature_x\>, what can I do?
This library has the functionality I need to control the blinds I have. Feel free to add an issue if you need other functionality, or a pull request if you decide to implement yourself.

## License
MIT