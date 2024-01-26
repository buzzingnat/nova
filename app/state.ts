const state: GameState = getInitialState();
// @ts-ignore
window['state'] = state;

function getInitialState(): GameState {
    return {
        gameHasBeenInitialized: false,
        mouse: {
            x: 400,
            y: 300,
            isDown: false,
            wasPressed: false,
            isRightDown: false,
            wasRightPressed: false,
        },
        pointer: {
            x: 400,
            y: 300,
            isDown: false,
            wasPressed: false,
            isMultiTouch: false,
            wasMultiTouchPressed: false,
        },
        isUsingKeyboard: true,
        keyboard: {
            gameKeyValues: [],
            gameKeysDown: new Set(),
            gameKeysPressed: new Set(),
            mostRecentKeysPressed: new Set(),
            gameKeysReleased: new Set(),
        },
        audio: {
            playingTracks: [],
        },
        camera: { x: 0, y: 0, },
        spaceship: {
            x: 0,
            y: 0,
            size: 20,
            radius: 10,
            velocity: {x: 0, y: 0},
            rotation: -1.5,
            reloadTime: 200,
            shootCooldown: 0,
            primaryColor: '#fff',
            isShooting: false,
        },
        playerBullets: [],
        planets: [{
            x: 200,
            y: 200,
            velocity: {x: 0, y: 0},
            size: 50,
            radius: 25,
            primaryColor: 'aqua',
            secondaryColor: 'lime',
        }],
        asteroids: [],
    };
}

export function getState(): GameState {
    return state;
}

