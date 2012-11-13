/**
 * The end goal of the game. All of the goals present in the game need to be
 * active before the game is complete
 *
 * @author David North
 */
function goal()
{
    //Load the variables required by gamejs.sprite.Sprite
    goal.superConstructor.apply(this, [0, 0]);
    this.image = gamejs.image.load('img/block.png');

    var _size = this.image.getSize();
    this.rect = new gamejs.Rect([0, 0], [_size[0], _size[1]]);

    /**
     * @var boolean Whether the goal has been activated
     */
    var _active = false;

    /**
     * Sets the position of the object
     *
     * @param float x The X co-ordinate
     * @param float y The Y co-ordinate
     *
     * @return goal
     */
    this.setPosition = function(x, y){
        this.rect.x = x;
        this.rect.y = y;

        return this;
    }

    /**
     * Returns whether or not the goal has been activated
     *
     * @return boolean
     */
    this.isActive = function(){
        return _active;
    }

    /**
     * Updates the object, ready for the next draw request
     *
     * @param msDuration
     *
     * @return goal
     */
    this.update = function(msDuration){
        //The default state for thisobject is deactivated, unless a
        //player has collided with it
        _active = false;

        return this;
    }

    /**
     * Handles the collision between a playable and this object
     *
     * @return goal
     */
    this.handleCollision = function( playable ){
        //The player has collided with this goal, this means it
        //should be activated
        _active = true;

        return this;
    }
}

//Extend the playable object so that the parent is the sprite
gamejs.utils.objects.extend(goal, gamejs.sprite.Sprite);