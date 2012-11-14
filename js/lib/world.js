/**
 * Represents the game world, containing the game logic and sprites that
 * require rendering
 *
 * @author David North
 */
 include_once(['lib/camera.js','lib/player.js', 'lib/scorecard.js']);
function world()
{
    //The maximum X velocity a player can trvel (heading right)
    const MAX_X_VELOCITY = 200;

    //The maximum Y velocity a player can trvel (heading down)
    const MAX_Y_VELOCITY = 200;

    //The minimum X velocity a player can trvel (heading left)
    const MIN_X_VELOCITY = -250;

    //The minimum Y velocity a player can trvel (heading up)
    const MIN_Y_VELOCITY = -200;

    /**
     * @var boolean Whether the world has fully loaded
     */
    var _hasLoaded = false;

    var _levelComplete = false;

    var _gameTime = 0;

    var _scorecard = new scorecard();

    /**
     * @var camera The camera to use
     */
    var _camera = new camera( this );

    /**
     * @var gamejs.sprite.Sprite Represents the bounding box (and background)
     * of a level
     */
    var _level = new gamejs.sprite.Sprite();

    /**
     * @var player Represents the player
     */
    var _p  = new player();

    /**
     * @var gamejs.sprite.Group Represents all objects a player can
     * interact with
     */
    var _objects  = new gamejs.sprite.Group();

    var _goals = [];

    /**
     * Main initiation method. Must be called before using the object
     *
     * @param object mainSurface the surface that everything will be drawn to
     *
     * @return world
     */
    this.init = function( mainSurface )
    {
        _level.image = gamejs.image.load('img/bg.png');

        var _size = _level.image.getSize();
        _level.rect = new gamejs.Rect([0, 0], [_size[0], _size[1]]);

        _camera.setWidth( mainSurface.getSize()[0] );
        _camera.setHeight( mainSurface.getSize()[1] );

        $.ajax({
            "url": "js/lib/levels/level_1.js",
            "dataType": "json",
            "success": function(data){
                _loadLevel(data);
                _camera.focusOn(_p.getCurrentPlayable().rect, true);
                _hasLoaded = true;
            },
            "error": function(jqXHR, textStatus, errorThrown){
                throw errorThrown;
            }
        });

        return this;
    }

    this.getBoundingRect = function()
    {
        return _level.rect;
    }

    this.getObjects = function()
    {
        return [ _p.getPlayables(), _objects ]
    }

    this.getPlayer = function()
    {
        return _p;
    }

    /**
     * Handles user input and modifies the world objects accordingly
     *
     * @return world
     */
    this.handleInput = function()
    {
        if ( _hasLoaded && !_camera.isAnimating())
        {
            var self = this;

            //Loop through each game event (key presses mouse movements etc)
            gamejs.event.get().forEach(function(event){
                if ( !_levelComplete )
                {
                    var _currentPlayer = _p.getCurrentPlayable();

                    _p.handleInput(event);

                    if ( _p.getCurrentPlayable() != _currentPlayer )
                    {
                        _camera.focusOn(
                            _p.getCurrentPlayable().rect, true, true
                        );
                    }

                    _objects.forEach(function(obj){
                        if ( typeof(obj.handleInput) == 'function' )
                        {
                            obj.handleInput(self, event);
                        }
                    });
                }
            });
        }

        return this;
    }

    /**
     * Updates all objects within the world
     *
     * @param int msDuration The amount of time since the last update
     *
     * @return world
     */
    this.update = function( msDuration )
    {
        if ( _hasLoaded && !_levelComplete )
        {
            _gameTime += msDuration;

            //Apply the gravitational pull of the world
            _applyGravity();

            //Apply updates to the player and any objects in the world
            _p.update( msDuration );
            _objects.update( msDuration );

            var colliders =
                gamejs.sprite.groupCollide(_p.getPlayables(), _objects);

            for( var i = 0; i < colliders.length; i++ )
            {
                if ( typeof(colliders[i].b.handleCollision) == 'function' )
                {
                    colliders[i].b.handleCollision( colliders[i].a );
                }
            }

            //Update the level background with any animations or amends
            _level.update( msDuration );

            //Modify the camera position
            _camera.update ( msDuration );

            _levelComplete = true;
            for( var i = 0; i < _goals.length; i++ )
            {
                if ( !_goals[i].isActive() )
                {
                    _levelComplete = false;
                    break;
                }
            }

            if ( _levelComplete )
            {
                _scorecard.setTimeTaken(_gameTime / 1000);
                _scorecard.setClonesUsed(_p.getNumClones());
                _scorecard.show();
            }
        }

        return this;
    }

    /**
     * Draws all objects within the world
     *
     * @return this
     */
    this.draw = function ( mainSurface )
    {
        if ( _hasLoaded )
        {
            //Draw the level, collidables and non collidables, as these need to be
            //behind the player
            _level.draw ( mainSurface );
            _objects.draw( mainSurface );

            //Draw the player at the forefront of the level
            _p.draw( mainSurface );
        }

        return this;
    }

    /**
     * Loads the level data from an array, filling the worls with collidables
     * and ensuring it's playable
     */
    var _loadLevel = function( data, input )
    {
        var _hasPlayer = false;
        for ( var i = 0; i < data.length; i ++)
        {
            if ( data[i]['type'] == 'stats' )
            {
                _scorecard.setParForClones(data[i]['clonePar']);
                _scorecard.setParForTime(data[i]['timePar']);
            }
            else
            {
                var xAmount = 1;
                var yAmount = 1;

                if ( typeof(data[i]['repeat-x']) != 'undefined')
                {
                    xAmount = data[i]['repeat-x'];
                }

                if ( typeof(data[i]['repeat-y']) != 'undefined')
                {
                    yAmount = data[i]['repeat-y'];
                }

                for ( var x = 0; x < xAmount; x++ )
                {
                    for ( var y = 0; y < yAmount; y++ )
                    {
                        _addObjectToWorld(data[i], x, y, input);
                    }
                }
            }
        }
    }

    var _addObjectToWorld = function( data, x, y, input ){
        var obj = null;

        if ( 'tooltip' == data['type'] )
        {
            obj = new tooltip();
            obj.setDimensions(data['width'], data['height']);
            obj.setText(data['text']);
            _objects.add( obj );
        }
        else
        {
            switch ( data['type'] )
            {
                case 'block':
                case 'wall':
                    data['type'] = 'block';
                case 'lever':
                case 'door':
                case 'goal':
                    var type = data['type'];
                    obj      = new window[type]();
                    _objects.add( obj );

                    if ( 'goal' === type )
                    {
                        _goals.push( obj );
                    }
                    break;

                case 'player':
                    obj = _p.getCurrentPlayable();
            }
        }

        if ( null != obj )
        {
            if ( obj instanceof io )
            {
                if ( typeof(data['outputs']) !== 'undefined' )
                {
                    _loadLevel(data['outputs'], obj)
                }

                if ( typeof(input) !== 'undefined' )
                {
                    obj.addInput(input);
                }
            }
            var width  = obj.rect.width;
            var height = obj.rect.height;

            var xPos = (data['x'] + (width * x));
            var yPos = (data['y'] + (height * y));

            obj.setPosition( xPos, yPos );
        }
    }

    /**
     * Applies the gravitational pull of the world on all playables
     */
    var _applyGravity = function()
    {
        //Loop through each player and increase the Y velocity downward.
        //If the player is jumping, this has the affect of slowing the
        //player down. Otherwise the player is falling.
        _p.getPlayables().forEach(function(obj){
            obj.setVelocity( obj.getVelocity().x, (obj.getVelocity().y + 10) )

            //the velocity cannot exceed the maximums, so ensuer that the player
            //is not falling too fast
            _sanatiseVelocity(obj);
        });
    }

    /**
     * Ensures that the player is not travelling too fast ion any direction
     */
    var _sanatiseVelocity = function(obj)
    {
        //Get the current Velocity
        var velocity = obj.getVelocity();

        //Make sure that the X velocity is not too slow or fast
        velocity.x = Math.max( MIN_X_VELOCITY, velocity.x );
        velocity.x = Math.min( MAX_X_VELOCITY, velocity.x );

        //Make sure that the Y velocity is not too slow or fast
        velocity.y = Math.max( MIN_Y_VELOCITY, velocity.y );
        velocity.y = Math.min( MAX_Y_VELOCITY, velocity.y );

        //Update the players velocity
        obj.setVelocity( velocity.x, velocity.y );
    }
}