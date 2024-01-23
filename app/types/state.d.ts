interface GameState {
    gameHasBeenInitialized: boolean
    mouse: {
        x: number
        y: number
        isDown: boolean
        wasPressed: boolean
        isRightDown: boolean
        wasRightPressed: boolean
    }
    pointer: {
        x: number
        y: number
        isDown: boolean
        wasPressed: boolean
        isMultiTouch: boolean
        wasMultiTouchPressed: boolean
    }
    keyboard: {
        gameKeyValues: number[]
        gameKeysDown: Set<number>
        gameKeysPressed: Set<number>
        // The set of most recent keys pressed, which is recalculated any time
        // a new key is pressed to be those keys pressed in that same frame.
        mostRecentKeysPressed: Set<number>
        gameKeysReleased: Set<number>
    }
    isUsingKeyboard?: boolean
    isUsingXbox?: boolean
    audio: {
        playingTracks: any[]
    }
    camera: Point
    spaceship: Spaceship
    playerBullets: Bullet[]
    planets: Planet[]
    asteroids: Asteroid[]
}
