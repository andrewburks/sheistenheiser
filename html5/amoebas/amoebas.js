
var GAME_WIDTH;
var GAME_HEIGHT;

var TWO_PI = Math.PI * 2;

function randomIntInRange(min, max, excludeZero) {
    excludeZero = excludeZero === undefined ? false : true;
    while (true) {
        var x = Math.floor(min + (1 + max - min) * Math.random()); 
        if (x !== 0 || excludeZero !== undefined) {
            return x;
        }
    }
}

function randomFromArray(array) {
    return array[randomIntInRange(0, array.length-1, false)];
}

function randomFloatInRange(min, max) {
    return min + (max - min) * Math.random();
}

function removeObj(array, obj) {
    return array.slice(0, array.indexOf(obj)).concat(array.slice(array.indexOf(obj) + 1, array.length));
}

function sign(n) {
    return n === 0 ? 1 : n / Math.abs(n);
}

function GameObj(x, y, radius, game) {
    var obj = {};
    obj.x = x;
    obj.y = y;
    obj.radius = radius;
    obj.game = game;
    obj.name = 'unnamed';
    obj.mY = randomIntInRange(-1, 1);
    obj.mX = randomIntInRange(-1, 1);
    obj.direction = 0.78;
    obj.effect;
    obj.interactive = false;
    obj.color = obj.defaultColor = 'rgba(255,255,255,0.8)';
    obj.strokeStyle = obj.defaultStrokeStyle = 'rgb(0,0,0)';
    obj.maxHealth = 100;
    obj.health = 1;
    obj.damage = 0;

    obj.addHealth = function(amt) {
        if (this.health + amt > this.maxHealth) {
            this.health = this.maxHealth;
        }
        else {
            this.health += amt;
        }
    };

    return obj;
}

function BGCircle(game) {
    var circle = GameObj(
        Math.random() * GAME_WIDTH, 
        Math.random() * GAME_HEIGHT, 
        randomIntInRange(Math.min(GAME_WIDTH, GAME_HEIGHT)/2, Math.max(GAME_WIDTH, GAME_HEIGHT)/2), 
        game);

    var alpha = randomFloatInRange(0.02, 0.09);

    circle.draw = function(canvas) {
        canvas.save();
        canvas.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
        canvas.shadowColor = 'rgba(255, 255, 255, 1.0)';
        canvas.shadowOffsetX = 0;
        canvas.shadowOffsetY = 0;
        canvas.shadowBlur = 5;
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

function Mote(x, y, game, color, effect) {
    var mote = GameObj(x, y, 3, game);

    mote.interactive = true;
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

function MoteFactory() {
    var factory = {};

    var plus10health = function() {
        var fn = function(target) {
            target.addHealth(10);
        };
        fn.duration = 0;
        fn.effectId = "health";
        return fn;
    };

    var plus20health = function() {
        var fn = function(target) {
            target.addHealth(20);
        };
        fn.duration = 0;
        fn.effectId = "health";
        return fn;
    };

    var pain = function() {
        var fn = function(target) {
            target.addHealth(-10);
        };
        fn.duration = 0;
        fn.effectId = "pain";
        return fn;
    };

    var spikes = function(target){
        var fn = function(target) {
            // TODO how to pull this off?
        };
        fn.duration = 8000;
        fn.effectId = "spikes";
        return fn;
    };

    var effects = [
            ['rgb(255,   0,   0)', pain()],
            ['rgb(0,   255,   0)', plus10health()],
            ['rgb(0,     0, 255)', plus20health()],
            ['rgb(128,   0, 255)', spikes()]
        ];

    factory.createMote = function(game) {
        var effect = randomFromArray(effects); 
        return Mote(
            randomIntInRange(1, GAME_WIDTH -1), 
            randomIntInRange(1, GAME_HEIGHT - 1), 
            game, 
            effect[0],
            effect[1]);
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

function Amoeba(x, y, game) {
    var amoeba = GameObj(x, y, 20, game);
    amoeba.name = 'Amoeba';
    amoeba.interactive = true;
    amoeba.defaultColor = 'rgba(0,255,128,0.5)';
    amoeba.color = 'rgba(0,255,128,0.5)';
    amoeba.health = 100;
    amoeba.damage = 5;
    amoeba.momentumMods = {};
    amoeba.activeEffects = {};
    amoeba.mX = amoeba.mY = 0;

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
        canvas.fillStyle = this.color;
        canvas.strokeStyle = this.strokeStyle;
        canvas.lineWidth = 3;
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.radius, 0, TWO_PI, true);
        canvas.closePath();
        canvas.fill();
        canvas.stroke();

        drawEye(this, canvas, this.direction);
        canvas.restore();
    };

    amoeba.calc = function() {
        for (var key in this.momentumMods) {
            this.momentumMods[key](this);
        }

        // Apply active effects
        var expiredEffects = [];
        for (var key in this.activeEffects) {
            var effect = this.activeEffects[key];
            if (effect.expires < game.getTime()) {
                effect(this);
            }
            else {
                expiredEffects.push(key);
            }
        }

        for (var key in expiredEffects) {
            delete this.activeEffects[expiredEffects[key]];
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

        this.direction = Math.atan2(this.mX, this.mY);

        game.checkConflicts(this);
    };

    amoeba.addEffect = function(effect) {
        if (effect) {
            if (effect.duration > 0) {
                this.activeEffects[effect.effectId] = effect;
                effect.expires = effect.duration + game.getTime();
            }
            else {
                effect(this);    
            }
        }
    };

    return amoeba;
}

function Bacterium(x, y, game) {
    var bact = GameObj(x, y, 20, game);
    bact.name = 'Bacterium';
    bact.defaultColor = 'rgba(128,0,255,0.7)';
    bact.color = 'rgba(128,0,255,0.7)';
    bact.maxHealth = 150;
    bact.health = 150;
    bact.damage = 7;
    bact.interactive = true;
    bact.mY = randomFromArray([-100, 100]);
    bact.mX = randomFromArray([-100, 100]);

    bact.draw = function(canvas) {
        canvas.save();
        canvas.fillStyle = bact.color;
        canvas.strokeStyle = bact.strokeStyle;
        canvas.lineWidth = 3;
        canvas.beginPath();
        canvas.arc(bact.x, bact.y, bact.radius, 0, TWO_PI, true);
        canvas.closePath();
        canvas.fill();
        canvas.stroke();

        drawEye(this, canvas, this.direction);
        canvas.restore();
    };

    bact.calc = function() {
        var newDirection = false;

        var dX = 0.01 * bact.mX;
        var dY = 0.01 * bact.mY;

        if (game.isXinbounds(bact.x + dX + (sign(bact.mX) * bact.radius))) {
            bact.x += dX;
        }
        else {
            bact.mX = -bact.mX;
            newDirection = true;
        }
        
        if (game.isYinbounds(bact.y + dY + (sign(bact.mY) * bact.radius))) {
            bact.y += dY;
        }
        else {
           bact.mY = -bact.mY;
           newDirection = true;
        }

        if (newDirection) {
            bact.direction = Math.PI / 180 *Math.atan2(bact.mY - dY, bact.mX - dX);
        }

        game.checkConflicts(this);
    };

    bact.addEffect = function(effect) {
        if (effect) {
            effect(this);
        }
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
        canvas.lineTo(this.x + radius + healthMeterWidth, this.y);
        canvas.lineTo(this.x + radius + healthMeterWidth, this.y + radius);
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

        drawEye(this, canvas, 0.78);
        canvas.restore();
    };

    return meter;
}

function AmoebaGame(petriDish) {
    var game = {};
    var canvas = petriDish.getContext('2d');
    GAME_WIDTH = petriDish.width;
    GAME_HEIGHT = petriDish.height;

    var amoeba;
    var sprites = [];
    var garbage = [];
    var moteFactory = MoteFactory(game);
    var nextMoteTime = 0;

    game.interactiveObjects = [];

    game.isXinbounds = function(x) {
        return x < GAME_WIDTH && x > 0;
    };

    game.isYinbounds = function(y) {
        return y < GAME_HEIGHT && y > 0;
    };

    game.getTime = function() {
        return new Date().getTime();
    };

    game.checkConflicts = function (aggressor) {
        for (var i in this.interactiveObjects) {
            var obj = this.interactiveObjects[i];
            if (obj !== aggressor) {
                if (((obj.x - aggressor.x) * (obj.x - aggressor.x)) + ((obj.y - aggressor.y) * (obj.y - aggressor.y)) <= aggressor.radius * aggressor.radius) {
                    game.conflict(aggressor, obj);
                }
                else {
                    aggressor.color = aggressor.defaultColor;
                }
            }
        }
    };

    game.conflict = function(obj1, obj2) {
        obj1.addHealth(-obj2.damage);
        obj2.addHealth(-obj1.damage);

        if (obj1.health <= 0 && obj2.health > 0) {
            obj2.addEffect(obj1.effect);
            this.removeObject(obj1);
        }
        else if (obj2.health <= 0 && obj1.health > 0) {
            obj1.addEffect(obj2.effect);
            this.removeObject(obj2);
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
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].calc();
        }

        if (nextMoteTime < game.getTime()) {
            game.addObject(moteFactory.createMote(game));
            nextMoteTime = game.getTime() + randomIntInRange(7, 17) * 500;
        }

        game.clear();
        
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].draw(canvas);
        }

        game.collectGarbage();

        setTimeout(game.loop, 1000 / 50);
    };
    
    game.addObject = function(obj) {
        sprites.push(obj);
        if (obj.interactive) {
            this.interactiveObjects.push(obj);
        }
    };

    game.removeObject = function(obj) {
        garbage.push(obj);
    };

    game.collectGarbage = function() {
        for (var i in garbage) {
            var obj = garbage[i];
            sprites = removeObj(sprites, obj);
            if (obj.interactive) {
                this.interactiveObjects = removeObj(this.interactiveObjects, obj);
            }            
        }
        garbage = [];
    };

    game.start = function() {
        // A little less boring background
        for (var i = 0; i < 3; i++) {
            this.addObject(BGCircle(this));
        }

        // We need an amoeba
        amoeba = Amoeba(100, 100, this);
        this.addObject(amoeba);
        this.addObject(Meter(amoeba));
        this.addObject(Bacterium(GAME_WIDTH - 100, GAME_HEIGHT - 100, this));

        this.loop();
    };
    
    window.onkeydown = game.onKeydown;
    window.onkeyup = game.onKeyup;

    return game;
}

window.onload = function() {
    AmoebaGame(document.getElementById("petriDish")).start();
};