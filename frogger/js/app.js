(function(){

/* Score object. Registers wins and crashes, and alerts subscriber callbacks */
window.score = {
    _crashes: 0,

    _wins: 0,

    _subscribers: [],

    win: function() {
        this._wins += 1;
        this.notify();
    },

    crash: function() {
        this._crashes += 1;
        this.notify();
    },

    subscribe: function(func) {
        this._subscribers.push(func);
    },

    notify: function() {
        var message = {
            crashes: this._crashes,
            wins: this._wins
        };
        this._subscribers.forEach(function(cb) {
            cb(message);
        });
    }
};


// Sprite class with methods common to enemies and players
var Sprite = function() {};

// Draw the sprite on the screen, required method for game
Sprite.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* Set a bounding box for a sprite, to facilitate collision detection, given
 * that the image may be larger than its visible portion.
 *
 * x_offset tells you the x coordinate of the top left corner of the box,
 * relative to the sprite's position at any time.
 *
 * y_offset tells you the y coordinate of the top left corner of the box,
 * relative to the sprite's position at any time
 */
Sprite.prototype._setBoundingBox = function(x_offset, y_offset, width, height) {
    var sprite = this;
    this.box = {
        // min is the top-left corner of the box
        min: {
            get x() {
                return sprite.x + x_offset;
            },
            get y() {
                return sprite.y + y_offset;
            }
        },
        // max is the bottom-right corner of the box
        max: {
            get x() {
                return sprite.x + x_offset + width;
            },
            get y() {
                return sprite.y + y_offset + height;
            }
        }
    }
};


// Collision algorithm from http://gamemath.com/2011/09/detecting-whether-two-boxes-overlap/
Sprite.prototype.intersects = function(other) {
    if (this.box.max.x < other.box.min.x) return false;
    if (this.box.min.x > other.box.max.x) return false;
    if (this.box.max.y < other.box.min.y) return false;
    if (this.box.min.y > other.box.max.y) return false;
    return true; // boxes overlap
};




// Enemies our player must avoid
var Enemy = function(speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    this._resetPosition();
    this.speed = speed;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // Specify bounding box for collision detection
    this._setBoundingBox(0, 95, 100, 50);
};

// Enemy is a subclass of Sprite
Enemy.prototype = Object.create(Sprite.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += dt * this.speed;

    // If enemy drives off screen right, reset the enemy and use again
    if (this.x >= ctx.canvas.width)
        this._resetPosition();
};

// Place bug on random lane
Enemy.prototype._resetPosition = function() {

    // Choose random lane, either 0, 1, or 2
    var lane = Math.floor((Math.random() * 3));

    this.y = ((lane + 1) + 65) + lane * 80;

    // x position starts just off screen left
    this.x = -92;
};



// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function() {

    this._resetPosition();
    this.sprite = 'images/char-boy.png';

    // Specify bounding box for collision detection
    this._setBoundingBox(25, 85, 65, 40);

};
// Player is a subclass of Sprite
Player.prototype = Object.create(Sprite.prototype);
Player.prototype.constructor = Player;

/* Put player back in start position */
Player.prototype._resetPosition = function() {
    this.row = 4;
    this.col = 2;
};

/* Check if the player is in collision with any enemies */
Player.prototype.checkCollisions = function() {
    for (var i = 0, max = allEnemies.length; i < max; i++) {
        if (this.intersects(allEnemies[i]))
            return true;
    }
    return false;
};

Player.prototype.handleInput = function(direction) {

    // Adjust column and row of player
    if (direction === 'left') {
        this.col--;
    } else if (direction === 'right') {
        this.col++;
    } else if (direction === 'up') {
        this.row--;
    } else {
        this.row++;
    }

    // Check if player has won
    if (this.row < 0) {
        // register win
        score.win();

        // Reset player position
        this._resetPosition();
    }

    // Keep player within bounds
    if (this.row > 4) {
        this.row--;
    }
    if (this.col > 4) {
        this.col--;
    }
    if (this.col < 0) {
        this.col++;
    }
    if (this.row < -1) {
        this.row++;
    }
};

Player.prototype.update = function() {
    // Update x and y coordinate of player based on row / column
    var base_y = 70;
    var base_x = 0;
    this.x = base_x + (100 * this.col);
    this.y = base_y + (80 * this.row);

    // Check for collisions
    if (this.checkCollisions()) {

        // register crash
        score.crash();

        // Put player back in start position
        this._resetPosition();
        this.update();
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

window.player = new Player();
window.allEnemies = [
    new Enemy(50),
    new Enemy(100),
    new Enemy(142),
    new Enemy(287)
];


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});


}());