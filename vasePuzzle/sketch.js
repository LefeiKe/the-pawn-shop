let vaseSpriteSheet;
let pieces = [];
let emptySquare = {col: 2, row: 2};

let gameState = "start";

const vaseBounds = [
  { x: 0,   y: 0, w: 2016, h: 2016 }, // Vase 0: Takes full cell
  { x: 250, y: 0, w: 1516, h: 2016 }, // Vase 1: Narrower vase (centered, 300px padding left/right)
  { x: 350, y: 0, w: 1316, h: 2016 }, // Vase 2: Custom bounds
  { x: 50,  y: 0, w: 1916, h: 2016 }  // Vase 3: Custom bounds
];

let fullVaseSize = 2016;
let spriteSheetCols = 2;

let displayPieceSize = 140;
let cols = 3;
let rows = 3;

let selectedVaseIndex = 0;
let completionReported = false;

// track dragging state
let selectedPiece = null;
let dragStartX = 0;
let dragStartY = 0;
let isDragging = false;
const dragThreshold = 12; // Minimum distance to start dragging

let clickOffsetX = 0;
let clickOffsetY = 0;

let shuffleX, shuffleY, shuffleW;

async function setup() {
    createCanvas(864, 600);
    noSmooth();
    angleMode(DEGREES); 
    textFont("Press Start 2P")

    vaseSpriteSheet = await loadImage('images/vases.png');

    gameState = "start";

    selectedVaseIndex = random([0, 1, 2, 3]);

    startPuzzle(selectedVaseIndex);
}

function draw() {
    background(65, 40, 28);

    if (gameState === "start") {
        drawStartScreen();
        return;
    }

    if (gameState === "play") {
        drawPlayScreen();
    }
}

function drawStartScreen() {
  pixelBoard(160, 130, 544, 320);

  fill(65, 40, 28);
  textAlign(CENTER);
  textSize(20);
  text("EMERGENCY REPAIR", 432, 265);

  textSize(9);
  text("CLICK TO START", 432, 330);
}

function drawPlayScreen() {
    let boardW = cols * displayPieceSize;
    let boardH = rows * displayPieceSize;
    let boardOffsetX = 60;
    let boardOffsetY = (height - boardH) / 2;

    pixelBoard(boardOffsetX - 12, boardOffsetY - 12, boardW + 24, boardH + 24);

    let referenceSize = 160;
    let referenceX = boardOffsetX + boardW * 1.25;
    let referenceY = boardOffsetY + referenceSize * 0.45;
    
    pixelBoard(referenceX * 0.89, boardOffsetY * 0.64, referenceSize * 1.82, referenceSize * 3.07);

    textSize(12);
    fill(65, 40, 28);
    noStroke();
    textAlign(CENTER);
    text("EMERGENCY REPAIR", referenceX + referenceSize * 0.5, boardOffsetY * 1.25);

    textAlign(CENTER);
    textSize(9);
    text("FINISHED PRODUCT", referenceX * 1.14, boardOffsetY * 1.6);

    textAlign(LEFT);
    textSize(9);
    text("CONTROLS", referenceX - referenceSize * 0.15, boardOffsetY * 4);
    textSize(8);
    text("CLICK and DRAG: MOVE PIECE", referenceX - referenceSize * 0.15, boardOffsetY * 4.3);
    text(`ONLY PIECES ADJACENT TO THE ${"\n"} EMPTY SQUARE CAN BE MOVED`, referenceX - referenceSize * 0.15, boardOffsetY * 4.6);
    text("SINGLE CLICK: ROTATE PIECE", referenceX - referenceSize * 0.15, boardOffsetY * 5);

    shuffleX = referenceX - referenceSize * 0.125;
    shuffleY = boardOffsetY * 5.25;
    shuffleW = referenceSize * 1.25;
    drawButton("SHUFFLE BOARD", shuffleX, shuffleY, shuffleW, color(160, 70, 60));

    drawReferenceImage(selectedVaseIndex, referenceX, referenceY, referenceSize);

    if (checkWin()) {
        if (!completionReported) {
            completionReported = true;
            window.parent.postMessage({
                type: "vasePuzzleCompleted",
                vaseIndex: selectedVaseIndex
            }, window.location.origin);
        }
        drawCompletedVase(selectedVaseIndex, boardOffsetX, boardOffsetY, boardW, boardH);
        gameState = "win";
        drawWinScreen();
    } else {

        for (let p of pieces) {
            if (p !== selectedPiece) {
                p.update();
                p.display();
            }
        }

        if (selectedPiece) {
            selectedPiece.update();
            selectedPiece.display();
        }
    }
}

function startPuzzle(vaseIndex) {
    emptySquare = {col: 2, row: 2};

    let boardH = rows * displayPieceSize;
    let boardOffsetX = 60;
    let boardOffsetY = (height - boardH) / 2;

    chooseVase(vaseIndex, boardOffsetX, boardOffsetY);

    shuffleBoard(80);
}

function chooseVase(vaseIndex, boardX, boardY) {
    pieces = [];
    let bounds = vaseBounds[vaseIndex];

    // locate vase on sprite sheet
    let vaseCol = vaseIndex % spriteSheetCols;
    let vaseRow = Math.floor(vaseIndex / spriteSheetCols);
    let cellSx = vaseCol * fullVaseSize;
    let cellSy = vaseRow * fullVaseSize;

    let vaseSx = cellSx + bounds.x;
    let vaseSy = cellSy + bounds.y;

    let pieceSourceW = bounds.w / cols;
    let pieceSourceH = bounds.h / rows;

    // generate puzzle pieces
    for (let i = 0; i < 8; i++) {
        let localCol = i % cols;
        let localRow = Math.floor(i / cols);

        let sx = vaseSx + (localCol * pieceSourceW);
        let sy = vaseSy + (localRow * pieceSourceH);
        
        pieces.push(new Piece(
            vaseSpriteSheet, 
            sx, sy, pieceSourceW, pieceSourceH,
            localCol, localRow,  
            boardX, boardY,
            displayPieceSize));
        }
}

function drawWinScreen() {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    textSize(20);
    fill(255);
    textAlign(CENTER);
    text("YOU DID IT!", width / 2, height / 2 - 60);
    text("IT'S AS GOOD AS NEW.", width / 2, height / 2 - 20);
    textSize(12);
    text("CLICK FOR A REWARD", width / 2, height / 2 + 10);
}

function drawReferenceImage(vaseIndex, x, y, size) {
    let cellCol = vaseIndex % spriteSheetCols;
    let cellRow = Math.floor(vaseIndex / spriteSheetCols);
    let cellSx = cellCol * fullVaseSize;
    let cellSy = cellRow * fullVaseSize;

    fill(65, 40, 28);
    rect(x - 8, y - 8, size + 16, size + 16);

    image(
        vaseSpriteSheet,
        x, y, size, size,
        cellSx, cellSy, fullVaseSize, fullVaseSize
    );
}

function pixelBoard(x, y, w, h) {
  noStroke();

  fill(65, 40, 28);
  rect(x, y, w, h);

  fill(145, 91, 51);
  rect(x + 4, y + 4, w - 8, h - 8);

  fill(221, 191, 143);
  rect(x + 9, y + 9, w - 18, h - 18);
}

function mousePressed() {
    if (gameState === "start") {
        gameState = "play";
        return;
    }

    if (gameState === "play") {
        if (mouseOverButton(shuffleX, shuffleY, shuffleW)) {
            shuffleBoard(80);
            return;
        }
        selectedPiece = null;
        isDragging = false;

        for (let p of pieces) {
            if (p.isClicked(mouseX, mouseY)) {
                selectedPiece = p;
                dragStartX = mouseX;
                dragStartY = mouseY;
                clickOffsetX = mouseX - p.x;
                clickOffsetY = mouseY - p.y;
                break;
            }
        }
    }

    if (gameState === "win") {
        drawWinScreen();
    }
}

function mouseDragged() {
    if (!selectedPiece) return;

    let dragDistance = dist(mouseX, mouseY, dragStartX, dragStartY);

    if (dragDistance > dragThreshold) {
        isDragging = true;
    }
}

function mouseReleased() {
    if (!selectedPiece) return;

    if(checkWin()) {
        return;
    }

    let dragDistance = dist(mouseX, mouseY, dragStartX, dragStartY);
    if (dragDistance <= dragThreshold) {
        selectedPiece.rotatePiece();
    } else if (selectedPiece.isNearEmpty()) {
            let originX = selectedPiece.boardX + selectedPiece.col * selectedPiece.size;
            let originY = selectedPiece.boardY + selectedPiece.row * selectedPiece.size;
            let emptyX = selectedPiece.boardX + emptySquare.col * selectedPiece.size;
            let emptyY = selectedPiece.boardY + emptySquare.row * selectedPiece.size;

            let distToEmpty = dist(selectedPiece.x, selectedPiece.y, emptyX, emptyY);
            let totalDist = dist(originX, originY, emptyX, emptyY);

            if (distToEmpty < totalDist * 0.5) {
                selectedPiece.tryMove();
            }
        } else {
            selectedPiece.rotatePiece();
        }

    selectedPiece = null;
    isDragging = false;
}

function drawButton(label, x, y, w, colorValue) {
  noStroke();

  fill(colorValue);
  rect(x, y, w, 32);

  fill(255);
  textAlign(CENTER);
  textSize(9);

  text(label, x + w / 2, y + 21);
}

function mouseOverButton(x, y, w) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + 32;
}

function shuffleBoard(moves) {
    for (let i = 0; i < moves; i++) {
        let validPieces = pieces.filter( p => p.isNearEmpty() );
        let randomPiece = random(validPieces);
        randomPiece.moveInstant();
    }
}

function checkWin() {
    return pieces.every(p => p.isHome());
}

function drawCompletedVase(vaseIndex, boardX, boardY, boardW, boardH) {
    let cellCol = vaseIndex % spriteSheetCols;
    let cellRow = Math.floor(vaseIndex / spriteSheetCols);
    let cellSx = cellCol * fullVaseSize;
    let cellSy = cellRow * fullVaseSize;

    let bounds = vaseBounds ? vaseBounds[vaseIndex] : { x: 0, y: 0, w: fullVaseSize, h: fullVaseSize };

    let sx = cellSx + bounds.x;
    let sy = cellSy + bounds.y;
    let sw = bounds.w;
    let sh = bounds.h;

    image(
        vaseSpriteSheet,
        boardX, boardY, boardW, boardH,
        sx, sy, sw, sh
    );

    stroke(255, 215, 0, 50);
    strokeWeight(2);
    noFill();
    rect(boardX, boardY, boardW, boardH);
}
class Piece {
    constructor(spriteSheet, sx, sy, sw, sh, targetCol, targetRow, boardX, boardY, displaySize) {
        this.spriteSheet = spriteSheet;
        this.sx = sx;
        this.sy = sy;
        this.sw = sw;
        this.sh = sh;

        // target grid positions
        this.targetCol = targetCol;
        this.targetRow = targetRow;

        // current grid positions
        this.col = targetCol;
        this.row = targetRow;

        let randomStartingAngle = random([0, 90, 180, 270]);
        this.angle = randomStartingAngle;
        this.targetAngle = randomStartingAngle;

        this.boardX = boardX;
        this.boardY = boardY;
        this.size = displaySize;

        this.x = this.boardX + this.col * this.size;
        this.y = this.boardY + this.row * this.size;
    }
    update() {
        if (this === selectedPiece && isDragging) {
            let targetX = mouseX - clickOffsetX;
            let targetY = mouseY - clickOffsetY;

            if (this.isNearEmpty()) {
                let targetColDiff = emptySquare.col - this.col;
                let targetRowDiff = emptySquare.row - this.row;

                let originX = this.boardX + this.col * this.size;
                let originY = this.boardY + this.row * this.size;
                let emptyX = this.boardX + emptySquare.col * this.size;
                let emptyY = this.boardY + emptySquare.row * this.size;

                if (targetColDiff !== 0) {
                    targetY = originY;
                    targetX = constrain(targetX, min(originX, emptyX), max(originX, emptyX));
                } else if (targetRowDiff !== 0) {
                    targetX = originX;
                    targetY = constrain(targetY, min(originY, emptyY), max(originY, emptyY));
                }
            }

            this.x = lerp(this.x, targetX, 0.4);
            this.y = lerp(this.y, targetY, 0.4);
        } else {
            let destX = this.boardX + this.col * this.size;
            let destY = this.boardY + this.row * this.size;

            if (abs(this.x - destX) < 0.5) this.x = destX;
            else this.x = lerp(this.x, destX, 0.3);

            if (abs(this.y - destY) < 0.5) this.y = destY;
            else this.y = lerp(this.y, destY, 0.3);
        }

        this.angle = lerp(this.angle, this.targetAngle, 0.25);
    }
    display() {
        push();
        translate(this.x + this.size / 2, this.y + this.size / 2);

        rotate(this.angle);

        image(
            this.spriteSheet, 
            -this.size / 2, -this.size / 2, this.size, this.size, 
            this.sx, this.sy, this.sw, this.sh
        );

        stroke(65, 40, 28);
        strokeWeight(2);
        noFill();
        rect(-this.size / 2, -this.size / 2, this.size, this.size);

        pop();
    }
    isClicked(px, py) {
        return (
            px > this.x && px < this.x + this.size &&
            py > this.y && py < this.y + this.size
        );
    }
    isNearEmpty() {
        let colDiff = abs(this.col - emptySquare.col);
        let rowDiff = abs(this.row - emptySquare.row);
        return (colDiff + rowDiff === 1);
    }
    rotatePiece() {
        this.targetAngle += 90;
    }
    tryMove() {
        if (this.isNearEmpty()) {
            let tempCol = this.col;
            let tempRow = this.row;

            this.col = emptySquare.col;
            this.row = emptySquare.row;

            emptySquare.col = tempCol;
            emptySquare.row = tempRow;
        }
    }
    moveInstant() {
        if (this.isNearEmpty()) {
            let tempCol = this.col;
            let tempRow = this.row;
            this.col = emptySquare.col;
            this.row = emptySquare.row;
            emptySquare.col = tempCol;
            emptySquare.row = tempRow;

            this.x = this.boardX + this.col * this.size;
            this.y = this.boardY + this.row * this.size;
        }
    }
    isHome() {
        let isCorrectPos = (this.col === this.targetCol && this.row === this.targetRow);
        let isCorrectAngle = (Math.round(this.targetAngle) % 360 === 0);
        return isCorrectPos && isCorrectAngle;
    }
}
