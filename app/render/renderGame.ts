import { mainCanvas } from 'app/utils/canvas';

export function render(context: CanvasRenderingContext2D, state: GameState): void {
    context.fillStyle = 'black';
    context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    context.save();
        context.translate(-state.camera.x, -state.camera.y);
        for (const planet of state.planets) {
            renderPlanet(context, state, planet);
            renderGuidanceArrow(context, state, state.spaceship, planet, 'green');
        }
        for (const bullet of state.playerBullets) {
            renderBullet(context, state, bullet);
        }
        for (const asteroid of state.asteroids) {
            renderAsteroid(context, state, asteroid);
        }
        renderSpaceship(context, state, state.spaceship);
    context.restore();
}

function renderSpaceship(context: CanvasRenderingContext2D, state: GameState, ship: Spaceship) {
    context.save();
        context.translate(ship.x, ship.y);
        context.rotate(ship.rotation ?? 0);
        context.beginPath();
        context.moveTo(ship.size / 2, 0);
        context.lineTo(-ship.size / 2, ship.size / 2);
        context.lineTo(-ship.size / 2, -ship.size / 2);
        context.closePath();
        context.strokeStyle = '#fff';
        context.stroke();
    context.restore();
}

function renderPlanet(context: CanvasRenderingContext2D, state: GameState, planet: Planet) {
    context.save();
        // circle
        context.beginPath();
        context.arc(planet.x, planet.y, planet.size, 0, 2 * Math.PI);
        context.strokeStyle = planet.primaryColor ?? 'white';
        context.stroke();

        // squiggle
        context.beginPath();
        context.moveTo(planet.x + (2 * planet.size / 7), planet.y + (7*planet.size / 8));
        context.bezierCurveTo(
            planet.x - (planet.size / 2), planet.y + (planet.size / 2),
            planet.x - (planet.size), planet.y - (planet.size),
            planet.x - (planet.size / 2), planet.y - (planet.size / 2)
        );
        context.moveTo(planet.x - (planet.size / 2), planet.y - (planet.size / 2));
        context.bezierCurveTo(
            planet.x + (planet.size), planet.y + (planet.size),
            planet.x + (planet.size / 2), planet.y + (planet.size),
            planet.x + (planet.size / 2), planet.y - (planet.size / 2),
        );
        context.strokeStyle = planet.secondaryColor ?? 'white';
        context.stroke();
    context.restore();
}

function renderBullet(context: CanvasRenderingContext2D, state: GameState, bullet: Bullet) {
    context.beginPath();
    context.arc(bullet.x, bullet.y, bullet.size, 0, 2 * Math.PI);
    context.fillStyle = bullet.primaryColor ?? 'white';
    context.fill();
}

function renderAsteroid(context: CanvasRenderingContext2D, state: GameState, asteroid: Asteroid) {
    context.beginPath();
    context.arc(asteroid.x, asteroid.y, asteroid.size, 0, 2 * Math.PI);
    context.fillStyle = asteroid.secondaryColor ?? '#000';
    context.fill();
    context.strokeStyle = asteroid.primaryColor;
    context.stroke();
}

function renderGuidanceArrow(context: CanvasRenderingContext2D, state: GameState, source: Point, target: Point, color: string) {
    // Calculate angle and distance to the target
    const dy = target.y - source.y, dx = target.x - source.x;
    const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
    // Only render the arrow if the target is far away.
    if (distanceToTarget < 300) {
        return;
    }
    const nx = dx / distanceToTarget, ny = dy / distanceToTarget;
    const triangleX = source.x + 290 * nx;
    const triangleY = source.y + 290 * ny;

    context.save();
        context.beginPath();
        context.translate(triangleX, triangleY);
        context.rotate(Math.atan2(ny, nx));
        context.moveTo(10, 0);
        context.lineTo(-10, -5);
        context.lineTo(-10, 5);
        context.fillStyle = color;
        context.fill();
    context.restore();
}
