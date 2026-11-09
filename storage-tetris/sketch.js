const TARGET_LINES = 5;
const FALL_MS = 600;
const SOFT_DROP_MS = 50;
const JUNK_ROWS = 4;

const IMAGE_FOLDER = "tetromino-images/";

// a piece's id is its position in this list. the crate has to stay last
const PIECES = [
  { file: "item_shovel.png", rows: 4, cols: 1, color: [120, 130, 140], shape: [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]] },
  { file: "item_clock.png", rows: 2, cols: 2, color: [214, 170, 60], shape: [[1, 1], [1, 1]] },
  { file: "item_hammer.png", rows: 2, cols: 3, color: [160, 70, 60], shape: [[1, 1, 1], [0, 1, 0], [0, 0, 0]] },
  { file: "item_lamp.png", rows: 3, cols: 2, color: [230, 140, 50], shape: [[1, 0, 0], [1, 0, 0], [1, 1, 0]] },
  { file: "item_saxophone.png", rows: 3, cols: 2, color: [70, 100, 160], shape: [[0, 1, 0], [0, 1, 0], [1, 1, 0]] },
  { file: "item_telescope.png", rows: 2, cols: 3, color: [70, 115, 65], shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  { file: "item_gramophone.png", rows: 2, cols: 3, color: [130, 80, 140], shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  { file: "item_crate.png", rows: 1, cols: 1, color: [145, 91, 51], shape: null }
];

const JUNK_ID = PIECES.length - 1;

// board size
const COLS = 10;
const ROWS = 20;
const CELL = 26;

const BOARD_X = 142;
const BOARD_Y = 28;
const PANEL_X = 432;
const PANEL_Y = 19;
const PANEL_W = 290;
const PANEL_H = 538;
const NEXT_BOX_X = 513;
const NEXT_BOX_Y = 102;
const NEXT_BOX_SIZE = 128;
const GIVE_UP_X = 487;
const GIVE_UP_Y = 480;
const GIVE_UP_W = 180;
const NEW_ROUND_X = 307;
const NEW_ROUND_Y = 375;
const NEW_ROUND_W = 250;

let board;
let linesCleared = 0;

// goes up by 1 each time a piece locks, so every locked piece gets its own number
let lockedItemCount = 0;

let pieceId;
let pieceShape;
let pieceX;
let pieceY;

let nextId;
let lastFallTime = 0;

let gameState = "loading";
let shopBg;

// true when the main shop game opens this inside its iframe
const EMBEDDED = window.parent !== window;

async function setup() {
  let canvas = createCanvas(864, 576);
  canvas.parent("game");

  noSmooth();
  textFont("Pixelify Sans"); // from the overarching main game
  shopBg = await loadImage("../images/shop.png");

  // keep each image next to its item in the PIECES list, or null to use the fallback color
  for (let piece of PIECES) {
    let img = await loadPieceImage(piece.file);

    if (imageMatchesGrid(img, piece)) {
      piece.image = img;
    } else {
      console.warn(piece.file + " is missing or doesn't fit its grid, using the fallback color");
      piece.image = null;
    }
  }

  gameState = "start";
}

function loadPieceImage(file) {
  return new Promise(function (resolve) {
    loadImage(IMAGE_FOLDER + file, resolve, function () {
      resolve(null);
    });
  });
}

function imageMatchesGrid(img, piece) { // shouldn't be an issue because i desgined them in right proportions in figma. if you guys want to create new items, check the grid proportion
  if (img === null) {
    return false;
  }

  let sliceW = img.width / piece.cols;
  let sliceH = img.height / piece.rows;
  return Number.isInteger(sliceW) && Number.isInteger(sliceH) && sliceW === sliceH;
}

function draw() {
  background(0);
  if (shopBg) image(shopBg, 0, 0, width, height);
  // Match the main shop start screen dimming.
  noStroke();
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  if (gameState === "loading") {
    return;
  }

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  if (gameState === "playing") {
    updateFall();
  }

  drawBoard();
  drawSidePanel();

  // the falling piece only exists while the round is going
  if (gameState === "playing" || gameState === "paused") {
    drawShape(pieceShape, BOARD_X + pieceX * CELL, BOARD_Y + pieceY * CELL);
  }

  if (gameState === "paused") {
    drawPaused();
  }

  if (gameState === "won" || gameState === "lost" || gameState === "quit") {
    drawEndPanel();
  }
}

function startRound() {
  board = makeGrid(ROWS, COLS);
  addJunkRows();
  linesCleared = 0;
  gameState = "playing";
  nextId = randomPieceId();
  spawnPiece();
}

function makeRow(size) {
  return new Array(size).fill(0);
}

function makeGrid(rows, cols) {
  let grid = [];
  for (let row = 0; row < rows; row++) {
    grid.push(makeRow(cols));
  }
  return grid;
}

// calls visit(cell, row, col) for everything in the grid that isn't empty
function eachFilledCell(grid, visit) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== 0) {
        visit(grid[row][col], row, col);
      }
    }
  }
}

function makeCrate() {
  return { id: JUNK_ID, sr: 0, sc: 0, rot: 0, itemNumber: 0 };
}

// fill the bottom rows with crates, leaving holes so they can be cleared
function addJunkRows() {
  for (let row = ROWS - JUNK_ROWS; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      board[row][col] = makeCrate();
    }

    // if both picks land on the same column that row just gets 1 hole
    let holes = floor(random(1, 3));
    for (let i = 0; i < holes; i++) {
      board[row][floor(random(COLS))] = 0;
    }
  }
}

function randomPieceId() {
  return floor(random(JUNK_ID));
}

function makeCells(id) {
  let shape = PIECES[id].shape;
  let cells = makeGrid(shape.length, shape.length);

  eachFilledCell(shape, function (filled, row, col) {
    cells[row][col] = { id: id, sr: row, sc: col, rot: 0 };
  });
  return cells;
}

// the next piece becomes the falling piece, at the top middle of the board
// Spawn the next item; a blocked entry point ends the round.
function spawnPiece() {
  pieceId = nextId;
  pieceShape = makeCells(pieceId);
  pieceX = floor((COLS - pieceShape.length) / 2);
  pieceY = 0;
  nextId = randomPieceId();
  lastFallTime = millis();

  if (!pieceFits(pieceShape, pieceX, pieceY)) {
    gameState = "lost";
  }
}

// MOVING THE PIECES

// check every filled cell of the shape against the walls, floor and board
function pieceFits(shape, x, y) {
  let fits = true;

  eachFilledCell(shape, function (cell, row, col) {
    let boardCol = x + col;
    let boardRow = y + row;

    if (boardCol < 0 || boardCol >= COLS || boardRow < 0 || boardRow >= ROWS || board[boardRow][boardCol] !== 0) {
      fits = false;
    }
  });
  return fits;
}

// dx is -1 for left, 1 for right
function movePiece(dx) {
  if (pieceFits(pieceShape, pieceX + dx, pieceY)) {
    pieceX += dx;
  }
}

function rotateClockwise(shape) {
  let size = shape.length;
  let turned = makeGrid(size, size);

  eachFilledCell(shape, function (cell, row, col) {
    turned[col][size - 1 - row] = { ...cell, rot: (cell.rot + 1) % 4 };
  });
  return turned;
}

function rotatePiece() {
  let turned = rotateClockwise(pieceShape);

  for (let dx of [0, -1, 1]) {
    if (pieceFits(turned, pieceX + dx, pieceY)) {
      pieceShape = turned;
      pieceX += dx;
      return;
    }
  }
}

// move down one row, or lock the piece if it can't go any lower
function stepDown() {
  if (pieceFits(pieceShape, pieceX, pieceY + 1)) {
    pieceY += 1;
  } else {
    lockPiece();
  }
}

function hardDrop() {
  while (pieceFits(pieceShape, pieceX, pieceY + 1)) {
    pieceY += 1;
  }
  lockPiece();
}

// drop the piece one row each time enough time has passed
function updateFall() {
  let waitTime = FALL_MS;
  if (keyIsDown(DOWN_ARROW) || keyIsDown("83")) { // 83 = s key
    waitTime = SOFT_DROP_MS;
  }

  if (millis() - lastFallTime >= waitTime) {
    lastFallTime = millis();
    stepDown();
  }
}

// LOCKING AND CLEARING 
// copy the piece into the board, clear rows, then win or bring in the next piece
// Commit the falling item to the grid, clear complete rows, and check victory.
function lockPiece() {
  lockedItemCount += 1;

  eachFilledCell(pieceShape, function (cell, row, col) {
    cell.itemNumber = lockedItemCount;
    board[pieceY + row][pieceX + col] = cell;
  });

  clearRows();

  if (linesCleared >= TARGET_LINES) {
    gameState = "won";
  } else {
    spawnPiece();
  }
}

// Scan from top to bottom; removing a row shifts only the rows above it.
function clearRows() {
  let brokenItems = [];
  const clearedBefore = linesCleared;

  for (let row = 0; row < ROWS; row++) {
    if (!board[row].includes(0)) {
      // remember which items lose a part in this row
      for (let cell of board[row]) {
        brokenItems.push(cell.itemNumber);
      }

      board.splice(row, 1);
      board.unshift(makeRow(COLS));
      linesCleared += 1;
    }
  }

  // One sound per row-clear event, including simultaneous multi-row clears.
  if (linesCleared > clearedBefore) playMiniLineClear();

  eachFilledCell(board, function (cell, row, col) {
    if (brokenItems.includes(cell.itemNumber)) {
      board[row][col] = makeCrate();
    }
  });
}

// INPUTS

function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";
  } else if (gameState === "paused") {
    gameState = "playing";
    // restart the timer so the piece doesn't drop the moment we resume
    lastFallTime = millis();
  }
}

function keyPressed() {
  // lowercase so the letter keys still work with caps lock on
  let letter = key.toLowerCase();

  if (letter === "p") {
    togglePause();
  }

  if (gameState === "playing") {
    if (keyCode === LEFT_ARROW || letter === "a") {
      movePiece(-1);
    } else if (keyCode === RIGHT_ARROW || letter === "d") {
      movePiece(1);
    } else if (keyCode === UP_ARROW || letter === "w") {
      rotatePiece();
    } else if (key === " ") {
      hardDrop();
    }
  }
}

// stop the arrow keys and space from scrolling the page. p5 skips keyPressed for
// held-down (repeating) keys, so returning false there missed held soft drops.
window.addEventListener("keydown", function (event) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
});

function mouseOverButton(x, y, w) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + 32;
}

function mouseClicked() {
  if (gameState === "start") {
    playMiniClick();
    startRound();
  } else if (gameState === "playing" || gameState === "paused") {
    if (mouseOverButton(GIVE_UP_X, GIVE_UP_Y, GIVE_UP_W)) {
      playMiniClick();
      gameState = "quit";
    }
  } else if (gameState === "won" || gameState === "lost" || gameState === "quit") {
    if (mouseOverButton(NEW_ROUND_X, NEW_ROUND_Y, NEW_ROUND_W)) {
      playMiniClick();
      if (EMBEDDED) {
        // report back to the main shop game, which closes this iframe
        window.parent.postMessage({ type: "storageTetrisResult", won: gameState === "won" }, window.location.origin);
      } else {
        startRound();
      }
    }
  }
}

// DRAWING

// x and y are canvas pixels.
// the cell shows one slice of its item's image. the whole piece turns, so each cell moved to a new position AND its slice turns by the same amount, which is why we spin around the cell's center before drawing the crop.
function drawCell(x, y, cell) {
  let piece = PIECES[cell.id];

  // no usable image, so draw a filled square
  if (piece.image === null) {
    fill(piece.color);
    rect(x, y, CELL, CELL);
    return;
  }

  let sliceW = piece.image.width / piece.cols;
  let sliceH = piece.image.height / piece.rows;
  let sx = cell.sc * sliceW;
  let sy = cell.sr * sliceH;

  push();
  translate(x + CELL / 2, y + CELL / 2);
  rotate(cell.rot * HALF_PI);
  image(piece.image, -CELL / 2, -CELL / 2, CELL, CELL, sx, sy, sliceW, sliceH);
  pop();
}

// draws a shape with its top left corner at canvas pixels x, y
function drawShape(shape, x, y) {
  eachFilledCell(shape, function (cell, row, col) {
    drawCell(x + col * CELL, y + row * CELL, cell);
  });
}

function drawBoard() {
  // wooden frame with a dark inside, 9 is the width of pixelBoard's border
  pixelBoard(BOARD_X - 9, BOARD_Y - 9, COLS * CELL + 18, ROWS * CELL + 18);
  fill(65, 40, 28); // tried to replicate color from main game with help of color picker
  rect(BOARD_X, BOARD_Y, COLS * CELL, ROWS * CELL);

  drawShape(board, BOARD_X, BOARD_Y);
}

function drawSidePanel() {
  pixelBoard(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
  let centerX = PANEL_X + PANEL_W / 2;
  let leftX = PANEL_X + 24;

  fill(65, 40, 28);
  textAlign(CENTER);
  textSize(17);
  text("STORAGE REORGANIZATION", centerX, 58);

  textSize(17);
  text("NEXT", centerX, 92);
  drawNextBox();

  fill(65, 40, 28);
  text("ROWS CLEARED " + linesCleared + " / " + TARGET_LINES, centerX, 262);

  textAlign(LEFT);
  textSize(17);
  text("CONTROLS", leftX, 305);
  textSize(15);
  text("LEFT/RIGHT or A/D: MOVE", leftX, 332);
  text("UP or W: ROTATE CLOCKWISE", leftX, 356);
  text("DOWN or S: SOFT DROP", leftX, 380);
  text("SPACE: HARD DROP", leftX, 404);
  text("P: PAUSE", leftX, 428);

  drawButton("GIVE UP", GIVE_UP_X, GIVE_UP_Y, GIVE_UP_W, color(160, 70, 60));
}

function drawNextBox() {
  fill(65, 40, 28);
  rect(NEXT_BOX_X, NEXT_BOX_Y, NEXT_BOX_SIZE, NEXT_BOX_SIZE);

  // the whole image once, centered, at the same size as on the board
  let piece = PIECES[nextId];
  let w = piece.cols * CELL;
  let h = piece.rows * CELL;
  let x = NEXT_BOX_X + (NEXT_BOX_SIZE - w) / 2;
  let y = NEXT_BOX_Y + (NEXT_BOX_SIZE - h) / 2;

  if (piece.image === null) {
    drawShape(makeCells(nextId), x, y);
  } else {
    image(piece.image, x, y, w, h);
  }
}

function drawPaused() {
  fill(0, 0, 0, 170);
  rect(BOARD_X, BOARD_Y, COLS * CELL, ROWS * CELL);

  fill(255);
  textAlign(CENTER);
  textSize(20);
  text("PAUSED", BOARD_X + COLS * CELL / 2, height / 2);
}

function drawStartScreen() {
  pixelBoard(160, 130, 544, 320);

  fill(65, 40, 28);
  textAlign(CENTER);
  textSize(27);
  text("STORAGE REORGANIZATION", 432, 189);

  textSize(19);
  text("CLEAR 5 ROWS TO WIN!", 432, 229);
  textSize(16);
  text("LEFT/RIGHT OR A/D: MOVE", 432, 272);
  text("UP OR W: ROTATE CLOCKWISE", 432, 299);
  text("DOWN OR S: SOFT DROP", 432, 326);
  text("SPACE: HARD DROP  |  P: PAUSE", 432, 353);

  textSize(19);
  text("CLICK TO START", 432, 415);
}

function drawEndPanel() {
  // darken the background
  noStroke();
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  pixelBoard(160, 130, 544, 320);

  let title = "YOU QUIT";
  fill(65, 40, 28);
  if (gameState === "won") {
    title = "YOU WIN!";
    fill(70, 115, 65);
  } else if (gameState === "lost") {
    title = "GAME OVER";
    fill(160, 70, 60);
  }

  textAlign(CENTER);
  textSize(20);
  text(title, 432, 215);

  fill(65, 40, 28);
  textSize(16);
  text("ROWS CLEARED: " + linesCleared, 432, 290);

  drawButton(EMBEDDED ? "RETURN TO SHOP" : "NEW ROUND", NEW_ROUND_X, NEW_ROUND_Y, NEW_ROUND_W, color(70, 115, 65));
}

// same panel as the main game
function pixelBoard(x, y, w, h) {
  noStroke();

  fill(65, 40, 28);
  rect(x, y, w, h);

  fill(145, 91, 51);
  rect(x + 4, y + 4, w - 8, h - 8);

  fill(221, 191, 143);
  rect(x + 9, y + 9, w - 18, h - 18);
}

// same button as the main game
function drawButton(label, x, y, w, colorValue) {
  noStroke();

  fill(colorValue);
  rect(x, y, w, 32);

  fill(255);
  textAlign(CENTER);
  textSize(16);

  text(label, x + w / 2, y + 21);
}
