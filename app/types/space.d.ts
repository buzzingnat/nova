interface SpaceObject {
    x: number
    y: number
    size: number
    velocity: Point
    rotation?: number
    primaryColor?: string
    secondaryColor?: string
}

interface Spaceship extends SpaceObject {
    rotation: number
    reloadTime: number
    shootCooldown: number
}

interface Bullet extends SpaceObject {
}

interface Planet extends SpaceObject {
}

interface Asteroid extends SpaceObject {
}
