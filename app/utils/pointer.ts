// import { window.CANVAS_SCALE } from 'app/constants';
// import { mainCanvas } from 'app/utils/canvas';
// import { KEY, isKeyboardKeyDown } from 'app/utils/userInput';

// let mousePosition: Coords = [-1000, -1000];
// let mouseIsDown: boolean = false;
// let rightMouseIsDown: boolean = false;
// let middleMouseIsDown: boolean = false;

let pointerPosition: Coords = [-1000, -1000];
let pointerIsPrimary: number | null = null;
let pointerList: number[] = [];

export function isPrimaryPointerDown(): boolean {
    if (pointerIsPrimary !== null) return true;
    return false;
}

export function getPointerPosition(container: HTMLElement|null = null, scale = 1): Coords {
    if (container) {
        const containerRect:DOMRect = container.getBoundingClientRect();
        return [
            (pointerPosition[0] - containerRect.x) / scale,
            (pointerPosition[1] - containerRect.y) / scale,
        ];
    }
    return [pointerPosition[0] / scale, pointerPosition[1] / scale];
}

// function onMouseMove(event: MouseEvent) {
//     mousePosition = [event.pageX, event.pageY];
//     // console.log(mousePosition);
// }
function onPointerMove(event: PointerEvent) {
    pointerPosition = [event.pageX, event.pageY];
}

function onPointerDown(event: PointerEvent) {
    pointerList.push(event.pointerId);
    if (event.isPrimary) {
      pointerIsPrimary = event.pointerId;
      pointerPosition = [event.pageX, event.pageY];
      //console.log('primary touch ', event.pointerId ,': x ', event.screenX, ', y ', event.screenY);
    } else {
        //console.log('secondary touch');
    }
}
function onPointerUp(event: PointerEvent) {
    const index = pointerList.findIndex(pointer => event.pointerId === pointer);
    pointerList.splice(index, 1);
    if (event.pointerId === pointerIsPrimary) {
        pointerIsPrimary = null;
        //console.log('end primary touch, pointerId now ', pointerIsPrimary);
    } else {
        //console.log('end secondary touch');
    }
}

export function bindPointerListeners() {
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
}

export function isPointerOverElementRect(element: HTMLElement): boolean {
    const rect:DOMRect = element.getBoundingClientRect();
    return pointerPosition[0] >= rect.x && pointerPosition[0] <= rect.x + rect.width
        && pointerPosition[1] >= rect.y && pointerPosition[1] <= rect.y + rect.height;
}

export function isPointerOverElementCircle(element: HTMLElement): boolean {
    const rect:DOMRect = element.getBoundingClientRect();
    const shortEdge: number = Math.min(rect.width, rect.height);
    const circle: {x: number, y: number, radius: number} = {
        x: rect.x + rect.width/2,
        y: rect.y + rect.height/2,
        radius: shortEdge/2,
    };
    const radius = circle.radius - .5;
    const dx = circle.x - pointerPosition[0], dy = circle.y - pointerPosition[1];
    return dx * dx + dy * dy < radius * radius;
}

// export function isMouseOverElement(element: HTMLElement): boolean {
//     const rect:DOMRect = element.getBoundingClientRect();
//     return mousePosition[0] >= rect.x && mousePosition[0] <= rect.x + rect.width
//         && mousePosition[1] >= rect.y && mousePosition[1] <= rect.y + rect.height;
// }


export function isMultiTouch(): boolean {
    if (pointerList.length > 1) return true;
    return false;
}

export function isTwoTouch(): boolean {
    if (pointerList.length === 2) return true;
    return false;
}

export function isThreeTouch(): boolean {
    if (pointerList.length === 3) return true;
    return false;
}

// export function isRightMouseDown(): boolean {
//     return rightMouseIsDown;
// }

// export function addContextMenuListeners(): void {
//     // Prevent the context menu from displaying when clicking over the canvas unless shift is held.
//     mainCanvas.addEventListener('contextmenu', function (event) {
//         if (isKeyboardKeyDown(KEY.SHIFT)) {
//             return;
//         }
//         event.preventDefault();
//         // const [x, y] = getMousePosition();
//         // lastContextClick = getMousePosition(mainCanvas, window.CANVAS_SCALE);
//     });
// }
