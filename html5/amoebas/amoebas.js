
// It's just plain silly that the javascript Array doesn't already have this functionality.
Array.prototype.remove = function (obj) {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] === obj) {
            this.splice(i, 1);
            break;
        }
    }
};

Array.prototype.removeAll = function (objs) {
    for (var i = 0; i < objs.length; i++) {
        this.remove(objs[i]);
    }
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
};

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

    obj.update = function () {
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

    circle.update = function() {
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
// Some effects can stack up and some cancel others out...
function Effect(game) {
    var effect = {};
    effect.name = '???';
    effect.canStack = true;
    effect.isEffectFilter = false;
    effect.isNullifying = false;
    effect.target;

    var step = 10;
    var lastStep;

    effect.r = 0;
    effect.g = 0;
    effect.b = 0;

    effect.apply = function () {
    };

    effect.filterEffect = function (effect) {
        return effect;
    };

    effect.setTarget = function (target) {
        this.target = target;
    };

    effect.textFade = function (canvas) {        
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

    effect.textFadeComplete = function() {
        return step <= 0;
    };

    effect.draw = function (canvas) {
        this.textFade(canvas);
    };

    effect.isActive = function () {
        return step > 0;
    };

    effect.copyProperties = function (otherEffect) {
    };

    return effect;
}

function HealingEffect(game, health) {
    var effect = Effect(game);
    effect.health = (health === undefined) ? randomInt(3, 25) : health;
    effect.name = '+' + effect.health;
    effect.g = 200;
    
    var applied = false;

    effect.apply = function () {
        if (!applied) {
            this.target.addHealth(this.health);
            applied = true;
        }
    };

    return effect;
}

function DamageEffect(game, health) {
    var effect = HealingEffect(game);
    effect.health = (health === undefined) ? -randomInt(3, 25) : -Math.abs(health);
    effect.name = effect.health;
    effect.g = 0;
    effect.r = 200;

    return effect;
}

function ShieldEffect(game) {
    var effect = Effect(game);
    effect.name = 'Shield!';
    effect.canStack = false;
    effect.isEffectFilter = true;

    effect.b = 255;

    var expires = game.getTime() + 9000;

    effect.isActive = function () {
        return expires > game.getTime();
    };

    effect.apply = function () {
    };

    effect.filterEffect = function (effect) {
        // Hackish... but serves the purpose...
        if (effect.name.toString().lastIndexOf('-', 0) === 0) {
            return BlockedEffect(game, effect);
        }
        return effect;
    };    

    effect.draw = function (canvas) {
        if (!this.textFadeComplete()) {
            this.textFade(canvas);
        }

        canvas.beginPath();
        canvas.lineWidth = 2;
        canvas.strokeStyle = 'rgba(0,0,255,0.5)';
        canvas.shadowColor = 'rgba(0,0,255, 1.0)';
        canvas.shadowOffsetX = 0;
        canvas.shadowOffsetY = 0;
        canvas.shadowBlur = 5;

        canvas.arc(this.target.x, this.target.y, this.target.radius + 5, 0, TWO_PI, true);

        canvas.stroke();
        canvas.closePath();
    };

    return effect;    
}

function BlockedEffect (game, blockedEffect) {
    var effect = Effect(game);
    effect.name = 'Blocked ' + blockedEffect.name;
    effect.isNullifying = true;
    return effect;
}

function SpikesEffect(game) {
    var effect = Effect(game);
    effect.name = 'Spikes!';
    effect.canStack = true;

    var expires = game.getTime() + 7000;

    effect.prevDamage;

    effect.setTarget = function (target) {
        this.target = target;
        this.prevDamage = target.damage;
        target.damage *= 3;
    };

    effect.isActive = function () {
        if (expires <= game.getTime()) {
            this.target.damage = this.prevDamage;
            return false;
        }
        return true;
    };

    effect.draw = function (canvas) {
        if (!this.textFadeComplete()) {
            this.textFade(canvas);
        }

        var circumference = TWO_PI * this.target.radius;
        var spikeCount = circumference / 10;
        var thetaInc = 2.0 / spikeCount;
        for (var theta = 0.0; theta < TWO_PI; theta += thetaInc) {
            canvas.beginPath();
            canvas.moveTo(
                this.target.x + this.target.radius * Math.cos(theta),
                this.target.y + this.target.radius * Math.sin(theta)
                );
            canvas.lineTo(
                this.target.x + (this.target.radius + 7) * Math.cos(theta),
                this.target.y + (this.target.radius + 7) * Math.sin(theta)
                );
            canvas.stroke();
            canvas.closePath();
        }
    };

    effect.copyProperties = function (otherEffect) {
        this.prevDamage = otherEffect.prevDamage;
    };

    return effect;    
}

function VictoriousEffect(game) {
    var effect = Effect(game);
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

    mote.update = function() {
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
            ['rgb(255,   0,   0)', DamageEffect],
            ['rgb(0,   255,   0)', HealingEffect],
            ['rgb(0,     0, 255)', ShieldEffect],
            ['rgb(0,     0,   0)', SpikesEffect]
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
    var pX = cgo.x + Math.round(Math.sin(direction) * 11);
    var pY = cgo.y + Math.round(Math.cos(direction) * 11);

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
    canvas.arc(pX, pY, cgo.radius/6, 0, TWO_PI, true);
    canvas.closePath();
    canvas.fill();
    canvas.stroke();
}


// Shared logic for being affected by effects for use in both amoebas and bacteriums
function EffectedGameObj(x, y, radius, game) {
    var sgo = GameObj(x, y, radius, game);
    sgo.activeEffects = [];

    sgo.addEffect = function(effect) {
        for (var i = this.activeEffects.length - 1; i >= 0; i--) {
            if (this.activeEffects[i].isEffectFilter) {
                effect = this.activeEffects[i].filterEffect(effect);
            }
        }

        if (!effect.canStack) {
            for (var i = this.activeEffects.length - 1; i >= 0; i--) {
                if (this.activeEffects[i].name === effect.name) {
                    effect.copyProperties(this.activeEffects[i]);
                    this.activeEffects.remove(this.activeEffects[i]);
                    break;
                }
            }
        }

        effect.setTarget(this);
        this.activeEffects.push(effect);
        // console.log('Added effect ' + effect.name + ' to ' + this.name);
        return !effect.isNullifying;
    };

    sgo.drawEffects = function (canvas) {
        for (var i = 0; i < this.activeEffects.length; i++) {
            this.activeEffects[i].draw(canvas);
        }
    };

    sgo.updateEffects = function () {
        var expiredEffects = [];
        for (var i = 0; i < this.activeEffects.length; i++) {
            var effect = this.activeEffects[i];
            if (effect.isActive()) {
                effect.apply();
            }
            else {
                expiredEffects.push(effect);
                // console.log('Removed expired effect ' + effect.name + ' from ' + this.name);          
            }
        }
        this.activeEffects.removeAll(expiredEffects);
    };

    sgo.clearActiveEffects = function () {
        this.activeEffects.length = 0;    
    };

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

    amoeba.reset = function () {
        this.health = 150;
        this.damage = 7;
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

    amoeba.update = function() {
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

        this.updateEffects();
    };

    return amoeba;
}


function Bacterium(x, y, game) {
    var bact = EffectedGameObj(x, y, 20, game);
    bact.name = 'Bacterium';
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
    var canAddMomentumY = true;
    var nearest;

    bact.draw = function(canvas) {
        canvas.save();

        // DEBUG targeting...
        // if (nearest !== undefined) {
        //     canvas.beginPath();
        //     canvas.arc(nearest.x, nearest.y, nearest.radius + 10, 0, TWO_PI, true);
        //     canvas.stroke();
        //     canvas.closePath();
        // }

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

    bact.update = function() {
        var minDistance;
        nearest = undefined;
        for (var x in game.interactiveObjects) {
            var obj =  game.interactiveObjects[x];
            if (obj !== this && obj.classification != Classification.MONSTER) {
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

        this.radius = 10 + this.health * 0.10;

        game.checkConflicts(this);

        this.updateEffects();
    };

    return bact;
}

function ScoreBoard (player, game) {
    var board = GameObj(3, 3, 1, game);

    var totalScore = 0;

    board.addScore = function (score) {
        totalScore += score;
    }; 

    board.draw = function (canvas) {
        canvas.font = 'bold italic 16px verdana, sans-serif';
        canvas.fillStyle = 'rgba(0,0,0,0.7)';
        canvas.textAlign = 'left';
        canvas.textBaseline = 'top';

        var scoreMsg = 'Score: ' + totalScore;

        canvas.fillText(scoreMsg, this.x, this.y);
    };

    return board;
}


function FPSCounter(game) {
    var counter = GameObj(3, GAME_HEIGHT - 3, 1, game);

    var lastCalculated = game.getTime();
    var frameCount = 0;
    var frameRate = 0;

    counter.draw = function (canvas) {
        var now = game.getTime();
        var elapsedTime = now / 1000 - lastCalculated / 1000; 
        if (elapsedTime > 1.0) {
            frameRate = frameCount / elapsedTime;
            frameCount = 0;
            lastCalculated = now;
        }
        frameCount++;

        canvas.font = 'bold italic 16px verdana, sans-serif';
        canvas.fillStyle = 'rgba(0,0,0,0.7)';
        canvas.textAlign = 'left';
        canvas.textBaseline = 'bottom';

        canvas.fillText('FPS: ' + frameRate.toFixed(2), this.x, this.y);
    };

    return counter;
}


function GameMessage(game, text, duration) {
    var message = GameObj(GAME_WIDTH/2, GAME_HEIGHT/2, 0, game);

    var expires;
    var step = 10;
    var lastStep;

    message.draw = function (canvas) {
        var now = game.getTime();
        if (now > expires) {
            if (lastStep === undefined) {
                lastStep = game.getTime();
            }
            else if (now - lastStep > 100) {
                step -= 1;
                lastStep = now;
            }
        }

        canvas.font = 'bold italic 24px verdana, sans-serif';
        canvas.fillStyle = 'rgba(0,0,0,' + (1.0 * step / 10) + ')';
        canvas.textAlign = 'center';
        canvas.textBaseline = 'middle';
        canvas.fillText(text, this.x, this.y);        
    };   

    message.doIt = function () {
        if (expires === undefined) {
            game.addObject(this);
            expires = game.getTime() + duration;
        }
        if (step <= 0) {
            game.removeObject(this);
            return true;
        }
        return false;
    };

    return message;
}

function DefferredCall(fn) {
    var defferred = {};

    defferred.doIt = function () {
        fn();
        return true;
    };

    return defferred; 
}

function AmoebaGame(viewPort) {
    var game = {};
    var canvas = viewPort.getContext('2d');
    GAME_WIDTH = viewPort.width;
    GAME_HEIGHT = viewPort.height;

    var scoreBoard;
    var amoeba;
    var monsters = [];
    var maxMonsters = 1;
    var sprites = [];
    var garbage = [];
    var moteFactory = MoteFactory(game);
    var nextMoteTime = 0;
    var currentTime = new Date().getTime();
    var startingNewRound = false;
    var serialTaskQueue = [];

    var messages = [
        ["Superb!", "Brilliant!", "Fantastic!", "Marvelous!", "Splendid!", "Magnificent!", "Stellar!"],
        ["Perhaps that was too easy.", "Maybe you need something more challenging.", "You don't suck as bad as Bowling said.", "Do it again, bug guy."]
    ];

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
            if (obj !== aggressor && obj.classification !== aggressor.classification) {
                if (((obj.x - aggressor.x) * (obj.x - aggressor.x)) + ((obj.y - aggressor.y) * (obj.y - aggressor.y)) <= aggressor.radius * aggressor.radius) {
                    game.conflict(aggressor, obj);
                }
            }
        }
    };

    game.conflict = function(aggressor, defender) {
        // NOTE: Only MONSTERs and PLAYERs initiate conflict and are therefore the aggressor
        // TODO - maybe calculate a weight advantage for larger combatants
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

            if (loser.addEffect(DamageEffect(this, winner.damage))) {
                if (winner.classification == Classification.PLAYER) {
                    scoreBoard.addScore(winner.damage);
                }
                else {
                    scoreBoard.addScore(-winner.damage);    
                }
                winner.addEffect(HealingEffect(this, winner.damage));
                if (loser.health <= 0) {
                    winner.addEffect(loser.effect);
                    this.removeObject(loser);

                    if (loser === amoeba) {
                        amoeba = undefined;
                    }
                }
            }
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
        requestAnimationFrame(game.loop);

        // Update game time
        currentTime = new Date().getTime();

        // Make all the sprites calculations
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].update();
        }

        // Add some resources...
        if (nextMoteTime < game.getTime()) {
            game.addObject(moteFactory.createMote(game));
            nextMoteTime = game.getTime() + randomInt(4, 17) * 500;
        }

        // Clears the canvas
        game.clear();

        if (monsters.length <= 0 && !startingNewRound) {
            startingNewRound = true;
            // ack they won one
            serialTaskQueue.push(GameMessage(game, messages[0].random(), 1500));
            // talk a little smack
            serialTaskQueue.push(GameMessage(game, messages[1].random(), 2500));
            // make more monsters
            serialTaskQueue.push(
                DefferredCall(
                    function() {
                        amoeba.reset();
                        maxMonsters += 1;
                        for (var i = 0; i < maxMonsters; i++) {
                            game.addObject(Bacterium(randomInt(100, GAME_WIDTH - 100), randomInt(100, GAME_HEIGHT - 100), game));
                        }
                        startingNewRound = false;
                    })
            );
        }

        if (amoeba === undefined) {
            // ack they lost
            serialTaskQueue.push(GameMessage(game, "Way to go...", 1500));
            // talk a little smack
            serialTaskQueue.push(GameMessage(game, "I'd slow clap for you if I had hands...", 2500));
            serialTaskQueue.push(GameMessage(game, "Maybe you'll do better next time.", 2500));
            amoeba = null;
        }

        // Give some cpu to the serial tasks
        if (serialTaskQueue.length > 0) {
            if (serialTaskQueue[0].doIt()) {
                serialTaskQueue.shift();
            }
        }
        
        // Redraw all the sprites on the canvas
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].draw(canvas);
        }

        // Ran into an issue of removing an object from an array while I was iterating 
        // through it... I presumed it was a concurrent modification style snafu, so I 
        // put this GC part in to avoid weird concurrent modification 
        game.collectGarbage();
    };

    game.addObject = function(obj) {
        sprites.push(obj);
        if (obj.classification > Classification.BACKGROUND) {
            this.interactiveObjects.push(obj);
        }
        if (obj.classification == Classification.MONSTER) {
            monsters.push(obj);
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
                monsters.remove(obj);
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
        
        scoreBoard = ScoreBoard(amoeba, this);
        this.addObject(scoreBoard);

        fpsCounter = FPSCounter(this);
        this.addObject(fpsCounter);

        this.addObject(Bacterium(randomInt(100, GAME_WIDTH - 100), randomInt(100, GAME_HEIGHT - 100), this));

        this.loop();
    };
    
    window.onkeydown = game.onKeydown;
    window.onkeyup = game.onKeyup;

    return game;
}

// Got this from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
var requestAnimationFrame = (function() {
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.onload = function() {
    AmoebaGame(document.getElementById("viewPort")).start();
};