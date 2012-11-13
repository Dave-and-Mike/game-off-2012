/**
 * Represents a door which can be passed only when the state is set to true
 *
 * @author David North
 */
function door()
{
    //Set up the variables required by the sprite inheritance
    this.image = gamejs.image.load('img/door.png');

    var _size = this.image.getSize();
    this.rect = new gamejs.Rect([0, 0], [_size[0], _size[1]]);

    /**
     * Overrides the setState method of the parent so that the object changes
     * depending on whether it is on or off
     *
     * @param boolean state The state to apply
     *
     * @return door
     */
    this.setState = function( state ){
        //Only update if the state has actually changed
        if ( state != this.getState() )
        {
            if ( state )
            {
                this.rect.y -= (this.rect.height);
            }
            else
            {
                this.rect.y += (this.rect.height);
            }
        }

        //Update the state using the parent setState method
        return door.prototype.setState.call(this, state);
    }

    /**
     * Handles the collision between a playable and this object
     *
     * @return door
     */
    this.handleCollision = function( playable ){
        playerCollides(playable, this.rect);

        return this;
    }
}

//Set the parent of the door to io
include_once(['lib/io.js']);
door.prototype =  new io();
