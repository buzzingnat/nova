interface SpaceObject {
    x: number
    y: number
    size: number
    velocity: Point
    rotation?: number
    primaryColor: string
    secondaryColor?: string
    radius: number
}

interface Spaceship extends SpaceObject {
    rotation: number
    reloadTime: number
    shootCooldown: number
    armor?: number
}

interface Bullet extends SpaceObject {
}

interface Planet extends SpaceObject {
}

interface Asteroid extends SpaceObject {
    armor: number
    maxArmor: number
    hitTimer: number
    maxHitTime: number
}
