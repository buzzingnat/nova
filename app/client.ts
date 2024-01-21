import { render } from 'app/render/renderGame';
import { getState } from 'app/state';
import { mainCanvas, mainContext } from 'app/utils/canvas';
import { getDistance } from 'app/utils/geometry';
import { query } from 'app/utils/dom';
import { addKeyboardListeners, isGameKeyDown, updateKeyboardState } from 'app/utils/userInput';
import { addContextMenuListeners, bindMouseListeners, isMouseDown, isRightMouseDown, getMousePosition } from 'app/utils/mouse';

import {
    ASTEROID_CULLING_DISTANCE,
    ASTEROID_GENERATION_DISTANCE_RANGE,
    BULLET_CULLING_DISTANCE, FRAME_LENGTH, GAME_KEY
} from 'app/constants';


function initializeGame(state: GameState) {
    bindMouseListeners();
    addContextMenuListeners();
    addKeyboardListeners();
    query('.js-loading')!.style.display = 'none';
    query('.js-gameContent')!.style.display = '';
    state.gameHasBeenInitialized = true;

    state.spaceship.x = mainCanvas.width / 2;
    state.spaceship.y = mainCanvas.height / 2;
}

function update(): void {
    const state = getState();
    if (!state.gameHasBeenInitialized) {
        initializeGame(state);
    }
    updateKeyboardState(state);
    updateMouseState(state);
    updatePlayerSpaceship(state);
    updateBullets(state);
    updateAsteroids(state);

    state.camera.x = state.spaceship.x - mainCanvas.width / 2;
    state.camera.y = state.spaceship.y - mainCanvas.height / 2;
}

function updateMouseState(state: GameState) {
    if (isMouseDown()) {
        const mouseClick = getMousePositionInUniverse(state);
        console.log({x: mouseClick[0], y: mouseClick[1]});
        state.mouse.x = mouseClick[0];
        state.mouse.y = mouseClick[1];
    }
}

function getMousePositionInUniverse(state: GameState) {
    const mousePosition = getMousePosition(mainCanvas);
    const camera = state.camera;
    const x: number = mousePosition[0] + camera.x;
    const y: number = mousePosition[1] + camera.y;
    return [x, y];
}

function updateBullets(state: GameState) {
    for (let i = 0; i < state.playerBullets.length; i++) {
        const bullet = state.playerBullets[i];
        bullet.x += bullet.velocity.x;
        bullet.y += bullet.velocity.y;
        if (getDistance(state.spaceship, bullet) > BULLET_CULLING_DISTANCE) {
            state.playerBullets.splice(i--, 1);
            return;
        }
    }
}

function updateAsteroids(state: GameState) {
    for (let i = 0; i < state.asteroids.length; i++) {
        const asteroid = state.asteroids[i];
        asteroid.x += asteroid.velocity.x;
        asteroid.y += asteroid.velocity.y;
        if (getDistance(state.spaceship, asteroid) > ASTEROID_CULLING_DISTANCE) {
            state.asteroids.splice(i--, 1);
            return;
        }
    }
    while (state.asteroids.length < 5) {
        state.asteroids.push(createAsteroid(state));
    }
}

function updatePlayerSpaceship(state: GameState) {
    // find dy and dx between click and spaceship
    const moveDeltaX = state.mouse.x - state.spaceship.x;
    const moveDeltaY = state.mouse.y - state.spaceship.y;
    // use that in formula: atan2(dx, dy) to get angle
    const targetAngle = Math.atan2(moveDeltaX, moveDeltaY);
    // then normalize that so it is always between 0 and 2pi
    // mod by circle, but this is +-PI; add PI, but now might be too big; mod by 2PI again
    const normalizedTargetAngle = ( targetAngle % (Math.PI * 2) + Math.PI) % (Math.PI * 2);
    // calculate whether to turn clockwise or counterclockwise
    // ??? based on if angle is less than or = to 1pi of current spaceship angle ???

    const spaceship = state.spaceship;
    let acceleration = 0;
    if (isGameKeyDown(state, GAME_KEY.UP) || isMouseDown()) {
        acceleration = .15;
    } else if (isGameKeyDown(state, GAME_KEY.DOWN) || isRightMouseDown() ) {
        acceleration = -0.05;
    }
    if (isGameKeyDown(state, GAME_KEY.LEFT)
        || ( isMouseDown() && normalizedTargetAngle % Math.PI > spaceship.rotation) ) {
        spaceship.rotation -= 0.1;
    }
    if (isGameKeyDown(state, GAME_KEY.RIGHT)
        || ( isMouseDown() && normalizedTargetAngle % Math.PI <= spaceship.rotation) ) {
        spaceship.rotation += 0.1;
    }

    const dx = Math.cos(spaceship.rotation), dy = Math.sin(spaceship.rotation);
    spaceship.velocity.x += acceleration * dx;
    spaceship.velocity.y += acceleration * dy;

    // Add some friction to slow the ship down a bit.
    spaceship.velocity.x *= 0.98;
    spaceship.velocity.y *= 0.98;

    spaceship.x += spaceship.velocity.x;
    spaceship.y += spaceship.velocity.y;

    if (spaceship.shootCooldown > 0) {
        spaceship.shootCooldown -= FRAME_LENGTH;
    }
    if (spaceship.shootCooldown <= 0 && isGameKeyDown(state, GAME_KEY.SHOOT)) {
        state.playerBullets.push({
            x: spaceship.x + spaceship.size * dx,
            y: spaceship.y + spaceship.size * dy,
            velocity: {
                x: dx * 5 + spaceship.velocity.x,
                y: dy * 5 + spaceship.velocity.y,
            },
            size: 3,
            rotation: spaceship.rotation,
        });
        spaceship.shootCooldown = spaceship.reloadTime;
    }
}

function createAsteroid(state: GameState) {
    const spawnAngle = 2 * Math.PI * Math.random();
    const rotation = 2 * Math.PI * Math.random();
    const distance = ASTEROID_GENERATION_DISTANCE_RANGE[0] + Math.random() * (
        ASTEROID_GENERATION_DISTANCE_RANGE[1] - ASTEROID_GENERATION_DISTANCE_RANGE[0]
    );
    return {
        x: state.spaceship.x + distance * Math.cos(spawnAngle),
        y: state.spaceship.y + distance * Math.sin(spawnAngle),
        velocity: {
            x: 2 * Math.cos(rotation),
            y: 2 * Math.sin(rotation),
        },
        size: 15,
        rotation,
    };
}

function renderLoop() {
    try {
        window.requestAnimationFrame(renderLoop);
        const state = getState();
        render(mainContext, state);
    } catch (e) {
        console.log(e);
        debugger;
    }
}
renderLoop();
setInterval(update, FRAME_LENGTH);

