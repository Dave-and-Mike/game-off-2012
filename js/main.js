gamejs = require('gamejs');

//Preload all the required images
gamejs.preload([
    'img/bg.png','img/player.png', 'img/blank.png'
    ,'img/switch.png','img/door.png','img/goal.png'
]);

gamejs.ready(function() {

    var display = gamejs.display.setMode([800, 600]);

    //Ensure that all required files are included
    include_once([
        'lib/camera.js', 'lib/world.js', 'lib/lever.js', 'lib/door.js',
        'lib/gates/andGate.js', 'lib/gates/orGate.js', 'lib/gates/notGate.js',
        'lib/player.js', 'lib/block.js', 'lib/goal.js', 'lib/tooltip.js '
    ]);

    var mainSurface = gamejs.display.getSurface();
    var lvl         = new world();

    //Initialise the world
    lvl.init( mainSurface );

    // msDuration = time since last tick() call
    var tick = function(msDuration)
    {
        mainSurface.fill("#FFFFFF");

        //Handle user input
        lvl.handleInput();

        //Update the worlds objects
        lvl.update( msDuration );

        //Draw the new objects
        lvl.draw( mainSurface );
    };

    gamejs.time.fpsCallback(tick, this, 60);
});
