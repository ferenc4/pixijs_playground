const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// create a new Sprite from an image path
const bunny = PIXI.Sprite.from('bunny.png');

// center the sprite's anchor point
bunny.anchor.set(0.5);

const WIDTH_SEGMENT_SIZE = app.screen.width / 10;
const HEIGHT_SEGMENT_SIZE = app.screen.height / 10;
const SLOWING_FACTOR = 10;

app.stage.addChild(bunny);

class Position {
    constructor(y, x){
        this.y = y
        this.x = x
    }
}

class Step {
    constructor(timestamp, position){
        this.timestamp = timestamp
        this.position = position
    }
}

let story = [
    new Step(1, new Position(1, 1)),
    new Step(2, new Position(1, 2)),
    new Step(3, new Position(1, 3)),
    new Step(4, new Position(1, 4)),
    new Step(5, new Position(1, 5)),
    new Step(6, new Position(1, 6)),
    new Step(7, new Position(1, 7)),
    new Step(8, new Position(1, 8)),
    new Step(9, new Position(1, 9)),
    new Step(10, new Position(2, 9)),
    new Step(11, new Position(2, 8)),
    new Step(12, new Position(2, 7)),
    new Step(13, new Position(2, 6)),
    new Step(14, new Position(2, 5)),
    new Step(15, new Position(2, 4)),
    new Step(16, new Position(2, 3)),
    new Step(17, new Position(2, 2)),
    new Step(18, new Position(2, 1)),

    new Step(19, new Position(3, 1)),
    new Step(20, new Position(3, 2)),
    new Step(21, new Position(3, 3)),
    new Step(22, new Position(3, 4)),
    new Step(23, new Position(3, 5)),
    new Step(24, new Position(3, 6)),
    new Step(25, new Position(3, 7)),
    new Step(26, new Position(3, 8)),
    new Step(27, new Position(3, 9)),
    new Step(28, new Position(4, 9)),
    new Step(29, new Position(4, 8)),
    new Step(30, new Position(4, 7)),
    new Step(31, new Position(4, 6)),
    new Step(32, new Position(4, 5)),
    new Step(33, new Position(4, 4)),
    new Step(34, new Position(4, 3)),
    new Step(35, new Position(4, 2)),
    new Step(36, new Position(4, 1)),
]
story.reverse()

function executeStep(step){
    let position = step.position;
    bunny.x = position.x * WIDTH_SEGMENT_SIZE;
    bunny.y = position.y * HEIGHT_SEGMENT_SIZE;
}

function applyPartialDistance(xOrY, segmentSize, estimatedDelta, fighter, targetStep, actualTs){
    // take distance from next keyframe
    let distanceToTravel = targetStep.position[xOrY] * segmentSize - fighter[xOrY]
    if (distanceToTravel != 0){
        // take time until next game loop iteration (approx. time since last game loop iteration)
        let expectedSpeed = distanceToTravel / (targetStep.timestamp * SLOWING_FACTOR - actualTs);
        // move total distance / time
        fighter[xOrY] += expectedSpeed * estimatedDelta;
        return true;
    }
    return false;
}

function render() {
    let actualTs = 0;
    let storyTs = 0;

    // Listen for animate update
    app.ticker.add((delta) => {
        actualTs += delta;
        if (story.length > 0){
            let isStepExecuted = false;
            let peek = story[story.length - 1];
            while(story.length > 0 && peek.timestamp * SLOWING_FACTOR < actualTs) {
                story.pop();
                storyTs = peek.timestamp;
                executeStep(peek);
                // rotate when moving
                bunny.rotation += 0.1 * delta;
                isStepExecuted = true;
                if (story.length > 0){
                    peek = story[story.length - 1];
                }
            }
            // execute partial step
            if (!isStepExecuted){
                let moved = false;
                moved = applyPartialDistance("x", WIDTH_SEGMENT_SIZE, delta, bunny, peek, actualTs) || moved;
                moved = applyPartialDistance("y", HEIGHT_SEGMENT_SIZE, delta, bunny, peek, actualTs) || moved;
                if (moved){
                    // rotate when moving, this can be replaced by walking animation
                    bunny.rotation += 0.1 * delta;
                }
            }
        }
    });
}

render()