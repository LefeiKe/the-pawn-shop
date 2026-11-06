// ============================================================
// MAIN GAME
// ============================================================

let customerRoute = [
  { x: 170, y: 510 },  // 0: Enter through left door
  { x: 170, y: 410 },  // 1: Walk up
  { x: 530, y: 410 },  // 2: Walk right
  { x: 530, y: 270 },  // 3: Walk up
  { x: 590, y: 270 },  // 4: Walk right, stop to trade
  { x: 590, y: 380 },  // 5: Walk down
  { x: 650, y: 380 },  // 6: Walk right
  { x: 650, y: 510 }   // 7: Walk down, exit
];

let shopkeeperRoute = [
  { x: 770, y: 170 },  // 0: Start at back door
  { x: 770, y: 260 },  // 1: Walk down
  { x: 710, y: 260 },  // 2: Walk left
];

let shopBg, shopkeeper, vaseSpriteSheet;
let shopkeeperActor;
let currentCustomer;
let completedVaseIndexes = [];
const maxCompletedVases = 4;
const vaseSpriteSize = 2016;
const vaseSpriteCols = 2;
const vaseBounds = [
  { x: 0, y: 0, w: 2016, h: 2016 },
  { x: 250, y: 0, w: 1516, h: 2016 },
  { x: 350, y: 0, w: 1316, h: 2016 },
  { x: 50, y: 0, w: 1916, h: 2016 }
];

class Customer {
  constructor(name, type, sprite, portrait) {
    this.name = name;
    this.type = type;
    this.sprite = sprite;
    this.portrait = portrait;
    this.x = 170;
    this.y = 510;
    this.speed = 2;
    this.size = 144;
    this.routeIndex = 1;
    this.direction = 7;
    this.state = "entering";
  }

  move() {
    if (this.state !== "entering" && this.state !== "leaving") return;
    let target = customerRoute[this.routeIndex];

    if (this.x < target.x) {
      this.x = min(this.x + this.speed, target.x);
      this.direction = 6;
    } else if (this.x > target.x) {
      this.x = max(this.x - this.speed, target.x);
      this.direction = 5;
    } else if (this.y < target.y) {
      this.y = min(this.y + this.speed, target.y);
      this.direction = 4;
    } else if (this.y > target.y) {
      this.y = max(this.y - this.speed, target.y);
      this.direction = 7;
    }

    if (this.x === target.x && this.y === target.y) {
      if (this.routeIndex === 4 && this.state === "entering") {
        this.state = "waiting";
      } else if (this.routeIndex === 7) {
        this.state = "gone";
      } else {
        this.routeIndex++;
      }
    }
  }

  display() {
    if (this.state === "gone" || !this.sprite) return;
    let walkFrame = floor(frameCount / 12) % 4;
    let idleFrame = floor(frameCount / 30) % 2;
    let col, row;
    if (this.state === "waiting") {
      col = idleFrame + 4; row = 0;
    } else if (this.direction === 4) {
      col = walkFrame; row = 2;
    } else if (this.direction === 5) {
      col = walkFrame + 4; row = 2;
    } else if (this.direction === 6) {
      col = walkFrame; row = 3;
    } else {
      col = walkFrame + 4; row = 3;
    }
    drawSprite(this.sprite, this.x, this.y, this.size, col, row);
  }

  leave() {
    this.state = "leaving";
    this.routeIndex = 5;
  }
}

class Shopkeeper {
  constructor(sprite) {
    this.sprite = sprite;
    this.x = 770;
    this.y = 170;
    this.speed = 1;
    this.size = 144;
    this.routeIndex = 1;
    this.state = "entering";
  }

  move() {
    if (this.state !== "entering" && this.state !== "leaving") return;
    let target = shopkeeperRoute[this.routeIndex];
    if (this.x < target.x) this.x = min(this.x + this.speed, target.x);
    else if (this.x > target.x) this.x = max(this.x - this.speed, target.x);
    if (this.y < target.y) this.y = min(this.y + this.speed, target.y);
    else if (this.y > target.y) this.y = max(this.y - this.speed, target.y);

    if (this.x === target.x && this.y === target.y) {
      if (this.state === "entering") {
        if (this.routeIndex < shopkeeperRoute.length - 1) this.routeIndex++;
        else this.state = "working";
      } else if (this.state === "leaving") {
        if (this.routeIndex === 1) this.routeIndex = 0;
        else this.state = "gone";
      }
    }
  }

  display() {
    if (this.state === "gone") return;
    let walkFrame = floor(frameCount / 12) % 4;
    let idleFrame = floor(frameCount / 30) % 2;
    let col, row;
    if (this.state === "working") {
      col = idleFrame + 2; row = 0;
    } else if (this.state === "entering") {
      col = this.routeIndex === 1 ? walkFrame : walkFrame + 4;
      row = 2;
    } else {
      col = this.routeIndex === 1 ? walkFrame : walkFrame + 4;
      row = 3;
    }
    drawSprite(this.sprite, this.x, this.y, this.size, col, row);
  }

  leave() {
    this.state = "leaving";
    this.routeIndex = shopkeeperRoute.length - 2;
  }

  reset() {
    this.x = 770;
    this.y = 170;
    this.routeIndex = 1;
    this.state = "entering";
  }
}

// A Product object stores the information for one shop item.
class Product {
  constructor(name, category, value) {
    this.name = name;
    this.category = category;
    this.value = value;
  }
}

const products = [
    new Product("Watch", "Daily", 35),
    new Product("Phone", "Daily", 60),
    new Product("Bread", "Food", 15),
    new Product("Apple", "Food", 10),
    new Product("Hammer", "Tools", 40),
    new Product("Shovel", "Tools", 30),
    new Product("Clock", "Daily", 25),
    new Product("Backpack", "Daily", 30),
    new Product("Cheese", "Food", 18),
    new Product("Chocolate", "Food", 12),
    new Product("Screwdriver", "Tools", 20),
    new Product("Wrench", "Tools", 28),
    // Supplier-only stock (not sold to the player by walk-in customers).
    new Product("Wine", "Food", 40),
    new Product("Camera", "Daily", 70),
    new Product("Drill", "Tools", 60),
    // Posh Patron exclusive items. Other customers can buy these from the shop.
    new Product("Pearl Necklace", "Daily", 150),
    new Product("Leather Handbag", "Daily", 130),
    new Product("Telescope", "Tools", 160),
    new Product("Sewing Machine", "Tools", 140),
    new Product("Champagne", "Food", 100),
    new Product("Premium Whiskey", "Food", 120)
];
const poshProductStart = products.length - 6;

let gamePaused = false;
let pauseStart = 0;
let gameOver = false;

let inventory = [];
let money = 150;
let customerNumber = 0;
let dailyCustomerLimit = 5;
let customersLeft = 5;
let dayNumber = 1;

// Inspector visits are separate from the daily customer quota.
let nextInspectionDay = 3;
let latestInspectionGrade = '';
let inspectorNotice = false;
let inspectorNoticePausedGame = false;

let showIntro = true;
let dayStarted = false;
let closing = false;
let startTime = 0;
let nextArrival = 0;
let nextMorning = 0;
let poshGamePending = false;
let poshOfferActive = false;
let poshGameOverlay;
let poshGameFrame;
let poshGamePausedShop = false;
let poshOfferPausedShop = false;

// Each day ends after its customer quota is served.
const bagLimit = 6;



let currentTrade;
let showBag = false;
let bagPage = 0;
let message = "";
let selectedItems = [];
let dailyLog = [];
let showReceipt = false;
let showBudgetWarning = false;

async function setup() {
  let canvas = createCanvas(864, 576);
  canvas.parent("game");
  noSmooth();
  textFont("Pixelify Sans");
  poshGameOverlay = document.getElementById("posh-game-overlay");
  poshGameFrame = document.getElementById("posh-game-frame");
  document.getElementById("close-posh-game").addEventListener("click", closePoshGame);
  window.addEventListener("message", handleVasePuzzleMessage);

  shopBg = await loadImage("images/shop.png");
  vaseSpriteSheet = await loadImage("vasePuzzle/images/vases.png");
  shopkeeper = await loadImage("images/shopkeeper.png");
  shopkeeperActor = new Shopkeeper(shopkeeper);
  currentCustomer = new Customer("", "", null, null);
  currentCustomer.state = "gone";
  phoneSheet = await loadImage("images/phone.png");

  // Each customer has a walking sprite sheet and a trading portrait.
  for (let customer of pawnProfiles) {
    // Morgan temporarily uses Noah's artwork until a Wholesaler portrait is added.
    let file = (customer.name === "Morgan" ? "noah" : customer.name.toLowerCase()) + ".png";
    pawnSprites[customer.name] = await loadImage("images/customer_spritesheets/" + file);
    pawnPortraits[customer.name] = await loadImage("images/customer_portraits/" + file);
  }
  pawnReady = true;
}

function handleVasePuzzleMessage(event) {
  if (!poshGameFrame || event.source !== poshGameFrame.contentWindow) return;
  if (event.data?.type !== "vasePuzzleCompleted") return;
  if (!Number.isInteger(event.data.vaseIndex) ||
      event.data.vaseIndex < 0 || event.data.vaseIndex >= vaseBounds.length) return;
  completedVaseIndexes.push(event.data.vaseIndex);
}

function showPoshGame() {
  if (!poshGameOverlay || !poshGameFrame || !poshGameOverlay.hidden) return;
  poshGamePending = false;
  poshGamePausedShop = !gamePaused;
  if (poshGamePausedShop) togglePause();
  poshGameFrame.src = poshGameFrame.dataset.src;
  poshGameOverlay.hidden = false;
}

function showPoshOffer() {
  if (poshOfferActive) return;
  poshOfferActive = true;
  poshOfferPausedShop = !gamePaused;
  if (poshOfferPausedShop) togglePause();
}

function choosePoshOffer(choice) {
  if (!poshOfferActive) return;
  poshOfferActive = false;
  if (poshOfferPausedShop) togglePause();
  poshOfferPausedShop = false;

  if (choice === 'play') {
    showPoshGame();
    return;
  }

  poshGamePending = false;
  finishTrade();
}

function closePoshGame() {
  if (!poshGameOverlay || !poshGameFrame) return;
  poshGameOverlay.hidden = true;
  poshGameFrame.src = "";
  if (poshGamePausedShop) togglePause();
  poshGamePausedShop = false;
}

function drawCompletedVase() {
  if (!vaseSpriteSheet) return;
  for (let i = 0; i < completedVaseIndexes.length; i++) {
    let vaseIndex = completedVaseIndexes[i];
    let bounds = vaseBounds[vaseIndex];
    let cellX = (vaseIndex % vaseSpriteCols) * vaseSpriteSize;
    let cellY = floor(vaseIndex / vaseSpriteCols) * vaseSpriteSize;
    image(vaseSpriteSheet, 300 + i * 32, 268, 30, 30,
      cellX + bounds.x, cellY + bounds.y, bounds.w, bounds.h);
  }
}


    

// Reusable pixel-art board
function pixelBoard(x, y, w, h) {
    noStroke();

    fill(65, 40, 28);
    rect(x, y, w, h);

    fill(145, 91, 51);
    rect(x + 4, y + 4, w - 8, h - 8);

    fill(221, 191, 143);
    rect(x + 9, y + 9, w - 18, h - 18);
}



function drawIntro() {
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);
    pixelBoard(90, 55, 684, 470);
  
    textFont("Pixelify Sans");
    fill(65, 40, 28);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(29);
    text("WELCOME TO PIXEL PAT'S PAWNS AND PARCELS", width / 2, 102);
  
    textStyle(NORMAL);
    textSize(18);
    text("Be prudent and profitable to help your little shop prosper!", width / 2, 133);
  
    // How to play
    fill(65, 40, 28);
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(21);
    text("HOW TO PLAY", 142, 183);
  
    textStyle(NORMAL);
    textSize(17);
    text("Buy items from customers.", 142, 213);
    text("Sell items that match the buyer's category.", 142, 242);
    text("Use your earnings to unlock shop upgrades.", 142, 271);
    text("Explore new mechanisms as the game moves on!", 142, 300);
  
    // Tips for making smart deals
    fill(237, 218, 188);
    noStroke();
    rect(123, 312, 620, 123);
  
    fill(65, 40, 28);
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(21);
    text("BEFORE YOU MAKE A DEAL...", 142, 343);
  
    textStyle(NORMAL);
    textSize(16);
    text("Look at the price, your budget, and available bag space.", 142, 369);
    text("Not every offer is a good deal.", 142, 393);
    text("Don't spend all your money!", 142, 417);
  
    // Daily rules
    fill(86, 61, 42);
    textAlign(CENTER);
    textSize(15);
  
    drawButton("START GAME", 317, 474, 220, true, color(70, 115, 65));
  }
  

// Day and money

// Clock from 8 AM to midnight
function drawClock() {
  pixelBoard(672, 10, 182, 55);
  fill(65, 40, 28);
  textAlign(CENTER);
  textSize(15);
  text(customersLeft + " CUSTOMERS LEFT", 763, 44);
}

function togglePause() {

  if (!gamePaused) {
      // Pause the game
      gamePaused = true;
      pauseStart = millis();
  }
  else {
      // Resume the game
      let pausedDuration = millis() - pauseStart;

      startTime += pausedDuration;
      nextArrival += pausedDuration;
      nextMorning += pausedDuration;

      gamePaused = false;
  }
}

// Inventory bag icon
function drawBagIcon() {
    pixelBoard(230, 10, 88, 76);

    fill(90, 57, 35);
    noStroke();

    rect(256, 41, 36, 28);
    rect(263, 34, 22, 8);

    fill(221, 191, 143);
    rect(269, 34, 10, 5);

    fill(65, 40, 28);
    textAlign(CENTER);
    textSize(12);

    text("BAG " + inventory.length, 275, 31);
}

// Inventory window

function drawGameOver() {

  // Darken the background
  noStroke();
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  // Game over window
  pixelBoard(160, 130, 544, 320);

  fill(160, 70, 60);
  textAlign(CENTER);
  textSize(24);
  text("GAME OVER", 432, 195);

  fill(65, 40, 28);
  textSize(14);

  text("YOUR SHOP HAS GONE BANKRUPT!", 432, 250);
  text("FINAL BALANCE: $" + money.toFixed(2), 432, 290);
  text("YOU SURVIVED " + dayNumber + " DAYS", 432, 330);

  drawButton("RESTART GAME", 307, 375, 250, true,
             color(70, 115, 65));
}




// Check whether the shop should close
// updateDay is defined by its final game-specific implementation below.

// Shopkeeper enters in the morning and leaves at night



// Random delay between customers

// Random customer and transaction



// Customer enters, stops, and exits

function moveCustomer() {
  if (currentCustomer.state === "gone") {
    if (dayStarted && !closing && customersLeft > 0 && millis() >= nextArrival) generateCustomer();
    return;
  }
  let previousState = currentCustomer.state;
  currentCustomer.move();
  if (previousState === "leaving" && currentCustomer.state === "gone") {
    if (!closing) {
      customersLeft--;
      if (customersLeft <= 0) {
        customersLeft = 0;
        closing = true;
        shopkeeperActor.leave();
      } else scheduleCustomer();
    } else shopkeeperActor.leave();
  }
}


// Animate the characters


function drawCharacters() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, width, 250);
  drawingContext.clip();
  shopkeeperActor.display();
  drawingContext.restore();
  currentCustomer.display();
}

// Draw a frame from a sprite sheet
function drawSprite(sheet, feetX, feetY, size, col, row) {

  let offsetX = 0;
  let offsetY = 0;

  image(
      sheet,
      feetX - size / 2 + offsetX,
      feetY - size * 39 / 48 + offsetY,
      size, size,
      col * 48, row * 48,
      48, 48
  );
}

// Pixel-art button
function drawButton(label, x, y, w, enabled, colorValue) {
    noStroke();
    fill(enabled ? colorValue : color(110, 103, 91));
    rect(x, y, w, 32);

    fill(255);
    textAlign(CENTER);
    textStyle(NORMAL);
    // Enlarge button labels, but shrink longer labels so they never spill out.
    let buttonSize = 16;
    textSize(buttonSize);
    while (textWidth(label) > w - 14 && buttonSize > 10) {
        buttonSize--;
        textSize(buttonSize);
    }
    text(label, x + w / 2, y + 22);
}

function drawBudgetWarning() {

  let expected = selectedTotal();
  let actual = min(expected, currentTrade.budget);
  let difference = expected - actual;

  // Darken the screen
  fill(0, 0, 0, 160);
  noStroke();
  rect(0, 0, width, height);

  // Warning window
  pixelBoard(150, 170, 564, 240);

  fill(65, 40, 28);
  textAlign(CENTER);

  textSize(18);
  text("BUDGET WARNING", 432, 210);

  textSize(14);
  text("Expected: $" + expected.toFixed(2), 432, 250);
  text("Buyer can pay: $" + actual.toFixed(2), 432, 280);
  text("You earn $" + difference.toFixed(2) + " less.", 432, 310);

  drawButton("ACCEPT", 185, 345, 180,
             true, color(70, 115, 65));

  drawButton("CANCEL", 500, 345, 180,
             true, color(160, 70, 60));
}







// Price a buyer offers for one item

// Inventory items available to this buyer


function availableItems() {

  let result = [];

  for (let i = 0; i < inventory.length; i++) {

      let item = products[inventory[i].product];

      // Only show items from the requested category
      if (item.category === currentTrade.category) {
          result.push(i);
      }
  }

  return result;
}


// Total price of selected inventory items
function selectedTotal() {

  let total = 0;

  for (let index of selectedItems) {
      total += buyerPrice(inventory[index].product);
  }

  return Number(total.toFixed(2));
}

// Total cost of a seller's bundle

// Customer dialogue board




// Complete a transaction

// Handle mouse clicks

function handleBasicClick() {
  // Game over restart button
  if (gameOver) {

    if (mouseX >= 307 && mouseX <= 557 &&
        mouseY >= 375 && mouseY <= 407) {

        restartGame();
    }

    return;
  }
  // Introduction screen
  if (showIntro) {

    if (mouseX >= 317 && mouseX <= 547 &&
        mouseY >= 474 && mouseY <= 506) {

      showIntro = false;

    }

    return;
  }
  // Receipt close button
  if (showReceipt) {

    if (mouseX >= 340 && mouseX <= 524 &&
        mouseY >= 483 && mouseY <= 515) {

        showReceipt = false;

        // Allow next day to begin after 2 seconds
        nextMorning = millis() + 2000;
    }

    return;
  }
  if (showBudgetWarning) {

    // ACCEPT
    if (mouseX >= 185 && mouseX <= 365 &&
        mouseY >= 345 && mouseY <= 377) {

        completeBuyerSale();
    }

    // CANCEL
    else if (mouseX >= 500 && mouseX <= 680 &&
             mouseY >= 345 && mouseY <= 377) {

        showBudgetWarning = false;
    }

    return;
  }

  // Disable other interactions while paused
  if (gamePaused) {
    return;
  }

  // Open or close bag
  if (mouseX >= 230 && mouseX <= 318 &&
      mouseY >= 10 && mouseY <= 86) {

      showBag = true;
      bagPage = 0;
      return;
  }

  if (showBag || closing || currentCustomer.state !== "waiting") {
      return;
  }

  // REJECT button
  if (mouseX >= 505 && mouseX <= 690 &&
      mouseY >= 520 && mouseY <= 552) {

      finishTrade();
      return;
  }

  // Seller offering a bundle
  if (currentTrade.type === "sell") {

      if (mouseX >= 150 && mouseX <= 335 &&
          mouseY >= 520 && mouseY <= 552) {

          let total = bundleTotal();

          if (money < total ||
              inventory.length + currentTrade.items.length > bagLimit) {
              return;
          }

          // Pay for every item
          money -= total;

          // Add every item to inventory
          for (let index of currentTrade.items) {

            inventory.push({
                product: index,
                boughtFor: products[index].value
            });
        
            // Record each purchased item
            dailyLog.push({
                type: "BUY",
                name: products[index].name,
                amount: products[index].value
            });
        }
        
        finishTrade();
      }

      return;
  }

  // Buyer: select or deselect items
  let entries = availableItems();

  for (let j = 0; j < entries.length; j++) {

      let x = 135 + (j % 2) * 305;
      let y = 414 + floor(j / 2) * 33;

      if (mouseX >= x && mouseX <= x + 280 &&
          mouseY >= y && mouseY <= y + 32) {

          let index = entries[j];
          let position = selectedItems.indexOf(index);

          if (position === -1) {
              // Select this item
              selectedItems.push(index);
          }
          else {
              // Deselect this item
              selectedItems.splice(position, 1);
          }

          return;
      }
  }

  
    // Confirm selling selected items
    if (mouseX >= 150 && mouseX <= 335 &&
      mouseY >= 520 && mouseY <= 552) {

      if (selectedItems.length === 0) {
          return;
      }

      if (selectedTotal() > currentTrade.budget) {
          showBudgetWarning = true;
      }
      else {
          completeBuyerSale();
      }

      return;
    }

}


// ============================================================
// CUSTOMER PORTRAITS AND TRADING
// ============================================================

// The Pawn Shop - customer sprites, portraits and redesigned trading screen.
// Load AFTER sketch.js. Uses only p5.js + ordinary JavaScript.
// Asset folders: images/customer_spritesheets/ and images/customer_portraits/

// Each visitor has a name and a customer type.
class CustomerProfile {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
}

let pawnProfiles = [
  new CustomerProfile('Mia', 'Regular'), new CustomerProfile('Noah', 'Regular'),
  new CustomerProfile('Emma', 'Regular'), new CustomerProfile('Leo', 'Regular'),
  new CustomerProfile('Rose', 'Regular'), new CustomerProfile('Sophie', 'Regular'),
  new CustomerProfile('Jay', 'Bargain'), new CustomerProfile('Lily', 'Bargain'),
  new CustomerProfile('Victoria', 'Collector'), new CustomerProfile('Edward', 'Collector'),
  new CustomerProfile('Marcus', 'Suspicious'),
  new CustomerProfile('Morgan', 'Wholesaler'), new CustomerProfile('Alex', 'Inspector')
];
let pawnSprites = {};
let pawnPortraits = {};
let pawnVisitor = null;
let pawnMessage = '';
let pawnRelationship = {Regular:50,Bargain:50,Collector:50,Suspicious:50};
let pawnReady = false;
let pawnIntroSeen = {Regular:false,Bargain:false,Collector:false,Suspicious:false,Wholesaler:false};
let pawnIntroType = '';
let pawnIntroPausedGame = false;
let pawnConversation = '';
const pawnTypeNames = {Regular:"PAL OF PAT'S",Bargain:'PENNY PINCHER',Collector:'POSH PATRON',Suspicious:'PRECARIOUS PURVEYORS',Wholesaler:'WHOLESALER',Inspector:'PAWN SHOW PATROLLER'};
const pawnTypeExplanations = {
  Regular:["PALS OF PAT'S","The most common visitors to your pawn shop.","Fair trades help build trust over time."],
  Bargain:['PENNY PINCHERS','These customers have tighter budgets.','They are especially difficult to negotiate with.'],
  Collector:['POSH PATRONS','Wealthy collectors who bring expensive items to sell.','They have generous budgets and pay more for valuable goods.'],
  Suspicious:['PRECARIOUS PURVEYORS','They offer tempting prices, but trades carry a risk.','Other customers may lose trust in your shop.'],
  Wholesaler:['WHOLESALERS','They bring five items and offer fixed wholesale prices.','Choose what to buy. They do not bargain.']
};
const pawnDialogue = {
  Regular:{sell:['I FOUND A FEW THINGS TO SELL.','WOULD YOU BE INTERESTED IN THESE?','I HOPE THIS IS A FAIR PRICE.'],category:['DO YOU HAVE ANYTHING USEFUL?','I AM LOOKING FOR SOMETHING TODAY.','LET ME SEE WHAT YOU HAVE IN STOCK.']},
  Bargain:{sell:['I THINK THIS IS A GREAT DEAL.','HOW MUCH CAN YOU GIVE ME?','I REALLY NEED A GOOD PRICE.'],category:['MY BUDGET IS A LITTLE TIGHT.','ANY CHANCE OF A GOOD DEAL?','I AM TRYING NOT TO SPEND TOO MUCH.']},
  Collector:{sell:['THIS MIGHT INTEREST YOU.','I BROUGHT SOMETHING FROM MY COLLECTION.','I KNOW GOOD ITEMS WHEN I SEE THEM.'],category:['I AM LOOKING FOR SOMETHING SPECIAL.','QUALITY MATTERS MORE THAN PRICE.','SHOW ME YOUR FINEST STOCK.']},
  Wholesaler:{sell:['I HAVE FIVE ITEMS AT WHOLESALE PRICES.'],category:['I BUY AT A FIXED PRICE.']},
  Suspicious:{sell:['NO NEED TO ASK TOO MANY QUESTIONS.','I HAVE AN INTERESTING OFFER FOR YOU.','TRUST ME, THIS IS A BARGAIN.'],category:['JUST SHOW ME WHAT YOU HAVE.','I AM ONLY LOOKING AROUND.','KEEP THIS BETWEEN US, ALL RIGHT?']}
};
// pawnNewConversation is defined by its final game-specific implementation below.
function pawnDrawIntro() {
  noStroke(); fill(0,0,0,190); rect(0,0,width,height);
  pawnPanel(123,116,618,341);
  let lines = pawnTypeExplanations[pawnIntroType];
  if (!lines) return;
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(23); text('NEW CUSTOMER TYPE!', 165, 171, 540, 28); };
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(22); text(lines[0], 165, 220, 540, 28); };
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(17); text(lines[1], 165, 272, 540, 28); };
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(17); text(lines[2], 165, 303, 540, 28); };
  pawnButton('CONTINUE',333,381,198,true,color(70,115,65));
}
function pawnDrawPoshOffer() {
  noStroke(); fill(0,0,0,190); rect(0,0,width,height);
  pawnPanel(80,55,704,455);
  fill(63, 40, 30);
  textAlign(CENTER);
  textStyle(NORMAL);
  textSize(20);
  text(`My antique vase shattered! I bought a new one,`, 110, 125, 644, 28);
  text(`but thought I'd donate this old one to the shop.`, 110, 175, 644, 28);
  text(`Would you like to try your hand at restoring it?`, 110, 225, 644, 28);
  text(`If you can fix it, it's yours! I bet some`, 110, 275, 644, 28);
  text(`repair skills would boost the shop's reputation.`, 110, 325, 644, 28);
  pawnButton("Sure, I can take a stab at it", 140, 415, 280, true, color(70,115,65));
  pawnButton('Not today', 444, 415, 280, true, color(156,63,52));
}
function pawnStartIntroIfNeeded() {
  if (!pawnTradeActive() || pawnIntroType || !pawnVisitor) return;
  let t=pawnVisitor.type;
  if (pawnIntroSeen[t] === false) {
    pawnIntroSeen[t] = true;
    pawnIntroType = t;
    pawnIntroPausedGame = !gamePaused;
    if (pawnIntroPausedGame) togglePause();
  }
}
function pawnCloseIntro() {
  pawnIntroType = '';
  if (pawnIntroPausedGame) togglePause();
  pawnIntroPausedGame = false;
}
let pawnRows = []; // [{index,x,y,w,h}] - current clickable buyer rows

// Gradual customer introduction:
// Day 1: regulars only.
// Later days: at most one NEW type per day. Previously unlocked types
// can continue visiting without a limit.
// Inspector is reserved for Sara's future mini-game.
let pawnUnlockedTypes = {Regular:true, Bargain:false, Collector:false, Suspicious:false, Wholesaler:false};
let pawnNewTypeDay = -1;
function pawnPickVisitor(forcedType) {
  let types = ['Regular', 'Bargain', 'Collector', 'Suspicious', 'Wholesaler'];
  if (forcedType) {
    let choices = pawnProfiles.filter(p => p.type === forcedType);
    if (choices.length) return random(choices);
  }
  let weights = [60, 20, 12, 8, 12];
  let allowed = [];
  let total = 0;
  for (let i = 0; i < types.length; i++) {
    let type = types[i];
    let canVisit = (type !== 'Wholesaler' || dayNumber >= 5) &&
      (pawnUnlockedTypes[type] ||
       (dayNumber > 1 && pawnNewTypeDay !== dayNumber));
    if (canVisit) {
      allowed.push({type:type, weight:weights[i]});
      total += weights[i];
    }
  }

  let roll = random(total);
  let selected = 'Regular';
  for (let entry of allowed) {
    if (roll < entry.weight) {
      selected = entry.type;
      break;
    }
    roll -= entry.weight;
  }

  // Lock out OTHER unseen types for the rest of this day.
  if (!pawnUnlockedTypes[selected]) {
    pawnUnlockedTypes[selected] = true;
    pawnNewTypeDay = dayNumber;
  }
  let choices = pawnProfiles.filter(p => p.type === selected);
  return random(choices);
}
function pawnHit(x,y,w,h) {
  return mouseX >= x && mouseX <= x+w && mouseY >= y && mouseY <= y+h;
}
// pawnScore is defined by its final game-specific implementation below.
function pawnChangeScore(amount) {
  if (!pawnVisitor || pawnVisitor.type === 'Wholesaler') return;
  let type = pawnVisitor.type;
  pawnRelationship[type] = constrain(pawnRelationship[type] + amount,0,100);
}
function pawnTradeActive() {
  return pawnReady && !showIntro && !showReceipt && !showBudgetWarning &&
         !gameOver && !closing && currentCustomer.state === 'waiting' && currentTrade;
}

// Keep all the original setup work (shopkeeper, background, original assets).




// Panel with safe padding, fixed positions and no text running off the canvas.
function pawnPanel(x,y,w,h) {
  noStroke();
  fill(60,38,28); rect(x,y,w,h);
  fill(140,91,56); rect(x+4,y+4,w-8,h-8);
  fill(226,196,149); rect(x+10,y+10,w-20,h-20);
}
// Draw readable text without letting it run outside its allotted space.

function pawnButton(label,x,y,w,enabled,shade) {
  noStroke();
  fill(enabled ? shade : color(109,99,84)); rect(x,y,w,36);
  fill(255);
  textAlign(CENTER);
  textStyle(BOLD);
  let size = 17;
  textSize(size);
  while (textWidth(label) > w - 16 && size > 11) {
    size--;
    textSize(size);
  }
  text(label, x + w / 2, y + 25);
  textStyle(NORMAL);
}
function pawnPortrait() {
  pawnPanel(22,95,248,458);
  if (pawnVisitor && pawnPortraits[pawnVisitor.name]) {
    // Squared, already-exported portrait: no new library or image processing.
    image(pawnPortraits[pawnVisitor.name],37,110,218,218);
  }
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(23); text(pawnVisitor ? pawnVisitor.name.toUpperCase() : 'CUSTOMER', 43, 358, 205, 28); };
  // Two lines keep the complete category inside the portrait panel.
  let fullType = pawnVisitor ? pawnTypeNames[pawnVisitor.type] : '';
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(17); text(fullType, 43, 388, 205, 28); };
  if (pawnVisitor && pawnVisitor.type === 'Wholesaler') {
    fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL);
    textSize(15); text('FIXED PRICES', 43, 435);
    textSize(16); text('90% OF MARKET VALUE', 43, 473);
  } else {
    fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL);
    textSize(15); text('REPUTATION', 43, 435);
    fill(115,91,72); rect(43,449,205,14);
    fill(199,139,60); rect(43,449,205*pawnScore()/100,14);
    fill(63, 40, 30); textSize(16);
    text(pawnScore() + ' / 100', 43, 488);
  }
}

// New trade board interactions; all unrelated input still uses existing handler.
function handleCustomerClick() {
  if (pawnIntroType) {
    if (pawnHit(333,381,198,36)) pawnCloseIntro();
    return;
  }
  if (poshOfferActive) {
    if (pawnHit(140, 415, 280, 36)) choosePoshOffer('play');
    else if (pawnHit(444, 415, 280, 36)) choosePoshOffer('leave');
    return;
  }
  if(!pawnTradeActive()) {handleBasicClick();return;}
  if(gamePaused || showBag) {handleBasicClick();return;}
  // Reject current customer.
  if(pawnHit(651,489,152,36)) {
    finishTrade();return;
  }
  if(currentTrade.type==='sell') {
    if(pawnHit(312,489,152,36)) {
      let total=bundleTotal();
      if (inventory.length + reservedStorage() + currentTrade.items.length > shopCapacity()){pawnMessage='NOT ENOUGH SPACE';return;}
      if(total>money){pawnMessage='NOT ENOUGH MONEY';return;}
      money-=total;
      for(let idx of currentTrade.items) {
        inventory.push({product:idx,boughtFor:products[idx].value});
        dailyLog.push({type:'BUY',name:products[idx].name,amount:products[idx].value});
      }
      pawnChangeScore(2);finishTrade();return;
    }
  } else {
    for(let row of pawnRows) {
      if(pawnHit(row.x,row.y,row.w,row.h)) {
        let pos=selectedItems.indexOf(row.index);
        if(pos===-1)selectedItems.push(row.index);
        else selectedItems.splice(pos,1);
        return;
      }
    }
    if(pawnHit(312,489,152,36)) {
      if(!selectedItems.length){pawnMessage='SELECT AN ITEM FIRST';return;}
      if(selectedTotal()>currentTrade.budget)showBudgetWarning=true;
      else completeBuyerSale();
      return;
    }
  }
};



// ============================================================
// SHOP UPGRADES AND RELATIONSHIPS
// ============================================================

// THE PAWN SHOP - relationships, upgrades, bargaining

// Only p5.js + beginner JavaScript (arrays, objects, functions and mousePressed).

let shopMenu = "";             // "people", "upgrades", or ""
let shopMenuPaused = false;
let storageLevel = 0;
let shelvesLevel = 0;
let advertisingLevel = 0;
let priceCatalogOwned = false;
let supplierOwned = [false, false, false];
let upgradePage = 0;
let storagePrices = [120, 250, 500];
let shelvesPrices = [100, 220, 450];
let advertisingPrices = [100, 200, 400];
let supplierNames = ["TIPSY BARREL", "FLASHBACK", "RUSTY WRENCH"];
let supplierProducts = ["Wine", "Camera", "Drill"];
let supplierPrices = [150, 220, 180];
let shopMessage = "";
let shopBargained = false;
let shopTradeMultiplier = 1;
let selectedWholesaleItems = []; // Positions within the Wholesaler's five offered items.
let reputationNotice = '';
let reputationNoticeUntil = 0;

function sellerSelectedItems() {
  return pawnVisitor && pawnVisitor.type === 'Wholesaler' ?
    selectedWholesaleItems.map(i => currentTrade.items[i]) : currentTrade.items;
}

function sellerSelectedTotal() {
  return Number(sellerSelectedItems().reduce((sum, index) =>
    sum + products[index].value * shopTradeMultiplier, 0).toFixed(2));
}

// Only successful Suspicious trades harm a random OTHER customer group's trust.
function suspiciousTradeConsequence() {
  if (!pawnVisitor || pawnVisitor.type !== 'Suspicious') return;
  const groups = [
    {type:'Regular', name:"Pals of Pat's"},
    {type:'Bargain', name:'Penny Pinchers'},
    {type:'Collector', name:'Posh Patrons'}
  ];
  const group = random(groups);
  pawnRelationship[group.type] = constrain(pawnRelationship[group.type] - 5, 0, 100);
  reputationNotice = 'Your reputation among the ' + group.name + ' has declined...';
  reputationNoticeUntil = millis() + 3000;
}

function drawReputationNotice() {
  if (!reputationNotice || millis() >= reputationNoticeUntil ||
      pawnTradeActive() || showIntro || showReceipt || gameOver) return;
  push();
  pixelBoard(123, 106, 618, 62);
  fill(166, 93, 88);
  textAlign(CENTER);
  textStyle(NORMAL);
  textSize(16);
  text(reputationNotice, 432, 145);
  pop();
}

// One centralized capacity check. Used by the trading UI and bag.
// Fix a score of 0 displaying as 50 in the earlier customer UI.
function pawnScore() {
  if (!pawnVisitor) return 50;
  return pawnVisitor.type === 'Wholesaler' ? null : pawnRelationship[pawnVisitor.type];
};

function shopCapacity() {
  if (storageLevel === 1) return bagLimit + 5;
  if (storageLevel === 2) return bagLimit + 10;
  if (storageLevel === 3) return bagLimit + 20;
  return bagLimit;
}

function reservedStorage() {
  let total = 0;

  for (let order of pendingDeliveries) {
    total += order.quantity;
  }

  return total;
}

function shopCloseMenu() {
  shopMenu = "";
  if (shopMenuPaused) togglePause();
  shopMenuPaused = false;
}
function shopOpenMenu(which) {
  shopMenu = which;
  showBag = false;
  if (!gamePaused) {
    togglePause();
    shopMenuPaused = true;
  } else {
    shopMenuPaused = false;
  }
}
function shopMenuCard(x, y, w, h) {
  noStroke();
  fill(116, 78, 51); rect(x, y, w, h);
  fill(243, 219, 180); rect(x + 3, y + 3, w - 6, h - 6);
}
// Same simple text helper used by the menu screens.



function shopDrawPeople() {
  noStroke(); fill(0, 0, 0, 175); rect(0, 0, width, height);
  pixelBoard(116, 57, 632, 462);
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(22); text("CUSTOMER REPUTATION", 145, 102); };
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(14); text("A better reputation increases bargaining success rates.", 145, 131); };

  let groups = ["Regular", "Bargain", "Collector", "Suspicious"];
  let names = ["PALS OF PAT'S", "PENNY PINCHERS", "POSH PATRONS", "PRECARIOUS PURVEYORS"];
  for (let i = 0; i < groups.length; i++) {
    let y = 151 + i * 74;
    let score = pawnRelationship[groups[i]];
    shopMenuCard(140, y, 584, 66);
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(17); text(names[i], 155, y + 22, 450, 28); };
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16); text(score + "/100", 638, y + 22, 70, 28); };
    fill(119, 94, 68); rect(155, y + 36, 548, 12);
    fill(score >= 60 ? color(78, 128, 77) : color(198, 143, 70));
    rect(155, y + 36, 548 * score / 100, 12);
  }
  drawButton("CLOSE", 347, 462, 170, true, color(98, 67, 46));
}

function getUpgradeList() {
  let available = [];
  let owned = [];
  let roman = ["I", "II", "III"];

  if (!priceCatalogOwned) {
    available.push({name:"PRICE CATALOG", description:"Reveals the original value of items to help you make better deals.", price:90, type:"catalog"});
  } else owned.push({name:"PRICE CATALOG"});

  let storageDescriptions = [
    "Expand your storage with 5 additional slots.",
    "Organize your growing inventory and gain 5 more storage slots.",
    "Expand your shop's storage by another 10 slots."
  ];
  let shelvesDescriptions = [
    "Better displays attract buyers willing to pay 5% more for your items.",
    "Improved displays increase your selling prices by another 5%.",
    "Premium displays increase your selling prices by another 5%."
  ];
  let advertisingDescriptions = [
    "A small boost of customers is attracted to your shop each day.",
    "A moderate boost of customers is attracted to your shop each day.",
    "A large boost of customers is attracted to your shop each day."
  ];

  if (storageLevel < 3) available.push({
    name:"STORAGE " + roman[storageLevel],
    description:storageDescriptions[storageLevel],
    price:storagePrices[storageLevel], type:"storage"
  });
  if (shelvesLevel < 3) available.push({
    name:"DISPLAY SHELVES " + roman[shelvesLevel],
    description:shelvesDescriptions[shelvesLevel],
    price:shelvesPrices[shelvesLevel], type:"shelves"
  });
  if (advertisingLevel < 3) available.push({
    name:"ADVERTISING " + roman[advertisingLevel],
    description:advertisingDescriptions[advertisingLevel],
    price:advertisingPrices[advertisingLevel], type:"advertising"
  });

  let partnerships = [
    ["TIPSY BARREL PARTNERSHIP", "Call Tipsy Barrel Brewing Co. to buy wine at wholesale prices."],
    ["FLASHBACK PARTNERSHIP", "Call Flashback Electronics to buy cameras at wholesale prices."],
    ["RUSTY WRENCH PARTNERSHIP", "Call Rusty Wrench Hardware to buy drills at wholesale prices."]
  ];
  for (let i = 0; i < partnerships.length; i++) {
    if (supplierOwned[i]) owned.push({name:partnerships[i][0]});
    else available.push({name:partnerships[i][0], description:partnerships[i][1],
                         price:supplierPrices[i], type:"supplier", supplier:i});
  }
  for (let i = 0; i < storageLevel; i++) owned.push({name:"STORAGE " + roman[i]});
  for (let i = 0; i < shelvesLevel; i++) owned.push({name:"DISPLAY SHELVES " + roman[i]});
  for (let i = 0; i < advertisingLevel; i++) owned.push({name:"ADVERTISING " + roman[i]});
  return available.concat(owned);
}

function shopDrawUpgrades() {
  noStroke(); fill(0, 0, 0, 175); rect(0, 0, width, height);
  pixelBoard(94, 33, 676, 508);
  fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(22);
  text("SHOP UPGRADES", 125, 74);
  textSize(16); text("BALANCE: $" + money.toFixed(2), 125, 103);

  let upgrades = getUpgradeList();
  let totalPages = ceil(upgrades.length / 5);
  upgradePage = constrain(upgradePage, 0, totalPages - 1);

  for (let row = 0; row < 5; row++) {
    let i = upgradePage * 5 + row;
    if (i >= upgrades.length) break;
    let upgrade = upgrades[i];
    let y = 120 + row * 69;
    shopMenuCard(119, y, 626, 62);
    fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(17);
    text(upgrade.name, 134, y + 22);
    textSize(13); text(upgrade.description || "", 134, y + 43, 465);
    let owned = upgrade.price === undefined;
    drawButton(owned ? "OWNED" : "$" + upgrade.price, 609, y + 15, 116,
               !owned && money >= upgrade.price, color(73, 120, 72));
  }
  if (upgradePage > 0) drawButton("<", 245, 467, 58, true, color(98, 67, 46));
  if (upgradePage < totalPages - 1) drawButton(">", 561, 467, 58, true, color(98, 67, 46));
  fill(63, 40, 30); textAlign(CENTER); textSize(14);
  text((upgradePage + 1) + " / " + totalPages, 432, 490);
  drawButton("CLOSE", 350, 501, 166, true, color(98, 67, 46));
}








function shopBuyUpgrade(i) {
  let upgrade = getUpgradeList()[i];
  if (!upgrade || upgrade.price === undefined || money < upgrade.price) return;
  money -= upgrade.price;
  if (upgrade.type === "catalog") priceCatalogOwned = true;
  else if (upgrade.type === "storage") storageLevel++;
  else if (upgrade.type === "shelves") shelvesLevel++;
  else if (upgrade.type === "advertising") advertisingLevel++;
  else if (upgrade.type === "supplier") supplierOwned[upgrade.supplier] = true;
  shopMessage = upgrade.name + " UNLOCKED";
  upgradePage = 0;
}

function handleShopClick() {
  if (pawnIntroType) { handleCustomerClick(); return; }
  if (shopMenu !== "") {
    if (shopMenu === "people") {
      if (pawnHit(347, 462, 170, 32)) shopCloseMenu();
    } else {
      if (pawnHit(350, 501, 166, 32)) { shopCloseMenu(); return; }
      let upgrades = getUpgradeList();
      let totalPages = ceil(upgrades.length / 5);
      if (pawnHit(245, 467, 58, 32) && upgradePage > 0) { upgradePage--; return; }
      if (pawnHit(561, 467, 58, 32) && upgradePage < totalPages - 1) { upgradePage++; return; }
      for (let row = 0; row < 5; row++) {
        let i = upgradePage * 5 + row;
        if (i >= upgrades.length) break;
        if (pawnHit(609, 135 + row * 69, 116, 32)) {
          shopBuyUpgrade(i);
          return;
        }
      }
    }
    return;
  }
  if (!showIntro && !showReceipt && !gameOver && !closing && !showBudgetWarning) {
    if (pawnHit(328, 12, 150, 32)) { shopOpenMenu("people"); return; }
    if (pawnHit(488, 12, 140, 32)) { shopOpenMenu("upgrades"); return; }
  }
  if (pawnTradeActive() && !gamePaused && !showBag &&
      pawnVisitor.type !== 'Wholesaler' && !shopBargained &&
      pawnHit(481, 489, 152, 36)) {
    shopTryBargain(); return;
  }
  // Wholesalers let the shopkeeper select items individually, with a hard
  // storage limit (including space reserved for incoming supplier orders).
  if (pawnTradeActive() && currentTrade.type === 'sell' &&
      pawnVisitor.type === 'Wholesaler' && !gamePaused && !showBag) {
    for (let i = 0; i < currentTrade.items.length; i++) {
      if (pawnHit(306, 235 + i * 43, 504, 41)) {
        const position = selectedWholesaleItems.indexOf(i);
        if (position !== -1) {
          selectedWholesaleItems.splice(position, 1);
          pawnMessage = '';
        } else if (inventory.length + reservedStorage() + selectedWholesaleItems.length >= shopCapacity()) {
          pawnMessage = 'Buying pass storage capacity from wholesaler is not allowed';
        } else {
          selectedWholesaleItems.push(i);
          pawnMessage = '';
        }
        return;
      }
    }
    if (pawnHit(312, 489, 152, 36)) {
      const items = sellerSelectedItems();
      const cost = sellerSelectedTotal();
      if (!items.length) { pawnMessage = 'SELECT AN ITEM FIRST'; return; }
      if (inventory.length + reservedStorage() + items.length > shopCapacity()) {
        pawnMessage = 'Buying pass storage capacity from wholesaler is not allowed'; return;
      }
      if (cost > money) { pawnMessage = 'NOT ENOUGH MONEY'; return; }
      money -= cost;
      for (const index of items) {
        const paid = Number((products[index].value * shopTradeMultiplier).toFixed(2));
        inventory.push({product:index, boughtFor:paid});
        dailyLog.push({type:'BUY', name:products[index].name, amount:paid});
      }
      customerDialogueOutcome = 'accepted';
      finishTrade();
      return;
    }
  }
  // Other customer types still sell their complete bundle.
  if (pawnTradeActive() && currentTrade.type === "sell" &&
      !gamePaused && !showBag && pawnHit(312, 489, 152, 36)) {
    let cost = bundleTotal();
    if (inventory.length + reservedStorage() + currentTrade.items.length > shopCapacity()) {
      pawnMessage = "NOT ENOUGH SPACE"; return;
    }
    if (cost > money) { pawnMessage = "NOT ENOUGH MONEY"; return; }
    money -= cost;
    for (let idx of currentTrade.items) {
      let bought = Number((products[idx].value * shopTradeMultiplier).toFixed(2));
      inventory.push({product:idx, boughtFor:bought});
      dailyLog.push({type:"BUY", name:products[idx].name, amount:bought});
    }
    pawnChangeScore(2);
    suspiciousTradeConsequence();
    customerDialogueOutcome = 'accepted';
    finishTrade();
    return;
  }
  handleCustomerClick();
};




// ============================================================
// CUSTOMER DIALOGUE
// ============================================================

// Dialogue-only update for The Pawn Shop.

// Does not change trading layout, art, fonts, buttons or trade mechanics.


const naturalCustomerLines = {
  Regular: {
    sell: [
      "Hey! Mind taking a look?",
      "I'm clearing out a few things.",
      "What would you offer for these?",
      "Hopefully we can make a deal!",
      "Hey there! Got a minute?",
      "Thought you might like these.",
      "Let's agree on a price!",
      "I could use some extra cash.",
      "Think these are worth something?",
      "Can you make me a good offer?",
      "I don't need these anymore.",
      "I brought a few things to sell.",
      "How much could I get for these?",
      "Hope these catch your interest!",
      "I've got something to show you.",
      "How's business going?",
      "Hope you're having a good day!"
    ],

    category: [
      "Hi! Mind if I look around?",
      "I'm looking for something useful.",
      "Let's see what you've got!",
      "Just passing by!",
      "This place looks interesting!",
      "You never know what you'll find!",
      "I've got some time to browse.",
      "Anything new in stock?",
      "I'm curious what's available.",
      "Oh, you're open! Perfect!",
      "I've heard good things about you!",
      "Looking for a reasonable price.",
      "Anything interesting for sale?",
      "Let's see what catches my eye.",
      "Hope I find something nice!",
      "How's business going?",
      "Hope you're having a good day!"
    ],

    accepted: [
      "Thanks! That worked out nicely.",
      "Great, see you next time!",
      "Pleasure doing business with you.",
      "That's perfect. Thank you!"
    ],

    rejected: [
      "No worries. Maybe next time!",
      "That's all right. Another day!",
      "Oh well, thanks anyway.",
      "Better luck next time!"
    ],

    bargainYes: [
      "Sure, that sounds fair!",
      "All right, I can work with that.",
      "You've got yourself a deal!"
    ],

    bargainNo: [
      "I'd rather keep my price.",
      "Hmm, that doesn't work for me.",
      "I'd prefer not to go any lower."
    ]
  },

  Bargain: {
    sell: [
      "Let's agree on a good price.",
      "Think you can beat my offer?",
      "I've got a great deal for you!",
      "Let's work something out.",
      "I know what these are worth!",
      "Don't try to lowball me!"
    ],

    category: [
      "Got any good deals?",
      "I'm on a tight budget today.",
      "I love finding a bargain!",
      "Let's see those prices!",
      "Hope your prices are reasonable.",
      "Got anything on sale?"
    ],

    accepted: [
      "Not bad! I might come back.",
      "All right, we have a deal.",
      "Now that's more like it!",
      "Fair enough, I suppose."
    ],

    rejected: [
      "Too bad. I'll keep looking.",
      "Guess we can't agree.",
      "Maybe next time!",
      "I'll try somewhere else."
    ],

    bargainYes: [
      "Fine, you drive a hard bargain!",
      "You got me. Deal!",
      "All right, but only this once!"
    ],

    bargainNo: [
      "No thanks. Too expensive!",
      "That's more than I'd like to pay.",
      "I'm not budging on this one.",
      "Nice try! My price stands."
    ]
  },

  Collector: {
    sell: [
      "This might interest your shop.",
      "I'm parting with a few things.",
      "Perhaps you'll appreciate these.",
      "Shall we discuss a price?",
      "I hope you value quality.",
      "I've brought something special."
    ],

    category: [
      "Anything new in your shop?",
      "I do enjoy finding treasures.",
      "Show me what you've got.",
      "I'm here to browse.",
      "I'm looking for something rare.",
      "Anything worth collecting?"
    ],

    accepted: [
      "Excellent. A pleasure!",
      "Splendid! I'm quite pleased.",
      "A satisfactory arrangement.",
      "Very good. Until next time."
    ],

    rejected: [
      "A pity. Perhaps another time.",
      "Very well, I understand.",
      "That's unfortunate.",
      "Perhaps another day."
    ],

    bargainYes: [
      "Very well. That seems reasonable.",
      "I can agree to those terms.",
      "An interesting offer. Accepted."
    ],

    bargainNo: [
      "I'm afraid I must decline.",
      "My original offer is fair.",
      "I see no need to adjust it."
    ]
  },

  Suspicious: {
    sell: [
      "Let's keep this quick.",
      "Need to get these off my hands.",
      "No need for too many questions.",
      "Let's keep this between us.",
      "I'm in a bit of a hurry.",
      "Just give me your best offer."
    ],

    category: [
      "Just looking. Don't mind me.",
      "Got anything interesting?",
      "Let's keep this quiet, okay?",
      "I'm not staying long.",
      "Show me what you've got.",
      "Just passing through."
    ],

    accepted: [
      "Good. We're done here.",
      "Nice doing business. Keep quiet.",
      "All right. I'll be going now.",
      "That's settled, then."
    ],

    rejected: [
      "Suit yourself.",
      "Your loss, I guess.",
      "Forget I was here.",
      "Whatever. I'll find another shop."
    ],

    bargainYes: [
      "Fine. Just make it quick.",
      "All right, you win.",
      "Deal. Now let's move on."
    ],

    bargainNo: [
      "Not a chance.",
      "That's not happening.",
      "My price stays where it is.",
      "You're asking too much."
    ]
  },

  Inspector: {
    sell: [
      "I'd like to discuss an offer.",
      "Let's handle this properly."
    ],

    category: [
      "Mind if I look around?",
      "Interesting shop you've got here."
    ],

    accepted: [
      "Thank you for your cooperation."
    ],

    rejected: [
      "Understood."
    ],

    bargainYes: [
      "That seems reasonable."
    ],

    bargainNo: [
      "I'll have to decline."
    ]
  }
};


let lastCustomerDialogue = '';
let customerReaction = '';
let customerReactionUntil = 0;
let customerDialogueOutcome = 'rejected';

function chooseCustomerLine(kind) {
  let type = pawnVisitor ? pawnVisitor.type : 'Regular';
  let group = naturalCustomerLines[type] || naturalCustomerLines.Regular;
  let choices = group[kind] || group.category;
  let alternatives = choices.filter(s => s !== lastCustomerDialogue);
  let line = random(alternatives.length ? alternatives : choices);
  lastCustomerDialogue = line;
  return line;
}

// Replaces ONLY the words chosen for the existing speech line.
function pawnNewConversation() {
  return chooseCustomerLine(currentTrade.type === 'sell' ? 'sell' : 'category');
};

// Handle bargaining outcomes after the original bargaining calculation.

// Show one brief, customer-only parting remark over the *existing* shop scene.

// Detect completed sales without replacing the existing money/inventory logic.

// Observe the previous game actions so successful purchase has a parting line.
function handleTradeClick() {
  let active = pawnTradeActive() && !gamePaused && !showBag && !pawnIntroType && shopMenu === '';
  let buyingFromCustomer = active && currentTrade.type === 'sell';
  let payButton = buyingFromCustomer && pawnHit(312, 489, 152, 36);
  let eligible = payButton && money >= bundleTotal() &&
    inventory.length + reservedStorage() + currentTrade.items.length <= shopCapacity();
  if (eligible) customerDialogueOutcome = 'accepted';
  handleShopClick();
  // If transaction did not actually end, discard speculative outcome.
  if (eligible && currentCustomer.state === 'waiting') customerDialogueOutcome = 'rejected';
};





// ============================================================
// LANDLORD, RENT, AND TEST TOOLS
// ============================================================

// The Pawn Shop: red telephone, Pixel Pat, upgrades and weekly rent.

// Uses p5.js, arrays, objects, conditions, loops, and mousePressed().

let phoneSheet;
let phonePending = '';  // 'hello', 'upgrades', 'rentReveal', 'rent'
let phoneCall = '';     // active call panel
let phoneSeen = {hello:false, upgrades:false, rentReveal:false};
let helloPage = 0;
let phoneSelected = [];
let phoneSavedPause = false;
let phoneHint = '';
let phoneHintUntil = 0;
let phonePaidToday = false;
let selectedSupplier = -1;
let supplierMessage = "";
let pendingDeliveries = [];
let deliveryNoticeUntil = 0;
let orderConfirmation = "";
let orderConfirmationUntil = 0;
let pendingQuantity = 0;
const phoneX = 673, phoneY = 360, phoneW = 180, phoneH = 180;

// Request the asset at startup. Existing setup() remains the only setup function.


function phoneRentAmount(day) {
  // Rent is due at the end of Days 14, 21, 28...; no decimals.
  return round(10 * pow(1.2, floor(day / 7) - 2));
}

function phoneStart(eventName) {
  phonePending = eventName;
  phoneSelected = [];
  if (eventName === 'hello') helloPage = 0;
  phoneSavedPause = !gamePaused;
  if (phoneSavedPause) togglePause();
}

function phoneCheckEvents() {
  if (showIntro || gameOver || phonePending || phoneCall || pawnIntroType || shopMenu) return;
  if (dayNumber === 1 && !phoneSeen.hello) {
    phoneSeen.hello = true;
    phoneStart('hello');
  } else if (dayNumber === 3 && !phoneSeen.upgrades) {
    phoneSeen.upgrades = true;
    phoneStart('upgrades');
  } else if (showReceipt && dayNumber === 7 && !phoneSeen.rentReveal) {
    phoneSeen.rentReveal = true;
    phoneStart('rentReveal');
  } else if (showReceipt && dayNumber >= 14 && dayNumber % 7 === 0 && !phonePaidToday) {
    phoneStart('rent');
  }
}

function phoneEndCall() {
  phonePending = '';
  phoneCall = '';
  phoneSelected = [];
  selectedSupplier = -1;
  pendingQuantity = 0;
  supplierMessage = "";
  if (phoneSavedPause) togglePause();
  phoneSavedPause = false;
}

// Replace the original daily closing logic, which deducted $10 every day.
// Rent is collected only by the landlord's rent-day call.
function updateDay() {
  if (dayStarted && !closing && customersLeft <= 0) {
    closing = true;
    showBag = false;
    shopkeeperActor.leave();
  }
}
function getDailyCustomers() {
  const base = [5, 7, 10, 13][advertisingLevel] || 5;
  const inspectionChange = latestInspectionGrade === 'A' ? 2 :
                           latestInspectionGrade === 'C' ? -2 : 0;
  return max(3, base + inspectionChange);
}

// Called by the future inspector memory game after its five questions.
// The latest grade changes tomorrow's customer quota, not today's.
function recordInspectionResult(correctAnswers) {
  if (!Number.isInteger(correctAnswers) || correctAnswers < 0 || correctAnswers > 5) return;
  latestInspectionGrade = correctAnswers === 5 ? 'A' :
                          correctAnswers >= 3 ? 'B' : 'C';
}

// Placeholder until Sara's memory game is added. No grade is assigned here.
function checkInspectorVisit() {
  if (!dayStarted || closing || dayNumber !== nextInspectionDay || inspectorNotice ||
      showIntro || showReceipt || gameOver || gamePaused ||
      phonePending || phoneCall || pawnIntroType || shopMenu || showBag ||
      pawnTradeActive() || poshOfferActive || currentCustomer.state !== 'gone') return;

  nextInspectionDay = dayNumber + floor(random(4, 7));
  inspectorNotice = true;
  inspectorNoticePausedGame = !gamePaused;
  if (inspectorNoticePausedGame) togglePause();
}

function drawInspectorNotice() {
  if (!inspectorNotice) return;
  push();
  noStroke();
  fill(0, 0, 0, 170);
  rect(0, 0, width, height);
  pixelBoard(165, 157, 534, 258);
  fill(65, 40, 28);
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(23);
  text('INSPECTOR VISIT', 432, 212);
  textStyle(NORMAL);
  textSize(16);
  text('The inspector has arrived!', 432, 267);
  text('Memory game coming soon.', 432, 299);
  drawButton('CONTINUE', 317, 346, 230, true, color(70, 115, 65));
  pop();
}

function dismissInspectorNotice() {
  inspectorNotice = false;
  if (inspectorNoticePausedGame && gamePaused) togglePause();
  inspectorNoticePausedGame = false;
}

// Day banner countdown only appears after the Day 7 surprise.

// Hide upgrades until Day 3, without changing the REPUTATION button.


function buySupplierItems(quantity, confirmed = false) {
  let productIndex = 12 + selectedSupplier;
  let unitPrices = [20, 35, 30];
  let unitPrice = unitPrices[selectedSupplier];

  let discount = 0;

  if (quantity === 3) discount = 0.15;
  if (quantity === 6) discount = 0.25;

  let total = round(quantity * unitPrice * (1 - discount));

  // Count storage space reserved for deliveries
  let reservedSpace = reservedStorage();

  if (money < total) {
    supplierMessage = "NOT ENOUGH MONEY";
    return;
  }

  let futureStorage = inventory.length + reservedSpace + quantity;

  if (futureStorage > shopCapacity()) {
    // TODO: Integrate Abdullah's Tetris storage mini-game for overflow later.
    supplierMessage = "NOT ENOUGH SPACE";
    return;
  }

  if (futureStorage === shopCapacity() && !confirmed) {
    pendingQuantity = quantity;
    phoneCall = "storageWarning";
    return;
  }

  // Pay now
  money -= total;

  // Deliver tomorrow
  pendingDeliveries.push({
    product: productIndex,
    quantity: quantity,
    boughtFor: total / quantity,
    deliveryDay: dayNumber + 1
  });

  // Record the payment in today's receipt
  for (let i = 0; i < quantity; i++) {
    dailyLog.push({
      type: "BUY",
      name: products[productIndex].name,
      amount: total / quantity
    });
  }

  let productName = products[productIndex].name.toLowerCase();

  if (selectedSupplier === 0) {
    productName = quantity === 1 ? "bottle of wine" : "bottles of wine";
  } else if (quantity > 1) {
    productName += "s";
  }

  orderConfirmation = quantity + " " + productName;
  orderConfirmationUntil = millis() + 3000;
  pendingQuantity = 0;
  supplierMessage = "";
  phoneCall = "orderConfirmed";
}

function deliverOrders() {
  let deliveredCount = 0;
  for (let i = pendingDeliveries.length - 1; i >= 0; i--) {
    let order = pendingDeliveries[i];

    if (order.deliveryDay <= dayNumber) {
      for (let j = 0; j < order.quantity; j++) {
        inventory.push({
          product: order.product,
          boughtFor: order.boughtFor
        });
      }

      // Remove the completed delivery
      deliveredCount += order.quantity;
      pendingDeliveries.splice(i, 1);
    }
  }
  if (deliveredCount > 0) {
    deliveryNoticeUntil = millis() + 3000;
  }
}

function drawSupplierPhone() {
  let x = 420;
  let y = 240;

  pixelBoard(x, y, 245, 270);

  fill(65, 40, 28);
  textAlign(CENTER);
  textStyle(NORMAL);

  // SCREEN 1: Choose a supplier
  if (phoneCall === "suppliers") {
    textSize(17);
    text("Who do you want to call?", x + 122, y + 35);

    let row = 0;

    for (let i = 0; i < supplierOwned.length; i++) {
      if (supplierOwned[i]) {
        drawButton(
          supplierNames[i],
          x + 9,
          y + 55 + row * 40,
          227,
          true,
          color(73, 120, 72)
        );

        row++;
      }
    }

    drawButton(
      "CANCEL",
      x + 9, y + 225, 227,
      true, color(155, 83, 66)
    );
  }

  // SCREEN 2: Choose how many items to buy
  else if (phoneCall === "supplierOrder") {
    let product = supplierProducts[selectedSupplier];
    let price = [20, 35, 30][selectedSupplier];

    textSize(17);
    text(supplierNames[selectedSupplier], x + 122, y + 29);

    textSize(14);
    text("How many would you like?", x + 122, y + 56);

    let quantities = [1, 3, 6];
    let discounts = [0, 0.15, 0.25];

    for (let i = 0; i < 3; i++) {
      let quantity = quantities[i];
      let total = round(quantity * price * (1 - discounts[i]));

      let label;

      if (selectedSupplier === 0) {
        label = quantity + (quantity === 1
          ? " bottle of wine"
          : " bottles of wine");
      } else {
        label = quantity + " " + product.toLowerCase();

        if (quantity > 1) {
          label += "s";
        }
      }

      if (i === 1) label += " -15%";
      if (i === 2) label += " -25%";

      label += " ($" + total + ")";

      drawButton(
        label,
        x + 9,
        y + 75 + i * 40,
        227,
        true,
        color(73, 120, 72)
      );
    }

    drawButton(
      "DON'T PURCHASE",
      x + 9, y + 195, 227,
      true, color(155, 83, 66)
    );

    fill(140, 55, 45);
    textAlign(CENTER);
    textSize(12);
    text(supplierMessage, x + 122, y + 255);
  }

  // SCREEN 3: Warn before filling all storage slots
  else if (phoneCall === "storageWarning") {
    fill(65, 40, 28);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(19);
    text("STORAGE WARNING", x + 122, y + 48);
    textStyle(NORMAL);
    textSize(14);
    text("This order will fill", x + 122, y + 91);
    text("your storage completely.", x + 122, y + 115);
    text("Still want to purchase?", x + 122, y + 139);

    drawButton("CONFIRM", x + 9, y + 160, 227,
               true, color(73, 120, 72));
    drawButton("CANCEL", x + 9, y + 205, 227,
               true, color(155, 83, 66));
  }

  // SCREEN 4: Order confirmation
  else if (phoneCall === "orderConfirmed") {
    fill(65, 40, 28);
    textAlign(CENTER);

    textStyle(BOLD);
    textSize(19);
    text("PAYMENT RECEIVED", x + 122, y + 55);

    textStyle(NORMAL);
    textSize(15);

    text(orderConfirmation, x + 122, y + 110);
    text("will be delivered", x + 122, y + 140);
    text("tomorrow!", x + 122, y + 165);

  }
}

function phoneBox() {
  noStroke(); fill(0, 0, 0, 185); rect(0, 0, width, height);
  pixelBoard(105, 65, 654, 455);
  textAlign(CENTER); textStyle(BOLD); fill(97, 58, 36);
  textSize(24); text('PIXEL PAT', 432, 112);
  textStyle(NORMAL);
}
function phoneDrawCall() {
  if (phoneCall === "suppliers" || phoneCall === "supplierOrder" || phoneCall === "storageWarning" || phoneCall === "orderConfirmed") {
    drawSupplierPhone();
    return;
  } 
  phoneBox();
  if (phoneCall === 'hello') {
    fill(66, 43, 29);
    textAlign(LEFT);
    textStyle(NORMAL);
    textSize(19);
    if (helloPage === 0) {
      text('Ah, you must be the new shopkeeper!', 190, 170);
      text("Name's Pat. I own this place,", 190, 205);
      text("so I thought I'd give you a little welcome call.", 190, 240);
    } else {
      text('Take good care of the shop, will you?', 190, 170);
      text(`It's been my pride and joy for 70 years.`, 190, 205);
      text(`Boy oh boy, if I could withstand those long hours, ${"\n"}you bet I would.`, 190, 240);
      text(`But that's a job for a spry young whippersnapper ${"\n"}like yourself.`, 190, 295);
      text(`I'll be checking in from time to time!`, 190, 375);
    }
    drawButton('CONTINUE', 330, 443, 204, true, color(70, 115, 65));

  } else if (phoneCall === 'upgrades') {
    fill(66, 43, 29);
    textAlign(LEFT);
    textStyle(NORMAL);
    textSize(19);
    text("How's business treating you?", 190, 170);
    textSize(18);
    text("I've got some improvements available for the shop.", 190, 214);
    text("Take a look when you've got some spare cash!", 190, 254);

    fill(65, 40, 28);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(24);
    text('NEW FEATURE UNLOCKED!', width / 2, 335);
    textSize(21);
    text('SHOP UPGRADES', width / 2, 374);
    textStyle(NORMAL);
    drawButton('CONTINUE', 330, 443, 204, true, color(70, 115, 65));

  
  } else if (phoneCall === 'rentReveal') {
    fill(66, 43, 29);
    textAlign(LEFT);
    textStyle(NORMAL);
    textSize(18);

    text(`Well, well! You've made it through your first week!`, 170, 157);
    text(`I wanted to give you some time to get settled in.`, 170, 193);
    text(`So the first week was on the house!`, 170, 229);
    text(`From now on, rent is due every seven days.`, 170, 265);
    text(`$10 to start, with a 20% increase each week.`, 170, 301);
    text(`Business is business!`, 170, 337);

    fill(65, 40, 28);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(23);

    text("NEW CHALLENGE UNLOCKED!", width / 2, 380);

    textSize(20);
    text("WEEKLY RENT", width / 2, 410);

    textStyle(NORMAL);

    drawButton("CONTINUE", 330, 443, 204,
              true, color(70, 115, 65));
  } else if (phoneCall === 'rent') {
    let rent = phoneRentAmount(dayNumber);
    fill(66, 43, 29); textAlign(LEFT); textStyle(NORMAL); textSize(19); text('Rent day! You owe me $' + rent + '.', 180, 145);
    { fill(66, 43, 29); textAlign(LEFT); textStyle(NORMAL); textSize(16); text("I'll buy anything you choose at 80% of its usual value.", 135, 173, 590, 28); };
    { fill(66, 43, 29); textAlign(LEFT); textStyle(NORMAL); textSize(16); text('Select items below, or sell nothing. Your call!', 135, 197, 590, 28); };
    for (let i = 0; i < inventory.length && i < 8; i++) {
      let x = 135 + (i % 2) * 297;
      let y = 220 + floor(i / 2) * 44;
      let entry = inventory[i];
      let name = products[entry.product].name;
      let price = products[entry.product].value * 0.8;
      let chosen = phoneSelected.includes(i);
      fill(chosen ? color(91, 137, 85) : color(180, 146, 104));
      noStroke(); rect(x, y, 278, 36);
      fill(chosen ? 255 : color(60, 38, 25));
      textAlign(LEFT); textStyle(NORMAL); textSize(15);
      text((chosen ? '[X] ' : '[ ] ') + name + '  $' + price.toFixed(2), x + 9, y + 23);
    }
    let total = phoneSaleTotal();
    { fill(66, 43, 29); textAlign(LEFT); textStyle(NORMAL); textSize(17); text('Selected sale: $' + total.toFixed(2), 135, 420, 340, 28); };
    drawButton('SELL SELECTED', 135, 460, 235, true, color(70, 115, 65));
    drawButton('SELL NOTHING', 495, 460, 235, true, color(155, 83, 66));

  }
}
function phoneSaleTotal() {
  let total = 0;
  for (let i of phoneSelected) total += products[inventory[i].product].value * 0.8;
  return total;
}
function phonePayRent() {
  let amount = phoneRentAmount(dayNumber);
  money -= amount;
  dailyLog.push({type:'RENT', amount:amount});
  phonePaidToday = true;
  if (money < 0) {
    showReceipt = false;
    gameOver = true;
  }
}
function phoneSellSelection() {
  let total = phoneSaleTotal();
  phoneSelected.sort((a,b)=>b-a);
  for (let i of phoneSelected) {
    let product = products[inventory[i].product];
    dailyLog.push({type:'SELL', name:product.name, amount:product.value * 0.8});
    inventory.splice(i,1);
  }
  money += total;
  phonePayRent();
  phoneEndCall();
}

// Receipts no longer treat rent as a daily $10 charge.


function mousePressed() {
  if (inspectorNotice) {
    if (pawnHit(317, 346, 230, 32)) dismissInspectorNotice();
    return;
  }

  if (showBag) {
    let totalPages = max(1, ceil(inventory.length / 6));

    if (bagPage > 0 && pawnHit(285, 411, 58, 32)) {
      bagPage--;
      return;
    }
    if (bagPage < totalPages - 1 && pawnHit(521, 411, 58, 32)) {
      bagPage++;
      return;
    }

    showBag = false;
    return;
  }

  if (phonePending && !phoneCall) {
    if (pawnHit(phoneX,phoneY,phoneW,phoneH)) {
      phoneCall = phonePending;
      phonePending = '';
    }
    return;
  }
  if (phoneCall) {
    if (phoneCall === "rent") {
      for (let i = 0; i < inventory.length && i < 8; i++) {
        let x = 135 + (i % 2) * 297;
        let y = 220 + floor(i / 2) * 44;
        if (pawnHit(x, y, 278, 36)) {
          let pos = phoneSelected.indexOf(i);
          if (pos === -1) phoneSelected.push(i);
          else phoneSelected.splice(pos, 1);
          return;
        }
      }
      if (pawnHit(135, 460, 235, 32)) { phoneSellSelection(); return; }
      if (pawnHit(495, 460, 235, 32)) {
        phoneSelected = [];
        phonePayRent();
        phoneEndCall();
        return;
      }
    } else if (phoneCall === "suppliers") {
      let row = 0;
      for (let i = 0; i < supplierOwned.length; i++) {
        if (supplierOwned[i]) {
          if (pawnHit(429, 295 + row * 40, 227, 32)) {
            selectedSupplier = i;
            supplierMessage = "";
            phoneCall = "supplierOrder";
            return;
          }
          row++;
        }
      }
      if (pawnHit(429, 465, 227, 32)) { phoneEndCall(); return; }
    } else if (phoneCall === "supplierOrder") {
      for (let i = 0; i < 3; i++) {
        if (pawnHit(429, 315 + i * 40, 227, 32)) {
          buySupplierItems([1, 3, 6][i]);
          return;
        }
      }
      if (pawnHit(429, 435, 227, 32)) {
        supplierMessage = "";
        phoneCall = "suppliers";
        return;
      }
    } else if (phoneCall === "storageWarning") {
      if (pawnHit(429, 400, 227, 32)) {
        buySupplierItems(pendingQuantity, true);
        return;
      }
      if (pawnHit(429, 445, 227, 32)) {
        pendingQuantity = 0;
        phoneCall = "supplierOrder";
        return;
      }
    } else if (pawnHit(330, 443, 204, 32) && phoneCall === "hello" && helloPage === 0) {
      helloPage = 1;
      return;
    } else if (pawnHit(330, 443, 204, 32) && phoneCall !== "orderConfirmed") {
      phoneEndCall();
      return;
    }
    return;
  }
  if (showIntro || showReceipt || gameOver || closing || pawnIntroType) {
    handleTradeClick(); return;
  }
  // The bag can also be opened while a customer is trading.
  if (pawnTradeActive() && !gamePaused && !shopMenu &&
      pawnHit(230, 10, 88, 76)) {
    showBag = true;
    bagPage = 0;
    return;
  }
  // Block the hidden upgrade tab until the Day 3 call has finished.
  if (dayNumber < 3 && pawnHit(462,12,140,32)) return;
  if (pawnHit(phoneX, phoneY, phoneW, phoneH) && !pawnTradeActive() && !shopMenu) {
    if (supplierOwned.includes(true)) {
      phoneSavedPause = !gamePaused;
      if (phoneSavedPause) togglePause();
      phoneCall = "suppliers";
      supplierMessage = "";
    } else {
      phoneHint = "NO SUPPLIER CONTACTS";
      phoneHintUntil = millis() + 2200;
    }
    return;
  }
  handleTradeClick();
};


// Ensure each rent day is handled only once even if the receipt stays open.

// ------------------------------------------------------------
// DEVELOPMENT TEST MODE (turn OFF before submitting the game)
// Set to false when you no longer need the shortcuts.
// ------------------------------------------------------------
let DEV_TEST_MODE = true;
let testPanelVisible = false;

// Enter a chosen day with a clean shop. Current money and inventory stay intact.
function testJumpToDay(day) {
  if (phonePending || phoneCall) return; // Finish incoming calls first.
  if (pawnIntroType) pawnCloseIntro();
  if (shopMenu) shopCloseMenu();
  // Clear a pause from a previous screen without changing the clock math.
  gamePaused = false;
  showIntro = false;
  showReceipt = false;
  showBag = false;
  showBudgetWarning = false;
  gameOver = false;
  closing = false;
  currentCustomer.state = 'gone';
  currentTrade = undefined;
  selectedItems = [];
  pawnVisitor = null;
  dayNumber = day;
  nextInspectionDay = day >= 3 ? day : 3;
  inspectorNotice = false;
  inspectorNoticePausedGame = false;
  dayStarted = true;
  startTime = millis();
  dailyCustomerLimit = getDailyCustomers();
  customersLeft = dailyCustomerLimit;
  nextArrival = millis() + 6000;
  nextMorning = 0;
  shopkeeperActor.state = 'working';
  shopkeeperActor.x = 710;
  shopkeeperActor.y = 260;
  phonePaidToday = false;
  dailyLog = [];
  // Prior announcements are logically unlocked when jumping beyond them.
  if (day > 1) phoneSeen.hello = true;
  if (day > 3) phoneSeen.upgrades = true;
  if (day > 7) phoneSeen.rentReveal = true;
  if (day === 3) phoneSeen.upgrades = false; // Test the unlock call.
  if (day === 7) phoneSeen.rentReveal = false; // Test the reveal at closing.
}

// Spawn a Collector immediately so the posh patron offer can be tested.
function testEnterPoshPatron() {
  if (phonePending || phoneCall || showIntro || showReceipt || gameOver ||
      closing || currentCustomer.state === 'waiting') return;
  if (pawnIntroType) pawnCloseIntro();
  if (shopMenu) shopCloseMenu();
  gamePaused = false;
  showBag = false;
  showBudgetWarning = false;
  dayStarted = true;
  closing = false;
  if (customersLeft <= 0) customersLeft = 1;
  currentCustomer.state = 'gone';
  currentTrade = undefined;
  selectedItems = [];
  nextArrival = 0;
  generateCustomer('Collector');
}

// Spawn a Wholesaler for quick testing without changing the normal introduction day.
function testEnterWholesaler() {
  if (phonePending || phoneCall || showIntro || showReceipt || gameOver ||
      closing || currentCustomer.state === 'waiting') return;
  if (pawnIntroType) pawnCloseIntro();
  if (shopMenu) shopCloseMenu();
  gamePaused = false;
  showBag = false;
  showBudgetWarning = false;
  dayStarted = true;
  if (customersLeft <= 0) customersLeft = 1;
  currentCustomer.state = 'gone';
  currentTrade = undefined;
  selectedItems = [];
  nextArrival = 0;
  generateCustomer('Wholesaler');
}

// Close the day immediately and open its receipt. Phone events work normally.
function testEndDay() {
  customersLeft = 0;
  if (showIntro || phonePending || phoneCall || pawnIntroType || gameOver) return;
  if (shopMenu) shopCloseMenu();
  gamePaused = false;
  showBag = false;
  showBudgetWarning = false;
  currentCustomer.state = 'gone';
  currentTrade = undefined;
  selectedItems = [];
  closing = true;
  dayStarted = false;
  shopkeeperActor.state = 'gone';
  showReceipt = true;
}

// Small on-screen keyboard reference; no mouse controls to clash with trading.
function drawTestPanel() {
  if (!DEV_TEST_MODE || !testPanelVisible) return;
  push();
  noStroke(); fill(40, 29, 25, 235); rect(216, 100, 433, 225);
  fill(255); textFont('Pixelify Sans'); textAlign(LEFT); textStyle(NORMAL);
  textSize(20); text('DEV TEST MODE', 234, 130);
  textSize(16);
  text('N = next day     E = end today', 234, 160);
  text('3 = Day 3       7 = Day 7', 234, 187);
  text('8 = Day 8       0 = Day 14', 234, 214);
  text('M = +$100   P = posh   W = wholesaler', 234, 244);
  text('A/B/C = test inspection grade', 234, 272);
  text('T = hide/show', 234, 295);
  pop();
}


function keyPressed() {
  if (DEV_TEST_MODE) {
    let k = String(key).toLowerCase();
    if (k === 't') { testPanelVisible = !testPanelVisible; return false; }
    if (testPanelVisible) {
      if (k === 'n') testJumpToDay(dayNumber + 1);
      else if (k === 'e') testEndDay();
      else if (k === 'm') money += 100;
      else if (k === '3') testJumpToDay(3);
      else if (k === '7') testJumpToDay(7);
      else if (k === '8') testJumpToDay(8);
      else if (k === '0') testJumpToDay(14);
      else if (k === 'p') testEnterPoshPatron();
      else if (k === 'w') testEnterWholesaler();
      else if (k === 'a') recordInspectionResult(5);
      else if (k === 'b') recordInspectionResult(4);
      else if (k === 'c') recordInspectionResult(2);
      
      return false;
    }
  }
};




































function draw() {
    // Supplier order confirmations close automatically after three seconds.
    if (phoneCall === "orderConfirmed" && millis() >= orderConfirmationUntil) {
      phoneEndCall();
    }

    phoneCheckEvents();
    background(0);

    if (!shopBg || !shopkeeper || !pawnReady || !phoneSheet) {
        return;
    }

    image(shopBg, 0, 0, width, height);
    drawCompletedVase();

    if (!showIntro && !gamePaused && !showReceipt && !gameOver) {
      updateDay();
      moveShopkeeper();
      checkInspectorVisit();
      if (!gamePaused) moveCustomer();
    }
    
    drawCharacters();
    
    drawInfo();
    drawClock();
    drawBagIcon();

    if (closing) {
        fill(255);
        textAlign(CENTER);
        textSize(24);
        text("SHOP CLOSED", width / 2, 200);
    }

    if (showBudgetWarning) {
        drawBudgetWarning();
    }

    if (showReceipt) {
        drawReceipt();
    }

    if (showIntro) {
        drawIntro();
    }

    if (gameOver) {
        drawGameOver();
    }
  if(pawnTradeActive()) pawnTradeBoard();
  // Keep the bag icon visible above the customer trading panel.
  if (pawnTradeActive() && !showBag && !shopMenu) drawBagIcon();
    pawnStartIntroIfNeeded();
  if (poshGamePending && pawnTradeActive() && !pawnIntroType) {
    showPoshOffer();
  }
  if (poshOfferActive) {
    pawnDrawPoshOffer();
  }
  if (pawnIntroType) pawnDrawIntro();

  if (!showIntro && !showReceipt && !gameOver && !pawnIntroType) {
    shopDrawTabs();
      if (shopMenu === "people") shopDrawPeople();
      if (shopMenu === "upgrades") shopDrawUpgrades();
  }

  if (customerReaction && millis() < customerReactionUntil &&
        !showIntro && !showReceipt && !gameOver && !pawnTradeActive() && !pawnIntroType) {
      // Compact text only; does not replace or restyle any original game screen.
      push();
      textAlign(CENTER);
      textSize(12);
      stroke(30, 20, 15);
      strokeWeight(3);
      fill(255);
      text(customerReaction, width / 2, height - 75);
      pop();
    }

  if (!showIntro && !gameOver) {
    // An easy-to-see 180px red telephone at the lower-right of the shop.
      if (phoneSheet && ((!pawnTradeActive() && !shopMenu && !showReceipt && !pawnIntroType) || phonePending)) {
        let frame = phonePending ? 1 + floor(frameCount / 9) % 3 : 0;
        image(phoneSheet, phoneX, phoneY, phoneW, phoneH,
              frame * 160, 0, 160, 160);
      }
      if (phonePending && !phoneCall) {
        noStroke(); fill(0,0,0,130); rect(0,0,width,height);
        if (phoneSheet) {
          let frame = 1 + floor(frameCount / 9) % 3;
          image(phoneSheet, phoneX,phoneY,phoneW,phoneH,frame*160,0,160,160);
        }
        pixelBoard(169,180,525,138);
        fill(65,40,28); textAlign(CENTER); textStyle(BOLD); textSize(25);
        text('RING! RING!',432,232);
        textStyle(NORMAL); textSize(18);
        text('Pick up the phone!',432,277);
      }
      if (phoneCall) phoneDrawCall();
      if (phoneHint && millis() < phoneHintUntil && !phoneCall && !phonePending) {
        fill(65,40,28); rect(540,351,310,34);
        fill(255); textAlign(CENTER); textSize(14); text(phoneHint,695,373);
      }
  }

  if (deliveryNoticeUntil > millis() && !showIntro &&
      !showReceipt && !gameOver && !phoneCall && !phonePending && !pawnIntroType) {
    pixelBoard(297, 86, 270, 56);
    fill(65, 40, 28);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(19);
    text("DELIVERY ARRIVED!", 432, 121);
    textStyle(NORMAL);
  }

  // The bag must be drawn after the trading screen.
  if (showBag) drawBag();
  drawReputationNotice();
  if (latestInspectionGrade) {
    push();
    fill(65, 40, 28); textSize(12); textAlign(CENTER);
    text('INSPECTION: ' + latestInspectionGrade, 763, 83);
    pop();
  }
  drawTestPanel();
  drawInspectorNotice();
}


function restartGame() {


  // Reset money and inventory
  money = 150;
  inventory = [];
  dailyLog = [];

  // Reset day and time
  dayNumber = 1;
  dayStarted = false;
  closing = false;
  startTime = 0;
  nextArrival = 0;
  nextMorning = 0;
  nextInspectionDay = 3;
  latestInspectionGrade = '';
  inspectorNotice = false;
  inspectorNoticePausedGame = false;

  // Reset shopkeeper
  shopkeeperActor.reset();

  // Reset customer
  currentCustomer = new Customer("", "", null, null);
  currentCustomer.state = "gone";
  customerNumber = 0;

  // Reset trading
  currentTrade = undefined;
  selectedItems = [];
  message = "";

  // Reset screens
  showBag = false;
  bagPage = 0;
  showReceipt = false;
  showBudgetWarning = false;
  gamePaused = false;
  pauseStart = 0;
  gameOver = false;

  // Return to introduction screen
  showIntro = true;

  
  pawnRelationship = {Regular:50,Bargain:50,Collector:50,Suspicious:50};
  pawnVisitor=null;pawnMessage='';pawnRows=[];
  pawnIntroSeen={Regular:false,Bargain:false,Collector:false,Suspicious:false,Wholesaler:false};
  pawnIntroType='';pawnIntroPausedGame=false;pawnConversation='';
  pawnUnlockedTypes={Regular:true,Bargain:false,Collector:false,Suspicious:false,Wholesaler:false};
  pawnNewTypeDay=-1;

  
  shopMenu = "";
  shopMenuPaused = false;
  storageLevel = 0;
  shelvesLevel = 0;
  advertisingLevel = 0;
  priceCatalogOwned = false;
  supplierOwned = [false, false, false];
  upgradePage = 0;
  selectedSupplier = -1;
  supplierMessage = "";
  dailyCustomerLimit = 5;
  customersLeft = 5;
  shopMessage = "";
  shopBargained = false;
  shopTradeMultiplier = 1;
  selectedWholesaleItems = [];
  reputationNotice = '';
  reputationNoticeUntil = 0;
  pendingDeliveries = [];
  deliveryNoticeUntil = 0;
  orderConfirmation = "";
  orderConfirmationUntil = 0;
  pendingQuantity = 0;

  
  lastCustomerDialogue = '';
  customerReaction = '';
  customerReactionUntil = 0;
  customerDialogueOutcome = 'rejected';

  
  phonePending='';phoneCall='';phoneSelected=[];
  phoneSeen={hello:false, upgrades:false, rentReveal:false};
  phoneSavedPause=false;phonePaidToday=false;
}


function generateCustomer(forcedVisitorType) {



  let itemIndex = floor(random(12));
  let type = random(["sell", "category"]);

  // Regular buyers may offer below or above the item's original value.
  let markup = random(0.95, 1.15);

  currentTrade = {
      type: type,
      product: itemIndex,
      category: products[itemIndex].category,
      markup: markup,
      budget: floor(random(25, 101)),
      items: []
  };

  if (type === "sell") {

      // Seller brings 1 to 3 items
      let quantity = floor(random(1, 4));

      for (let i = 0; i < quantity; i++) {
          let productIndex = floor(random(12));
          currentTrade.items.push(productIndex);
      }
  }

  selectedItems = [];

  customerNumber++;


  message = "";


  if (!pawnReady) return;
  pawnVisitor = pawnPickVisitor(forcedVisitorType);
  currentCustomer = new Customer(
    pawnVisitor.name, pawnVisitor.type,
    pawnSprites[pawnVisitor.name], pawnPortraits[pawnVisitor.name]
  );
  // Posh patrons occasionally invite the shopkeeper to play their vase puzzle.
  poshGamePending = completedVaseIndexes.length < maxCompletedVases &&
    pawnVisitor.type === "Collector" && (forcedVisitorType === "Collector" || random() < 0.3);
  poshOfferActive = false;
  pawnMessage = '';
  pawnConversation = pawnNewConversation();
  // Collector has more to spend; bargain hunters have less.
  if (pawnVisitor.type === 'Collector') {
    if (type === 'sell') {
      // Posh Patrons bring one or two exclusive, expensive items.
      currentTrade.items = [];
      let quantity = floor(random(1, 3));
      for (let i = 0; i < quantity; i++) {
        currentTrade.items.push(floor(random(poshProductStart, products.length)));
      }
    } else {
      // Their requests can include merchandise from any previous seller or supplier.
      // Prefer categories containing valuable inventory, if any is available.
      if (inventory.length > 0 && random() < 0.75) {
        let stock = random(inventory);
        for (let entry of inventory) {
          if (products[entry.product].value > products[stock.product].value && random() < 0.7) {
            stock = entry;
          }
        }
        currentTrade.category = products[stock.product].category;
      }
      currentTrade.budget = max(250, floor(random(300, 651)));
    }
  }
  if (pawnVisitor.type === 'Bargain') {
    currentTrade.budget = floor(currentTrade.budget * 0.85);
    currentTrade.markup *= 0.93;
  }
  if (pawnVisitor.type === 'Suspicious') {
    currentTrade.markup = random(1.10, 1.20);
  }
  if (pawnVisitor.type === 'Wholesaler') {
    currentTrade.markup = 0.90;
    currentTrade.budget = max(250, floor(random(300, 651)));
    if (type === 'sell') {
      currentTrade.items = [];
      for (let i = 0; i < 5; i++) currentTrade.items.push(floor(random(12)));
    }
  }
  selectedItems = [];
  selectedWholesaleItems = [];

  shopBargained = false;
  shopTradeMultiplier = pawnVisitor.type === 'Suspicious' ? random(0.80, 0.90) :
                        pawnVisitor.type === 'Wholesaler' ? 0.90 : 1;
  if (pawnVisitor && pawnVisitor.type !== "Inspector" && pawnVisitor.type !== 'Wholesaler') {
    let score = pawnRelationship[pawnVisitor.type];
    // Small, predictable relationship discount/bonus for sales.
    currentTrade.markup *= 1 + (score - 50) * 0.002;
  }
}


function completeBuyerSale() {
  customerDialogueOutcome = 'accepted';


  let expected = selectedTotal();
  let actual = min(expected, currentTrade.budget);

  // Record each sold item
  for (let index of selectedItems) {

      let productIndex = inventory[index].product;

      dailyLog.push({
          type: "SELL",
          name: products[productIndex].name,
          amount: buyerPrice(productIndex)
      });
  }

  // Record any discount caused by buyer's budget
  if (actual < expected) {
      dailyLog.push({
          type: "DISCOUNT",
          amount: Number((actual - expected).toFixed(2))
      });
  }

  // Receive money
  money += actual;

  // Remove sold items from inventory
  selectedItems.sort((a, b) => b - a);

  for (let index of selectedItems) {
      inventory.splice(index, 1);
  }

  showBudgetWarning = false;
  finishTrade();
  pawnChangeScore(2);
  suspiciousTradeConsequence();
}



function drawBag() {
  pixelBoard(125, 100, 610, 370);
  fill(65, 40, 28);
  textAlign(LEFT);
  textSize(18);
  text("YOUR BAG (" + inventory.length + "/" + shopCapacity() + ")", 151, 139);
  if (reservedStorage() > 0) {
    textSize(12);
    text("PENDING DELIVERY: " + reservedStorage() + " SLOTS", 151, 157);
  }

  // Column headers
  textSize(14);
  textStyle(BOLD);
  text("ITEM", 155, 178);
  text("CATEGORY", 305, 178);
  if (priceCatalogOwned) text("ORIGINAL", 465, 178);
  text("BOUGHT FOR", 590, 178);
  textStyle(NORMAL);

  stroke(165, 130, 95);
  line(150, 190, 710, 190);

  // Show up to six items on each page.
  let itemsPerPage = 6;
  let totalPages = max(1, ceil(inventory.length / itemsPerPage));
  bagPage = constrain(bagPage, 0, totalPages - 1);

  if (inventory.length === 0) {
    noStroke();
    text("Your bag is empty.", 155, 225);
  }

  let start = bagPage * itemsPerPage;

  for (let row = 0; row < itemsPerPage; row++) {
    let i = start + row;
    if (i >= inventory.length) break;

    let entry = inventory[i];
    let item = products[entry.product];
    let y = 220 + row * 34;

    noStroke();
    fill(65, 40, 28);
    textSize(14);
    textAlign(LEFT);
    text(item.name, 155, y);
    text(item.category, 305, y);

    if (priceCatalogOwned) {
      textAlign(RIGHT);
      text("$" + item.value.toFixed(2), 545, y);
    }

    textAlign(RIGHT);
    text("$" + entry.boughtFor.toFixed(2), 690, y);

    stroke(190, 160, 120);
    line(150, y + 10, 710, y + 10);
  }

  if (bagPage > 0) {
    drawButton("<", 285, 411, 58, true, color(98, 67, 46));
  }
  if (bagPage < totalPages - 1) {
    drawButton(">", 521, 411, 58, true, color(98, 67, 46));
  }

  noStroke();
  fill(65, 40, 28);
  textAlign(CENTER);
  textSize(13);
  text("PAGE " + (bagPage + 1) + " / " + totalPages, 432, 433);
  text("CLICK ANYWHERE ELSE TO CLOSE", 430, 457);
}



function drawInfo() {

    pixelBoard(10, 10, 208, 76);

    fill(65, 40, 28);
    textAlign(LEFT);
    textSize(15);

    text("DAY " + dayNumber, 24, 40);
    text("MONEY $" + money.toFixed(2), 24, 63);
  if (dayNumber > 7) {
    let remaining = 7 - (dayNumber % 7);
    if (remaining === 7) remaining = 0;
    fill(74, 47, 30); textAlign(LEFT); textStyle(NORMAL); textSize(12);
    let label = remaining === 0 ? '(rent due today)' : '(' + remaining + ' days till rent)';
    text(label, 88, 39);
  }
}


function drawReceipt() {
  if (phonePending || phoneCall) return;


  // Darken background
  noStroke();
  fill(0, 0, 0, 170);
  rect(0, 0, width, height);

  pixelBoard(125, 35, 614, 495);

  fill(65, 40, 28);
  textAlign(CENTER);
  textSize(18);
  text("DAY " + dayNumber + " RECEIPT", 432, 72);

  let boughtItems = {};
  let soldItems = {};

  let totalBought = 0;
  let totalSold = 0;
  let budgetAdjustment = 0;

  // Group records by product
  for (let entry of dailyLog) {

      if (entry.type === "BUY") {

          let name = entry.name;

          if (!boughtItems[name]) {
              boughtItems[name] = { count: 0, total: 0 };
          }

          boughtItems[name].count++;
          boughtItems[name].total += entry.amount;
          totalBought += entry.amount;
      }

      else if (entry.type === "SELL") {

          let name = entry.name;

          if (!soldItems[name]) {
              soldItems[name] = { count: 0, total: 0 };
          }

          soldItems[name].count++;
          soldItems[name].total += entry.amount;
          totalSold += entry.amount;
      }

      else if (entry.type === "DISCOUNT") {
          budgetAdjustment += entry.amount;
          totalSold += entry.amount;
      }
  }

  textAlign(LEFT);
  textSize(14);

  // BOUGHT
  text("BOUGHT", 155, 112);

  textAlign(RIGHT);
  text("-$" + totalBought.toFixed(2), 705, 112);

  let y = 137;
  textSize(12);

  for (let name in boughtItems) {

      let item = boughtItems[name];

      textAlign(LEFT);
      text(name + " x" + item.count, 165, y);

      textAlign(RIGHT);
      text("-$" + abs(item.total).toFixed(2), 705, y);

      y += 19;
  }

  if (Object.keys(boughtItems).length === 0) {
      textAlign(LEFT);
      text("None", 165, y);
  }

  // SOLD
  y = 265;

  fill(65, 40, 28);
  textAlign(LEFT);
  textSize(14);
  text("SOLD", 155, y);

  textAlign(RIGHT);
  text("+$" + totalSold.toFixed(2), 705, y);

  y += 25;
  textSize(12);

  for (let name in soldItems) {

      let item = soldItems[name];

      textAlign(LEFT);
      text(name + " x" + item.count, 165, y);

      textAlign(RIGHT);
      text("+$" + item.total.toFixed(2), 705, y);

      y += 19;
  }

  if (Object.keys(soldItems).length === 0) {
      textAlign(LEFT);
      text("None", 165, y);
  }

  // Budget adjustments for discounted sales
  if (budgetAdjustment < 0) {
      textAlign(LEFT);
      text("Budget adjustment", 165, y);

      textAlign(RIGHT);
      text("-$" + abs(budgetAdjustment).toFixed(2), 705, y);
  }

  // Rent appears only after Pat's weekly call.
  let rent = 0;
  for (let entry of dailyLog) {
    if (entry.type === "RENT") rent += entry.amount;
  }
  fill(65, 40, 28);
  textAlign(LEFT); textSize(14);
  text("RENT", 155, 433);
  textAlign(RIGHT);
  text(rent ? "-$" + rent.toFixed(2) : "$0", 705, 433);

  let profit = totalSold + budgetAdjustment - totalBought - rent;
  textSize(15); textAlign(LEFT);
  text("NET PROFIT", 155, 466);
  textAlign(RIGHT);
  text((profit >= 0 ? "+" : "-") + "$" + abs(profit).toFixed(2), 705, 466);

  drawButton("CLOSE", 340, 483, 184, true,
             color(70, 115, 65));
}


function moveShopkeeper() {
  let before = dayNumber;

  let previousState = shopkeeperActor.state;
  shopkeeperActor.move();

  if (previousState === "entering" && shopkeeperActor.state === "working") {
    dayStarted = true;
    startTime = millis();
  
    // Receive yesterday's supplier orders
    deliverOrders();
  
    dailyCustomerLimit = getDailyCustomers();
    customersLeft = dailyCustomerLimit;
  
    scheduleCustomer();
  }
  if (previousState === "leaving" && shopkeeperActor.state === "gone") {
    if (money < 0) gameOver = true;
    else showReceipt = true;
  }

  if (shopkeeperActor.state === "gone" &&
    closing &&
    !showReceipt &&
    nextMorning > 0 &&
    millis() >= nextMorning) {
    dayNumber++;
    dayStarted = false;
    closing = false;
    dailyLog = [];
    nextMorning = 0;
    shopkeeperActor.reset();
  }
  if (dayNumber !== before) phonePaidToday = false;
}


function buyerPrice(index) {
  let price = products[index].value * currentTrade.markup;
  // Wealthy collectors pay increasingly generous prices for valuable items.
  if (pawnVisitor && pawnVisitor.type === "Collector" && currentTrade.type === "category") {
    let value = products[index].value;
    let bonus = value >= 150 ? 1.20 : value >= 100 ? 1.15 : value >= 50 ? 1.10 : 1.05;
    price *= bonus;
  }
  // Wholesalers always pay exactly 90%, regardless of reputation or shelves.
  if (pawnVisitor && pawnVisitor.type === 'Wholesaler') return Number((products[index].value * 0.90).toFixed(2));
  price *= 1 + shelvesLevel * 0.05;
  return Number(price.toFixed(2));
}


function bundleTotal() {


  let total = 0;

  for (let index of currentTrade.items) {
      total += products[index].value;
  }

  return Number((total * shopTradeMultiplier).toFixed(2));
}


function scheduleCustomer() {
  nextArrival = millis() + random(1500, 5000);
}


function pawnTradeBoard() {

  pawnRows = [];
  fill(0,0,0,158); noStroke(); rect(0,0,width,height);
  pawnPortrait();
  pawnPanel(280,95,562,458);
  pawnPanel(300,112,520,66);
  let greeting = pawnConversation || 'WELCOME TO THE PAWN SHOP.';
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(20); text(greeting, 319, 135, 477, 28); };
  if (currentTrade.type === 'sell') {
    let wholesale = pawnVisitor.type === 'Wholesaler';
    let items = currentTrade.items;
    const total = wholesale ? sellerSelectedTotal() : bundleTotal();
    fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16);
    text(wholesale ? 'SELECT ITEMS TO BUY' : 'SELLER OFFERS ' + items.length + ' ITEMS', 310, 207);
    text('TOTAL: $' + total.toFixed(2), 310, 229);
    for (let i = 0; i < items.length && i < (wholesale ? 5 : 4); i++) {
      let product = products[items[i]];
      let rowY = wholesale ? 235 + i * 43 : 242 + i * 47;
      let labelY = rowY + 26;
      pawnPanel(306, rowY, 504, wholesale ? 41 : 44);
      fill(63, 40, 30); textStyle(NORMAL);
      textSize(wholesale ? 14 : 15); textAlign(LEFT);
      const checked = selectedWholesaleItems.includes(i);
      text((wholesale ? (checked ? '[X] ' : '[ ] ') : '') +
           product.name.toUpperCase(), 324, labelY);
      if (priceCatalogOwned) {
        textSize(13); textAlign(RIGHT);
        text('ORIGINAL $' + product.value.toFixed(2), 690, labelY);
      }
      textSize(15); textAlign(RIGHT);
      text('$' + (product.value * shopTradeMultiplier).toFixed(2), 790, labelY);
    }
    let selectedCount = wholesale ? selectedWholesaleItems.length : items.length;
    let canBuy = selectedCount > 0 &&
                 inventory.length + reservedStorage() + selectedCount <= shopCapacity() &&
                 money >= total;
    pawnButton(wholesale ? 'BUY SELECTED' : 'BUY ALL',312,489,152,canBuy,color(60,112,67));
  } else {
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16); text('WANTS: ' + currentTrade.category.toUpperCase(), 310, 207); };
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(15); text('BUDGET $'+currentTrade.budget+' | SELECTED $'+selectedTotal().toFixed(2), 310, 220, 480, 28); };
    let entries = availableItems();
    for(let i=0; i<entries.length && i<4; i++) {
      let idx=entries[i];let item=products[inventory[idx].product];
      let y=242+i*47;
      pawnPanel(306,y,504,44);
      let checked=selectedItems.includes(idx);
      fill(63, 40, 30);
      textStyle(NORMAL);

      // Item name and selection checkbox
      textSize(14);
      textAlign(LEFT);
      text((checked ? "[X] " : "[ ] ") + item.name.toUpperCase(),
          324, y + 26);

      // Original value (only after unlocking Price Catalog)
      if (priceCatalogOwned) {
        textSize(13);
        textAlign(RIGHT);
        text("ORIGINAL $" + item.value.toFixed(2), 690, y + 26);
      }

      // Selling price
      textSize(15);
      textAlign(RIGHT);
      text("$" + buyerPrice(inventory[idx].product).toFixed(2), 790, y + 26);
      pawnRows.push({index:idx,x:306,y:y,w:504,h:44});
    }
    if(entries.length===0) { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(14); text('NO MATCHING ITEMS IN BAG', 324, 275); };
    if(entries.length>4) { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(12); text('SHOWING FIRST 4 MATCHING ITEMS', 324, 455); };
    pawnButton('SELL',312,489,152,selectedItems.length>0,color(60,112,67));
  }
  pawnButton('BARGAIN',481,489,152,!shopBargained && pawnVisitor.type !== 'Wholesaler',color(98,67,46));
  pawnButton('REJECT',651,489,152,true,color(156,63,52));
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(pawnVisitor.type === 'Wholesaler' ? 10 : 12); text(pawnMessage, 310, 468); };


  if (!pawnTradeActive()) return;
}


function shopTryBargain() {
  if (shopBargained || !currentTrade || !pawnVisitor || pawnVisitor.type === 'Wholesaler') return;
  shopBargained = true;

  let score = pawnScore();
  let chance = score >= 85 ? 0.85 :
               score >= 65 ? 0.65 :
               score >= 35 ? 0.50 :
               score >= 15 ? 0.35 : 0.15;

  // Different customer personalities affect the chance of a successful bargain.
  const adjustments = {Regular:0, Bargain:-0.10, Collector:-0.05, Suspicious:0.10};
  chance = pawnVisitor.type === 'Bargain' ?
    (score >= 85 ? 0.70 : score >= 65 ? 0.50 : score >= 35 ? 0.35 : score >= 15 ? 0.20 : 0.05) :
    constrain(chance + (adjustments[pawnVisitor.type] || 0), 0, 1);

  let succeeded = random() < chance;
  if (succeeded) {
    const improvement = pawnVisitor.type === 'Bargain' ? 0.20 : 0.10;
    if (currentTrade.type === "sell") shopTradeMultiplier *= 1 - improvement;
    else currentTrade.markup *= 1 + improvement;
  } else {
    pawnChangeScore(-3);
  }
  pawnConversation = chooseCustomerLine(succeeded ? 'bargainYes' : 'bargainNo');
  pawnMessage = succeeded ? 'BARGAIN ACCEPTED' : 'BARGAIN REJECTED';
}

function finishTrade() {

  if (pawnVisitor) {
    customerReaction = chooseCustomerLine(customerDialogueOutcome);
    customerReactionUntil = millis() + 2200;
  }
  customerDialogueOutcome = 'rejected';

  currentCustomer.leave();
  selectedWholesaleItems = [];
  selectedItems = [];
  message = "";
}


function shopDrawTabs() {

  if (showIntro || showReceipt || gameOver || closing) return;
  drawButton('REPUTATION', 328, 12, 150, true, color(98, 67, 46));
  if (dayNumber >= 3 && phoneSeen.upgrades && !phonePending && !phoneCall) {
    drawButton('UPGRADES', 488, 12, 140, true, color(98, 67, 46));
  }
}
