
// It's just plain silly that the javascript Array doesn't already have this functionality.
Array.prototype.remove = function (obj) {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] === obj) {
            this.splice(i, 1);
            break;
        }
    };
};

Array.prototype.removeAll = function (objs) {
    for (var i = 0; i < objs.length; i++) {
        this.remove(objs[i]);
    };
};

// An Array customization for this game. Sometimes I'll want to pick some random 
// value from an Array.
Array.prototype.random = function (obj) {
    return this[Math.floor(this.length * Math.random())];
};

function randomInt(lowerBound, upperBound) {
    return Math.floor(lowerBound + (1 + upperBound - lowerBound) * Math.random()); 
}

function randomFloat(lowerBound, upperBound) {
    return lowerBound + (upperBound - lowerBound) * Math.random();
}

function sign(i) {
    return i === 0 ? 1 : i / Math.abs(i);
}

// Globals are generally a no no if I recall... but I honestly can't think of why they would 
// be in this case... 
var GAME_WIDTH;
var GAME_HEIGHT;
var TWO_PI = Math.PI * 2;
var DIRECTION = [-1, 1];

var Classification = {
    BACKGROUND: 0,
    RESOURCE: 1,
    MONSTER: 2,
    PLAYER: 3
};

// The idea here is to pull the colors, strokes, gradients, etc. out of the game logic and write
// something that just applies a theme to a canvas.  This will allow things like effects to apply 
// or override the visual representation of the game objects.
var DefaultTheme = {
    fillStyle: 'rgba(255,255,255,0.8)',
    strokeStyle: 'rgb(0,0,0)'
};

var BGCircleTheme = {
    fillStyle: 'rgba(255, 255, 255, 0.04)',
    shadowColor: 'rgba(255, 255, 255, 1.0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 5
}

var AmoebaTheme = {
    fillStyle: 'rgba(0,255,128,0.5)',
    strokeStyle: 'rgb(0,0,0)',
    lineWidth: 3
};

var BacteriumTheme = {
    fillStyle: 'rgba(128,0,255,0.7)',
    strokeStyle: 'rgb(0,0,0)',
    lineWidth: 3
};

// This is the base class for game objects like the player's amoeba, the enemy bacteria, and the various 
// resource motes that bounce around.
function GameObj(x, y, radius, game) {
    var obj = {};
    obj.x = x;
    obj.y = y;
    obj.radius = radius;
    obj.game = game;
    obj.name = 'Un-named';
    obj.mY = DIRECTION.random();
    obj.mX = DIRECTION.random();
    obj.direction = 0.78;
    obj.effect;
    obj.classification = Classification.BACKGROUND;
    obj.health = 1;
    obj.damage = 0;
    obj.theme = DefaultTheme;

    obj.addHealth = function(amt) {
        this.health += amt;
    };

    obj.calc = function () {
    };

    obj.draw = function (canvas) {
    };

    obj.applyTheme = function (canvas) {
        for (var property in this.theme) {
            canvas[property] = this.theme[property];
        }
    };

    return obj;
}

// The background was immensely boring, so I put something back there to make it less uncool. 
function BGCircle(game) {
    var circle = GameObj(
        Math.random() * GAME_WIDTH, 
        Math.random() * GAME_HEIGHT, 
        randomInt(Math.min(GAME_WIDTH, GAME_HEIGHT)/2, Math.max(GAME_WIDTH, GAME_HEIGHT)/2), 
        game);

    var alpha = randomFloat(0.02, 0.09);
    circle.theme = BGCircleTheme;

    circle.draw = function(canvas) {
        canvas.save();
        this.applyTheme(canvas);
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.radius, 0, TWO_PI, true);
        canvas.closePath();
        canvas.fill();
        canvas.restore();
    };

    circle.calc = function() {
        if (game.isXinbounds(this.x + this.mX)) {
            this.x += this.mX;
        }
        else {
            this.mX = -this.mX;
        }
        
        if (game.isYinbounds(this.y + this.mY)) {
            this.y += this.mY;
        }
        else {
            this.mY = -this.mY;
        }
    };

    return circle;
}


// Effects are things that can happen to an object.  Get some health, lose some, grow spikes, get a shield...
function Effect(game) {
    effect = {};
    effect.name = '???';
    effect.target;

    var step = 10;
    var lastStep;

    effect.r = 0;
    effect.g = 0;
    effect.b = 0;

    effect.apply = function () {
    };

    effect.setTarget = function (target) {
        this.target = target;
    }

    effect.draw = function (canvas) {
        var now = game.getTime();
        if (lastStep === undefined) {
            lastStep = game.getTime();
        }
        else if (now - lastStep > 100) {
            step -= 1;
            lastStep = now;
        }

        canvas.font = 'bold 20px verdana, sans-serif';
        canvas.fillStyle = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (1.0 * step / 10) + ')';
        canvas.textAlign = 'center';
        canvas.textBaseline = 'bottom';
        canvas.fillText(this.name, this.target.x, this.target.y - this.target.radius);
    };

    effect.isActive = function () {
        return step > 0;
    }

    return effect;
}

function HealingEffect(game) {
    effect = Effect(game);

    effect.health = randomInt(3, 25);
    var applied = false;

    effect.name = '+' + effect.health;
    effect.g = 200;

    effect.apply = function () {
        if (!applied) {
            this.target.addHealth(this.health);
            applied = true;
        }
    };

    return effect;
}

function HarmingEffect(game) {
    effect = HealingEffect(game);

    effect.health = -randomInt(3, 25);
    effect.name = effect.health;
    effect.g = 0;
    effect.r = 200;

    return effect;
}

function ShieldEffect(game) {
    effect = Effect(game);
    effect.name = 'Shield!';
    return effect;    
}

function SpikesEffect(game) {
    effect = Effect(game);
    effect.name = 'Spikes!';
    return effect;    
}

function VictoriousEffect(game) {
    effect = Effect(game);
    effect.name = 'Victorious!';
    return effect;        
}

// Motes are the little things that float around the game that can be eaten, they carry an Effect...
function Mote(x, y, game, color, effect) {
    var mote = GameObj(x, y, 3, game);

    mote.classification = Classification.RESOURCE;
    mote.effect = effect;
    mote.color = typeof color === undefined ? 'rgb(255, 0, 0)' : color;

    mote.draw = function(canvas) {
        canvas.save();
        canvas.fillStyle = mote.color;
        canvas.shadowColor = mote.color;
        canvas.shadowOffsetX = 0;
        canvas.shadowOffsetY = 0;
        canvas.shadowBlur = 5;
        canvas.beginPath();
        canvas.arc(mote.x, mote.y, mote.radius, 0, TWO_PI, true);
        canvas.closePath();
        canvas.fill();
        canvas.restore();
    };

    mote.calc = function() {
        if (game.isXinbounds(mote.x + mote.mX)) {
            mote.x += mote.mX;
        }
        else {
            mote.mX = -mote.mX;
        }
        
        if (game.isYinbounds(mote.y + mote.mY)) {
            mote.y += mote.mY;
        }
        else {
            mote.mY = -mote.mY;
        }
    };

    return mote;
}

// Produces a mote of random type when asked for one.
function MoteFactory() {
    var factory = {};
    var effects = [
            ['rgb(255,   0,   0)', HarmingEffect],
            ['rgb(0,   255,   0)', HealingEffect],
            ['rgb(0,     0, 255)', ShieldEffect],
            ['rgb(255, 255, 255)', SpikesEffect]
        ];

    factory.createMote = function(game) {
        var effect = effects.random(); 
        return Mote(
            randomInt(1, GAME_WIDTH -1), 
            randomInt(1, GAME_HEIGHT - 1), 
            game, 
            effect[0],
            effect[1](game));
    };

    return factory;
}


function drawEye(cgo, canvas, direction) {
    var eX = cgo.x + Math.round(Math.sin(direction) * 10);
    var eY = cgo.y + Math.round(Math.cos(direction) * 10);

    canvas.fillStyle = 'rgba(255,255,255,0.9)';
    canvas.strokeStyle = 'rgba(0,0,0,.5)';
    canvas.lineWidth = 1;
    canvas.beginPath();
    canvas.arc(eX, eY, cgo.radius/3, 0, TWO_PI, true);
    canvas.closePath();
    canvas.fill();
    canvas.stroke();

    canvas.fillStyle = 'rgba(0,0,0,0.9)';
    canvas.beginPath();
    canvas.arc(eX, eY, cgo.radius/6, 0, TWO_PI, true);
    canvas.closePath();
    canvas.fill();
    canvas.stroke();
}

// Shared logic for being affected by effects for use in both amoebas and bateriums
function EffectedGameObj(x, y, radius, game) {
    var sgo = GameObj(x, y, radius, game);
    sgo.activeEffects = [];

    sgo.addEffect = function(effect) {
        effect.setTarget(this);
        this.activeEffects.push(effect);
    };

    sgo.drawEffects = function (canvas) {
        for (var i = 0; i < this.activeEffects.length; i++) {
            this.activeEffects[i].draw(canvas);
        }
    }

    sgo.calcEffects = function () {
        var expiredEffects = [];
        for (var i = 0; i < this.activeEffects.length; i++) {
            effect = this.activeEffects[i];
            if (effect.isActive()) {
                effect.apply();
            }
            else {
                expiredEffects.push(effect);
            }
        };
        this.activeEffects.removeAll(expiredEffects);
    }

    return sgo;
}

function Amoeba(x, y, game) {
    var amoeba = EffectedGameObj(x, y, 20, game);
    amoeba.name = 'Amoeba';
    amoeba.classification = Classification.PLAYER;
    amoeba.health = 150;
    amoeba.damage = 7;
    amoeba.momentumMods = {};
    amoeba.mX = amoeba.mY = 0;
    amoeba.effect = VictoriousEffect(game);
    amoeba.theme = AmoebaTheme;

    amoeba.onKeydown = function (kpe) {
        switch (kpe.keyCode) {
            case 38: // up=38
            case 87: // W=87
                this.momentumMods[kpe.keyCode] = function() { amoeba.mY -= 20; };
                break;
            case 40: // down=40
            case 83: // S=83
                this.momentumMods[kpe.keyCode] = function() { amoeba.mY += 20; };
                break;
            case 37: // left=37
            case 65: // A=65
                this.momentumMods[kpe.keyCode] = function() { amoeba.mX -= 20; };
                break;
            case 39: // right=39
            case 68: // D=68
                this.momentumMods[kpe.keyCode] = function() { amoeba.mX += 20; };
                break;
        }
    };

    amoeba.onKeyup = function (kpe) {
        delete this.momentumMods[kpe.keyCode];        
    };

    amoeba.draw = function(canvas) {
        canvas.save();
        this.applyTheme(canvas);
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.radius, 0, TWO_PI, true);
        canvas.closePath();
        canvas.fill();
        canvas.stroke();

        drawEye(this, canvas, this.direction);

        this.drawEffects(canvas);

        canvas.restore();
    };

    amoeba.calc = function() {
        for (var key in this.momentumMods) {
            this.momentumMods[key](this);
        }

        // Calc position
        if (this.mX !== 0) {
            var dX = Math.floor(0.1 * this.mX);
            if (game.isXinbounds(this.x + dX + (sign(this.mX) * this.radius))) {
                this.mX += -5 * sign(this.mX);
                this.x += dX;                
            }
            else {
                this.mX = 0;
            }
        }
        if (this.mY !== 0) {
            var dY = Math.floor(0.1 * this.mY);
            if (game.isYinbounds(this.y + dY + (sign(this.mY) * this.radius))) {
                this.mY += -5 * sign(this.mY);
                this.y += dY;
            }
            else {
                this.mY = 0;
            }
        }

        this.radius = 10 + this.health * 0.10;

        this.direction = Math.atan2(this.mX, this.mY);

        game.checkConflicts(this);

        this.calcEffects();
    };

    return amoeba;
}


function Bacterium(x, y, game) {
    var bact = EffectedGameObj(x, y, 20, game);
    bact.name = 'Bacterium';
    bact.maxHealth = 150;
    bact.health = 150;
    bact.damage = 7;
    bact.classification = Classification.MONSTER;
    bact.mX = DIRECTION.random() * 100;
    bact.mY = DIRECTION.random() * 100;
    bact.effect = VictoriousEffect(game);
    bact.theme = BacteriumTheme;

    var maxMomentum = 300;
    var minMomentum = 100;
    var canAddMomentumX = true;
    var canAddMomentumY = true
    var nearest;

    bact.draw = function(canvas) {
        canvas.save();

        // DEBUGGING...
        if (nearest !== undefined) {
            canvas.beginPath();
            canvas.arc(nearest.x, nearest.y, nearest.radius + 10, 0, TWO_PI, true);
            canvas.stroke();
            canvas.closePath();
        }

        this.applyTheme(canvas);
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.radius, 0, TWO_PI, true);
        canvas.closePath();
        canvas.fill();
        canvas.stroke();

        drawEye(this, canvas, this.direction);

        this.drawEffects(canvas);

        canvas.restore();
    };

    bact.calc = function() {
        var minDistance;
        nearest = undefined;
        for (var x in game.interactiveObjects) {
            var obj =  game.interactiveObjects[x];
            if (obj !== this) {
                var d = Math.sqrt(((obj.x - this.x) * (obj.x - this.x)) + ((obj.y - this.y) * (obj.y - this.y)));
                if (minDistance === undefined || d < minDistance) {
                    minDistance = d;
                    nearest = obj;
                }
            }
        }

        if (nearest !== undefined) {
            // TODO cap momentum so this guy doesn't haul ass
            if (canAddMomentumX) {      
                this.mX += (nearest.x - this.x) * 0.5;
                if (Math.abs(this.mX) >= maxMomentum) {
                    this.mX = maxMomentum * sign(this.mX);
                    this.canAddMomentumX = false;
                }
            }

            if (canAddMomentumY) {
                this.mY += (nearest.y - this.y) * 0.5;
                if (Math.abs(this.mY) >= maxMomentum) {
                    this.mY = maxMomentum * sign(this.mY);
                    this.canAddMomentumY = false;
                }
            }

            this.direction = Math.atan2((nearest.x - this.x), (nearest.y - this.y));
        }

        var dX = 0.03 * this.mX;
        var dY = 0.03 * this.mY;

        // Bounce off the walls...
        if (game.isXinbounds(this.x + dX + (sign(this.mX) * this.radius))) {
            this.x += dX;
        }
        else {
            this.mX = -this.mX;
        }
        
        if (game.isYinbounds(this.y + dY + (sign(this.mY) * this.radius))) {
            this.y += dY;
        }
        else {
           this.mY = -this.mY;
        }

        // Reduce momentum
        var rX = -5 * sign(this.mX);
        var rY = -5 * sign(this.mY);
        if (Math.abs(this.mX + rX) > minMomentum) {
            this.mX += rX;
        }
        else {
            this.mX = minMomentum * sign(this.mX);
            this.canAddMomentumX = true;
        }

        if (Math.abs(this.mY + rY) > minMomentum) {
            this.mY += rY;
        }
        else {
            this.mY = minMomentum * sign(this.mY);
            this.canAddMomentumY = true;
        }

        this.radius = 10 + this.health * .10;

        game.checkConflicts(this);

        this.calcEffects();
    };

    return bact;
}

function Meter(target) {
    var radius = 15;
    var meter = GameObj(radius + 3, GAME_HEIGHT - (3 + radius),  radius, undefined);

    var healthMeterWidth = 200;
    var percentHealth = 100;
    var meterColor = 'rgba(0,255,96,0.4)';

    meter.calc = function() {
        percentHealth = target.health / target.maxHealth;

        if (percentHealth > 0.66) {
            meterColor = 'rgba(0,255,96,0.4)';        
        }
        else if(0.33 <= percentHealth && percentHealth <= 0.66) {
            meterColor = 'rgba(255,255,0,0.4)';    
        }
        else {
            meterColor = 'rgba(255,0,0,0.4)';
        }
    };

    meter.draw = function(canvas) {
        canvas.save();
        canvas.lineWidth = 2;
        canvas.fillStyle = 'rgba(255,255,255,0.3)';
        canvas.beginPath();
        canvas.moveTo(this.x + radius, this.y);
        canvas.lineTo(this.x+ (radius/2) + healthMeterWidth, this.y);
        // canvas.arc(this.x + healthMeterWidth, this.y + (radius/2), this.radius/2, Math.PI/2, 3*Math.PI/2, true);
        canvas.lineTo(this.x + (radius/2) + healthMeterWidth, this.y + radius);
        canvas.lineTo(this.x,  this.y + radius);
        
        canvas.fill();
        canvas.stroke();

        canvas.beginPath();
        canvas.moveTo(this.x + (radius/2), this.y + (radius/2));
        canvas.lineTo(this.x + (radius/2) + (percentHealth * healthMeterWidth), this.y + (radius/2));
        canvas.lineWidth = radius - 4;
        canvas.strokeStyle = meterColor;
        canvas.stroke();

        canvas.lineWidth = 2;
        canvas.fillStyle = target.color;
        canvas.strokeStyle = target.strokeStyle;
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.radius, 0, TWO_PI, true);
        canvas.closePath();
        canvas.fill();
        canvas.stroke();

        canvas.font = '12px verdana, sans-serif';
        canvas.textAlign = 'start';
        canvas.textBaseline = 'middle';
        canvas.fillStyle = 'rgba(0,0,0,.9)';
        canvas.fillText(target.health + '%', this.x + radius + 5, this.y + (radius/2));

        drawEye(this, canvas, 1.4);
        canvas.restore();
    };

    return meter;
}

function AmoebaGame(viewPort) {
    var game = {};
    var canvas = viewPort.getContext('2d');
    GAME_WIDTH = viewPort.width;
    GAME_HEIGHT = viewPort.height;

    var amoeba;
    var sprites = [];
    var garbage = [];
    var moteFactory = MoteFactory(game);
    var nextMoteTime = 0;
    var currentTime;

    game.interactiveObjects = [];

    game.isXinbounds = function(x) {
        return x < GAME_WIDTH && x > 0;
    };

    game.isYinbounds = function(y) {
        return y < GAME_HEIGHT && y > 0;
    };

    game.getTime = function() {
        return currentTime;
    };

    game.checkConflicts = function (aggressor) {
        for (var i in this.interactiveObjects) {
            var obj = this.interactiveObjects[i];
            if (obj !== aggressor) {
                if (((obj.x - aggressor.x) * (obj.x - aggressor.x)) + ((obj.y - aggressor.y) * (obj.y - aggressor.y)) <= aggressor.radius * aggressor.radius) {
                    game.conflict(aggressor, obj);
                }
            }
        }
    };

    game.conflict = function(aggressor, defender) {
        // NOTE: Only MONSTERs and PLAYERs initiate conflict and are therefore the aggressor

        // TODO - calculate a weight advantage for larger combatants

        if (defender.classification === Classification.RESOURCE) {
            aggressor.addEffect(defender.effect);
            this.removeObject(defender);            
        }
        else {
            var winner = aggressor;
            var loser = defender;

            if (Math.random() > 0.5) {
                winner = defender;
                loser = aggressor;
            }

            var win = HealingEffect(this);
            win.health = winner.damage;

            var loss = HarmingEffect(this);
            loss.health = -winner.damage;

            winner.addEffect(win);
            loser.addEffect(loss);
        } 
    };

    game.onKeydown = function (kpe) {
        amoeba.onKeydown(kpe);
    };

    game.onKeyup = function (kpe) {
        amoeba.onKeyup(kpe);
    };
    
    game.clear = function() {
        canvas.beginPath();
        canvas.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        canvas.closePath();
        canvas.fillStyle = canvas.createLinearGradient(0,0,0,GAME_HEIGHT);
        canvas.fillStyle.addColorStop(0.0, 'rgb(100,100,135)');
        canvas.fillStyle.addColorStop(1.0, 'rgb(100,135,100)');
        canvas.fill();
    };
    
    game.loop = function() {
        // Update game time
        currentTime = new Date().getTime();

        // Make all the sprites calculations
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].calc();
        }

        // Add some resources...
        if (nextMoteTime < game.getTime()) {
            game.addObject(moteFactory.createMote(game));
            nextMoteTime = game.getTime() + randomInt(7, 17) * 500;
        }

        // Clears the canvas
        game.clear();
        
        // Redraw all the sprites on the newly cleared canvas
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].draw(canvas);
        }

        // Ran into an issue of removing an object from an array while I was iterating 
        // through it... I presumed it was a concurrent modification style snafu, so I 
        // put this GC part in to avoid weird concurrent modification 
        game.collectGarbage();

        setTimeout(game.loop, 1000 / 50);
    };
    
    game.addObject = function(obj) {
        sprites.push(obj);
        if (obj.classification > Classification.BACKGROUND) {
            this.interactiveObjects.push(obj);
        }
    };

    game.removeObject = function(obj) {
        garbage.push(obj);
    };

    game.collectGarbage = function() {
        for (var i in garbage) {
            var obj = garbage[i];
            sprites.remove(obj);
            if (obj.classification > Classification.BACKGROUND) {
                this.interactiveObjects.remove(obj);
            }            
        }
        garbage = [];
    };

    game.start = function() {
        for (var i = 0; i < 3; i++) {
            this.addObject(BGCircle(this));
        }

        amoeba = Amoeba(100, 100, this);
        this.addObject(amoeba);
        // this.addObject(Meter(amoeba));
        this.addObject(Bacterium(GAME_WIDTH - 100, GAME_HEIGHT - 100, this));

        this.loop();
    };
    
    window.onkeydown = game.onKeydown;
    window.onkeyup = game.onKeyup;

    return game;
}

window.onload = function() {
    AmoebaGame(document.getElementById("viewPort")).start();
};