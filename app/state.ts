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
            velocity: {x: 0, y: 0},
            rotation: -1.5,
            reloadTime: 200,
            shootCooldown: 0,
        },
        playerBullets: [],
        planets: [{
            x: 200,
            y: 200,
            velocity: {x: 0, y: 0},
            size: 50,
            primaryColor: 'aqua',
            secondaryColor: 'lime',
        }],
        asteroids: [],
    };
}

export function getState(): GameState {
    return state;
}

