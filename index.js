const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);


let json = {
    "trees": {
        "A": {
            "position": {"x": 9, "y": 9},
            "steps": [
                {"timestamp": 0, "health": 50},
            ]
        },
        "B": {
            "position": {"x": 1, "y": 1},
            "steps": [
                {"timestamp": 410, "health": 0},
                {"timestamp": 380, "health": 8},
                {"timestamp": 360, "health": 15},
                {"timestamp": 330, "health": 25},
                {"timestamp": 300, "health": 32},
                {"timestamp": 280, "health": 40},
                {"timestamp": 200, "health": 50},
                {"timestamp": 0,   "health": 50}
            ]
        }
    },
    "players": {
        "player1": {
            "team": "A",
            "character": {
                "sprites": {
                    "default": "bunny.png"
                }
            },
            "steps": [
                {"timestamp": 410, "position": {"x": 4, "y": 1}},
                {"timestamp": 360, "position": {"x": 4, "y": 6}},
                {"timestamp": 310, "position": {"x": 4, "y": 6}},
                {"timestamp": 280, "position": {"x": 4, "y": 9}},
                {"timestamp": 270, "position": {"x": 3, "y": 9}},
                {"timestamp": 190, "position": {"x": 3, "y": 1}},
                {"timestamp": 180, "position": {"x": 2, "y": 1}},
                {"timestamp": 100, "position": {"x": 2, "y": 9}},
                {"timestamp": 90,  "position": {"x": 1, "y": 9}},
                {"timestamp": 0,   "position": {"x": 1, "y": 0}}
            ]
        },
        "player2": {
            "team": "B",
            "character": {
                "sprites": {
                    "default": "bunny.png"
                }
            },
            "steps": [
                {"timestamp": 410, "position": {"x": 5, "y": 8}},
                {"timestamp": 360, "position": {"x": 5, "y": 3}},
                {"timestamp": 310, "position": {"x": 5, "y": 3}},
                {"timestamp": 280, "position": {"x": 5, "y": 1}},
                {"timestamp": 270, "position": {"x": 6, "y": 1}},
                {"timestamp": 190, "position": {"x": 6, "y": 8}},
                {"timestamp": 180, "position": {"x": 7, "y": 8}},
                {"timestamp": 100, "position": {"x": 7, "y": 1}},
                {"timestamp": 90,  "position": {"x": 8, "y": 1}},
                {"timestamp": 0,   "position": {"x": 8, "y": 9}}
            ]
        }
    }
}

function createPlayers(jsonPlayers){
    let fighters = {};
    Object.keys(jsonPlayers).map((fighterId) => {
        let jsonPlayer = jsonPlayers[fighterId];
        let fighter = PIXI.Sprite.from(jsonPlayer.character.sprites["default"]);
        // center the sprite's anchor point
        fighter.anchor.set(0.5);
        fighter.visible = false;
        fighters[fighterId] = fighter;
        app.stage.addChild(fighter);
    });
    return fighters;
}
// create a new Sprite from an image path
let players = createPlayers(json.players);

const WIDTH_SEGMENT_SIZE = app.screen.width / 10;
const HEIGHT_SEGMENT_SIZE = app.screen.height / 10;
const SLOWING_FACTOR = 8;

function executeStep(player, step){
    let position = step.position;
    player.x = position.x * WIDTH_SEGMENT_SIZE;
    player.y = position.y * HEIGHT_SEGMENT_SIZE;
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

function renderPlayers(players, playerStories, actualTs, delta){
    Object.keys(playerStories).forEach((fighterId) => {
        let player = players[fighterId];
        let steps = playerStories[fighterId].steps;
        if (steps.length > 0){
            let isStepExecuted = false;
            let peek = steps[steps.length - 1];
            while(steps.length > 0 && peek.timestamp * SLOWING_FACTOR < actualTs) {
                if (player.visible == false){
                    player.visible = true;
                }
                steps.pop();
                executeStep(player, peek);
                // rotate when moving
                player.rotation += 0.1 * delta;
                isStepExecuted = true;
                if (steps.length > 0){
                    peek = steps[steps.length - 1];
                }
            }
            // execute partial step
            if (!isStepExecuted && player.visible){
                let moved = false;
                moved = applyPartialDistance("x", WIDTH_SEGMENT_SIZE, delta, player, peek, actualTs) || moved;
                moved = applyPartialDistance("y", HEIGHT_SEGMENT_SIZE, delta, player, peek, actualTs) || moved;
                if (moved){
                    // rotate when moving, this can be replaced by walking animation
                    player.rotation += 0.1 * delta;
                }
            }
        }
    })
}

function render() {
    let actualTs = 0;
    app.ticker.add((delta) => {
        actualTs += delta;
        renderPlayers(players, json.players, actualTs, delta);
    });
}

render()