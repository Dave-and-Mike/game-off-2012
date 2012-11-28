gamejs = require('gamejs');
font   = require('gamejs/font');

//Preload all the required images
gamejs.preload([
    'img/splash-screen.png','img/new-game.png', 'img/bg.png','img/player.png',
    'img/blank.png','img/switch.png','img/door.png','img/goal.png',
    'img/platform-left.png','img/platform-right.png',
    'img/platform-middle.png', 'img/selected.png'
]);

gamejs.ready(function() {

    var display = gamejs.display.setMode([800, 600]);

    //Ensure that all required files are included
    include_once([
        'lib/startMenu.js'
    ]);

    var mainSurface = gamejs.display.getSurface();
    var mainWindow  = new startMenu();
    var self        = this;

    // msDuration = time since last tick() call
    var tick = function(msDuration){
        mainSurface.fill("#FFFFFF");

        //Handle user input
        mainWindow.handleInput( mainSurface );

        //Update the worlds objects
        mainWindow.update( msDuration );

        //Draw the new objects
        mainWindow.draw( mainSurface );
    };

    $('#preload').remove();
    gamejs.time.fpsCallback(tick, self, 60);
});
