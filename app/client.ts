import { render } from 'app/render/renderGame';
import { getState } from 'app/state';
import { mainCanvas, mainContext } from 'app/utils/canvas';
import { getDistance, doCirclesIntersect, isPointInCircle } from 'app/utils/geometry';
import { query } from 'app/utils/dom';
import { addKeyboardListeners, isGameKeyDown, updateKeyboardState } from 'app/utils/userInput';
import { addContextMenuListeners, bindMouseListeners, isMouseDown, /*isRightMouseDown,*/ getMousePosition } from 'app/utils/mouse';
import { bindPointerListeners, isPrimaryPointerDown, /*isTwoTouch,*/ /*isThreeTouch,*/ getPointerPosition } from 'app/utils/pointer';

import {
    ASTEROID_CULLING_DISTANCE,
    ASTEROID_GENERATION_DISTANCE_RANGE,
    BULLET_CULLING_DISTANCE, FRAME_LENGTH, GAME_KEY
} from 'app/constants';


function initializeGame(state: GameState) {
    bindMouseListeners();
    bindPointerListeners();
    addContextMenuListeners();
    addKeyboardListeners();
    // fix scrolling and pinch/zoom on touch displays
    const noResize = (e: TouchEvent) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }
    mainCanvas.addEventListener('touchstart', noResize);

    // resize canvas to full window if window size is less than 600x800
    if (window.innerHeight < 600) {
        mainCanvas.height = Number(window.innerHeight) - 20;
        mainCanvas.width = Number(window.innerWidth) - 20;
    } else if (window.innerWidth < 800) {
        mainCanvas.height = Number(window.innerHeight) - 20;
        mainCanvas.width = Number(window.innerWidth) - 20;
    }

    query('.js-loading')!.style.display = 'none';
    query('.js-gameContent')!.style.display = '';
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

    // MOUSE: update mouse position, adjust for camera
    const newMousePosition = getMousePosition(mainCanvas);
    const {x: mouseX, y: mouseY} = getPositionInUniverse(newMousePosition, state.camera);
    state.mouse.x = mouseX;
    state.mouse.y = mouseY;
    state.mouse.isDown = isMouseDown();
    // POINTER: update pointer position, adjust for camera
    const newPointerPosition = getPointerPosition(mainCanvas);
    const {x: pointerX, y: pointerY} = getPositionInUniverse(newPointerPosition, state.camera);
    state.pointer.x = pointerX;
    state.pointer.y = pointerY;
    state.pointer.isDown = isPrimaryPointerDown();

    if (isPointInCircle(state.pointer, state.planets[0])) {
        state.planets[0].primaryColor = 'pink';
    } else {
        updatePlayerSpaceship(state);
    }

    updateBullets(state);
    updateAsteroids(state);

    state.camera.x = state.spaceship.x - mainCanvas.width / 2;
    state.camera.y = state.spaceship.y - mainCanvas.height / 2;
}

function getPositionInUniverse(objectPosition: Coords, camera: {x: number, y: number}) {
    const x = objectPosition[0] + camera.x;
    const y = objectPosition[1] + camera.y;
    return {x, y};
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
        for (let j = 0; j < state.asteroids.length; j++) {
            const asteroid: Asteroid = state.asteroids[j];
            if (doCirclesIntersect(asteroid, bullet)) {
                asteroid.primaryColor = '#f00';
                asteroid.hitTimer = asteroid.maxHitTime;
                asteroid.armor -= 1;
                // lightness set between 50 and 100 to be in the lighter half of hsl space
                const lightness = 50 * asteroid.armor / asteroid.maxArmor;
                asteroid.secondaryColor = 'hsl(0 10% ' + lightness + '%)';
            }
        }
    }
}

function updateAsteroids(state: GameState) {
    for (let i = 0; i < state.asteroids.length; i++) {
        const asteroid = state.asteroids[i];
        asteroid.x += asteroid.velocity.x;
        asteroid.y += asteroid.velocity.y;
        if (getDistance(state.spaceship, asteroid) > ASTEROID_CULLING_DISTANCE || asteroid.armor <= 0) {
            state.asteroids.splice(i--, 1);
            return;
        }
        if (asteroid.hitTimer > 0) {
            // lightness set between 50 and 100 to be in the lighter half of hsl space
            const lightness = 100 - (50 * asteroid.hitTimer / asteroid.maxHitTime);
            asteroid.primaryColor = 'hsl(0 70% ' + lightness + '%)';
            asteroid.hitTimer--;
        }
    }
    while (state.asteroids.length < 5) {
        state.asteroids.push(createAsteroid(state));
    }
}

function normalizeRadians(input: number) {
    const n = Math.PI * 2;
    return ( ( input % n ) + n ) % n;
}
// calc dy and dx of spaceship to mouse/pointer
// new angle of spaceship (don't set yet...) = math.atan2(dy,dx)
// calc which direction to spin is shorter, clockwise vs counterclockwise
// use radians (2pi is full circle), function to normalize radians between 0 and 2pi
// positive rotation is clockwise
// to check clockwise, take target angle minus existing angle, normalize between 0 and 2pi,
// if that is less than or equal to pi then it is shortest direction,
// otherwise rotate counterclockwise
function isRotationPositive(state: GameState) {
    let dy: number = 0, dx: number = 0;
    if (state.mouse.isDown) { // check for mouse first
        dy = state.spaceship.y - state.mouse.y;
        dx = state.spaceship.x - state.mouse.x;
    } else if (state.pointer.isDown) { // with no mouse available, check for pointer
        dy = state.spaceship.y - state.pointer.y;
        dx = state.spaceship.x - state.pointer.x;
    }
    const existingAngle = state.spaceship.rotation;
    const targetAngle = Math.atan2(dy,dx);
    const normalizeDeltaAngle = normalizeRadians(targetAngle - existingAngle);

    if ( normalizeDeltaAngle <= Math.PI ) {
        return true;
    }
    return false;
}

function updatePlayerSpaceship(state: GameState) {
    const spaceship = state.spaceship;
    let acceleration = 0;
    if (isGameKeyDown(state, GAME_KEY.UP) || isMouseDown() || isPrimaryPointerDown()) {
        acceleration = .15;
    } else if (isGameKeyDown(state, GAME_KEY.DOWN)) { // no brakes for mouse/pointer yet
        acceleration = -0.05;
    }
    if ( isGameKeyDown(state, GAME_KEY.LEFT) || ( ( isPrimaryPointerDown() || isMouseDown() ) && isRotationPositive(state) ) ) {
        spaceship.rotation -= 0.1;
    }
    if ( isGameKeyDown(state, GAME_KEY.RIGHT)  || ( ( isPrimaryPointerDown() || isMouseDown() ) && !isRotationPositive(state) ) ) {
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
    // have a shooting toggle
    if (spaceship.shootCooldown <= 0 && spaceship.isShooting ) {
        state.playerBullets.push({
            x: spaceship.x + spaceship.size * dx,
            y: spaceship.y + spaceship.size * dy,
            velocity: {
                x: dx * 5 + spaceship.velocity.x,
                y: dy * 5 + spaceship.velocity.y,
            },
            size: 3,
            radius: 3/2,
            rotation: spaceship.rotation,
            primaryColor: '#fff',
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
    const size = 15;
    return {
        x: state.spaceship.x + distance * Math.cos(spawnAngle),
        y: state.spaceship.y + distance * Math.sin(spawnAngle),
        velocity: {
            x: 2 * Math.cos(rotation),
            y: 2 * Math.sin(rotation),
        },
        size,
        radius: size/2,
        rotation,
        primaryColor: '#fff',
        secondaryColor: '#000',
        armor: Math.floor(size / 2),
        maxArmor: Math.floor(size / 2),
        hitTimer: 0,
        maxHitTime: 50,
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

