class Game {
  constructor() {
    this.cvs = document.getElementById('bird');
    this.ctx = this.cvs.getContext('2d');
    this.frames = 0;
    this.DEGREE = Math.PI / 180;
    this.sprite = new Image();
    this.sprite.src = 'img/sprite.png';

    this.getReady = new GetReady(this.ctx, this.sprite, this.cvs.width, this.cvs.height);
    this.gameOver = new GameOver(this.ctx, this.sprite, this.cvs.width, this.cvs.height);

    this.SOUNDS = {
      SCORE_S: new Audio('audio/sfx_point.wav'),
      FLAP: new Audio('audio/sfx_flap.wav'),
      HIT: new Audio('audio/sfx_hit.wav'),
      SWOOSHING: new Audio('audio/sfx_swooshing.wav'),
      DIE: new Audio('audio/sfx_die.wav'),
    };

    this.state = {
      current: 0,
      getReady: 0,
      game: 1,
      over: 2,
    };

    this.startBtn = {
      x: 120,
      y: 263,
      w: 83,
      h: 29,
    };

    this.bg = new Background(this.ctx, this.sprite, this.cvs.width, this.cvs.height);
    this.fg = new Foreground(this.ctx, this.sprite, this.cvs.width, this.cvs.height);
    this.bird = new Bird(this.ctx, this.sprite, 50, 150);
    this.pipes = new Pipes(this.ctx, this.sprite, this.cvs.width, this.cvs.height);
    this.score = new Score(this.ctx, this.cvs.width, this.cvs.height);
    this.loop = this.loop.bind(this);
  }

  clickHandler(evt) {
    switch (this.state.current) {
      case this.state.getReady:
        this.state.current = this.state.game;
        this.SOUNDS.SWOOSHING.play();
        break;
      case this.state.game:
        if (this.bird.y - this.bird.radius <= 0) return;
        this.bird.flap();
        this.SOUNDS.FLAP.play();
        break;
      case this.state.over:
        let rect = this.cvs.getBoundingClientRect();
        let clickX = evt.clientX - rect.left;
        let clickY = evt.clientY - rect.top;

        if (
          clickX >= this.startBtn.x &&
          clickX <= this.startBtn.x + this.startBtn.w &&
          clickY >= this.startBtn.y &&
          clickY <= this.startBtn.y + this.startBtn.h
        ) {
          this.pipes.reset();
          this.bird.speedReset();
          this.score.reset();
          this.state.current = this.state.getReady;
        }
        break;
    }
  }

  draw() {
    this.ctx.fillStyle = '#70c5ce';
    this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);

    this.bg.draw();
    this.pipes.draw();
    this.fg.draw();
    this.bird.draw();

    if (this.state.current === this.state.getReady) {
      this.getReady.draw();
    } else if (this.state.current === this.state.over) {
      this.gameOver.draw();
    }

    this.score.draw();
  }

  update() {
    this.bird.update();
    this.fg.update();
    this.pipes.update();
  }

  loop() {
    this.update();
    this.draw();
    this.frames++;

    requestAnimationFrame(this.loop);
  }
}

class GetReady {
  constructor(ctx, sprite, cvsWidth, cvsHeight) {
    this.ctx = ctx;
    this.sprite = sprite;
    this.width = 173;
    this.height = 152;
    this.x = cvsWidth / 2 - this.width / 2;
    this.y = 80;
  }

  draw() {
    this.ctx.drawImage(
      this.sprite,
      0,
      228,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

class GameOver {
  constructor(ctx, sprite, cvsWidth, cvsHeight) {
    this.ctx = ctx;
    this.sprite = sprite;
    this.width = 225;
    this.height = 202;
    this.x = cvsWidth / 2 - this.width / 2;
    this.y = 90;
  }

  draw() {
    this.ctx.drawImage(
      this.sprite,
      175,
      228,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

class Background {
  constructor(ctx, sprite, cvsWidth, cvsHeight) {
    this.ctx = ctx;
    this.sprite = sprite;
    this.width = 275;
    this.height = 226;
    this.x = 0;
    this.y = cvsHeight - 226;
  }

  draw() {
    this.ctx.drawImage(
      this.sprite,
      0,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
    this.ctx.drawImage(
      this.sprite,
      0,
      0,
      this.width,
      this.height,
      this.x + this.width,
      this.y,
      this.width,
      this.height,
    );
  }
}

class Foreground {
  constructor(ctx, sprite, cvsWidth, cvsHeight) {
    this.ctx = ctx;
    this.sprite = sprite;
    this.width = 224;
    this.height = 112;
    this.x = 0;
    this.y = cvsHeight - 112;
    this.dx = 2;
  }

  draw() {
    this.ctx.drawImage(
      this.sprite,
      276,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
    this.ctx.drawImage(
      this.sprite,
      276,
      0,
      this.width,
      this.height,
      this.x + this.width,
      this.y,
      this.width,
      this.height,
    );
  }

  update() {
    if (game.state.current == game.state.game) {
      this.x = (this.x - this.dx) % (this.width / 2);
    }
  }
}

class Bird {
  constructor(ctx, sprite, x, y) {
    this.ctx = ctx;
    this.sprite = sprite;
    this.animation = [
      { sX: 276, sY: 112 },
      { sX: 276, sY: 139 },
      { sX: 276, sY: 164 },
      { sX: 276, sY: 139 },
    ];
    this.x = x;
    this.y = y;
    this.w = 34;
    this.h = 26;
    this.radius = 12;
    this.frame = 0;
    this.gravity = 0.25;
    this.jump = 4.6;
    this.speed = 0;
    this.rotation = 0;
  }

  draw() {
    let bird = this.animation[this.frame];

    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rotation);
    this.ctx.drawImage(
      this.sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h,
    );

    this.ctx.restore();
  }

  flap() {
    this.speed = -this.jump;
  }

  update() {
    this.period = game.state.current == game.state.getReady ? 10 : 5;
    this.frame += game.frames % this.period == 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;

    if (game.state.current == game.state.getReady) {
      this.y = 150;
      this.rotation = 0 * game.DEGREE;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;

      if (this.y + this.h / 2 >= game.cvs.height - game.fg.height) {
        this.y = game.cvs.height - game.fg.height - this.h / 2;
        if (game.state.current == game.state.game) {
          game.state.current = game.state.over;
          game.SOUNDS.DIE.play();
        }
      }

      if (this.speed >= this.jump) {
        this.rotation = 90 * game.DEGREE;
        this.frame = 1;
      } else {
        this.rotation = -25 * game.DEGREE;
      }
    }
  }

  speedReset() {
    this.speed = 0;
  }
}

class Pipes {
  constructor(ctx, sprite, cvsWidth, cvsHeight) {
    this.ctx = ctx;
    this.sprite = sprite;
    this.position = [];
    this.top = { sX: 553, sY: 0 };
    this.bottom = { sX: 502, sY: 0 };
    this.w = 53;
    this.h = 400;
    this.gap = 85;
    this.maxYPos = -150;
    this.dx = 2;
  }

  draw() {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      this.ctx.drawImage(
        this.sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h,
      );
      this.ctx.drawImage(
        this.sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h,
      );
    }
  }

  update() {
    if (game.state.current !== game.state.game) return;

    if (game.frames % 100 == 0) {
      this.position.push({
        x: game.cvs.width,
        y: this.maxYPos * (Math.random() + 1),
      });
    }

    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let bottomPipeYPos = p.y + this.h + this.gap;

      if (
        game.bird.x + game.bird.radius > p.x &&
        game.bird.x - game.bird.radius < p.x + this.w &&
        game.bird.y + game.bird.radius > p.y &&
        game.bird.y - game.bird.radius < p.y + this.h
      ) {
        game.state.current = game.state.over;
        game.SOUNDS.HIT.play();
      }

      if (
        game.bird.x + game.bird.radius > p.x &&
        game.bird.x - game.bird.radius < p.x + this.w &&
        game.bird.y + game.bird.radius > bottomPipeYPos &&
        game.bird.y - game.bird.radius < bottomPipeYPos + this.h
      ) {
        game.state.current = game.state.over;
        game.SOUNDS.HIT.play();
      }

      p.x -= this.dx;

      if (p.x + this.w <= 0) {
        this.position.shift();
        game.score.value += 1;
        game.SOUNDS.SCORE_S.play();
        game.score.best = Math.max(game.score.value, game.score.best);
        localStorage.setItem('best', game.score.best);
      }
    }
  }

  reset() {
    this.position = [];
  }
}

class Score {
  constructor(ctx, cvsWidth, cvsHeight) {
    this.ctx = ctx;
    this.best = parseInt(localStorage.getItem('best')) || 0;
    this.value = 0;
  }

  draw() {
    this.ctx.fillStyle = '#FFF';
    this.ctx.strokeStyle = '#000';

    if (game.state.current == game.state.game) {
      this.ctx.lineWidth = 2;
      this.ctx.font = '35px Teko';
      this.ctx.fillText(this.value, game.cvs.width / 2, 50);
      this.ctx.strokeText(this.value, game.cvs.width / 2, 50);
    } else if (game.state.current == game.state.over) {
      this.ctx.font = '25px Teko';
      this.ctx.fillText(this.value, 225, 186);
      this.ctx.strokeText(this.value, 225, 186);
      this.ctx.fillText(this.best, 225, 228);
      this.ctx.strokeText(this.best, 225, 228);
    }
  }

  reset() {
    this.value = 0;
  }
}

const game = new Game();
game.cvs.addEventListener('click', evt => game.clickHandler(evt));
game.loop();
