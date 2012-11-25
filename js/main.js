gamejs = require('gamejs');

//Preload all the required images
gamejs.preload([
    'img/bg.png','img/player.png', 'img/blank.png',
    'img/switch.png','img/door.png','img/goal.png',
    'img/platform-left.png','img/platform-right.png',
    'img/platform-middle.png'
]);

gamejs.ready(function() {

    var display = gamejs.display.setMode([800, 600]);

    //Ensure that all required files are included
    include_once([
        'lib/camera.js', 'lib/world.js', 'lib/lever.js', 'lib/door.js',
        'lib/gates/andGate.js', 'lib/gates/orGate.js', 'lib/gates/notGate.js',
        'lib/player.js', 'lib/block.js', 'lib/goal.js', 'lib/tooltip.js',
        'lib/platform.js'
    ]);

    var mainSurface = gamejs.display.getSurface();
    var lvl         = new world();
    var lvlNum      = 0;
    var self        = this;

    // msDuration = time since last tick() call
    var tick = function(msDuration){
        mainSurface.fill("#FFFFFF");

        //Handle user input
        lvl.handleInput();

        //Update the worlds objects
        lvl.update( msDuration );

        //Draw the new objects
        lvl.draw( mainSurface );
    };

    var nextLevel = function(event){
        if ( typeof(event) !== 'undefined' )
        {
            event.preventDefault();
        }

        lvlNum++;

        resetLevel();
        return false;
    };

    var resetLevel = function(event){
        if ( typeof(event) !== 'undefined' )
        {
            event.preventDefault();
        }

        lvl.init(lvlNum, mainSurface);
        return false;
    }

    $('.nextLevel').live('click', nextLevel);
    $('.resetLevel').live('click', resetLevel);

    //Initialise the first level
    nextLevel();

    gamejs.time.fpsCallback(tick, self, 60);
});
