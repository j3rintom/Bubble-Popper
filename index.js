const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
// declaring the player
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

// declaring the projectiles i.e the bullets
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    c.fillStyle = this.color;
    c.fill();
  }
  project() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}
// declaring the burst particles
const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  project() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

//  declaring the approaching enemy
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    c.fillStyle = this.color;
    c.fill();
  }
  project() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

//  funnction to spawn enemies randomly
function spawnEnemy() {
  setInterval(() => {
    let x, y;
    const radius = Math.random() * 26 + 4;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
      x = Math.random() * canvas.width;
    }
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const color = `hsl(${Math.random() * 360},50%,50%)`;
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}
const x = canvas.width / 2;
const y = canvas.height / 2;
let player = new Player(x, y, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
function init() {
  player = new Player(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  bigScore.innerHTML = score;
}
let animationId;
// animate function

const startCard = document.querySelector("#card");
const start = document.querySelector("#start");
const bigScore = document.querySelector("#bigScoreEl");
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.project();
    }
  });
  projectiles.forEach((projectile, index) => {
    projectile.project();
    // if projectiles out of screen dump it
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      console.log("removed");
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, index) => {
    enemy.project();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    //  enemy hit player

    if (dist - enemy.radius - player.radius < 1) {
      bigScore.innerHTML = score;
      startCard.style.display = "flex";
      cancelAnimationFrame(animationId);
    }
    projectiles.forEach((projectile, index1) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // projectile hit enemy

      if (dist - enemy.radius - projectile.radius < 1) {
        //  create explosion
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        if (enemy.radius - 10 > 10) {
          score += 100;
          scoreEl.innerHTML = score;
          gsap.to(enemy, { radius: enemy.radius - 10 });
          setTimeout(() => {
            projectiles.splice(index1, 1);
          }, 0);
        } else {
          score += 250;
          scoreEl.innerHTML = score;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(index1, 1);
          }, 0);
        }
      }
    });
  });
}

//  click listner

window.addEventListener("click", (e) => {
  const angle = Math.atan2(
    e.clientY - window.innerHeight / 2,
    e.clientX - window.innerWidth / 2
  );
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  const projectile = new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    "white",
    velocity
  );
  projectiles.push(projectile);
});
start.addEventListener("click", () => {
  init();
  animate();
  spawnEnemy();
  startCard.style.display = "none";
});
