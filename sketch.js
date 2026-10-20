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

let shopkeeperRouteIndex = 1;

let routeIndex = 0;
let customerDirection = 7;
let customerSpeed = 2;
let shopBg, shopkeeper;
let customers = [];
let currentCustomer;

const products = [
    { name: "Watch", category: "Daily", value: 35 },
    { name: "Phone", category: "Daily", value: 60 },
    { name: "Bread", category: "Food", value: 15 },
    { name: "Apple", category: "Food", value: 10 },
    { name: "Hammer", category: "Tools", value: 40 },
    { name: "Shovel", category: "Tools", value: 30 }
];

let gamePaused = false;
let pauseStart = 0;
let gameOver = false;

let inventory = [];
let money = 150;
let customerNumber = 0;
let dayNumber = 1;

let showIntro = true;
let dayStarted = false;
let closing = false;
let startTime = 0;
let nextArrival = 0;
let nextMorning = 0;

// 3 real minutes = 16 game hours
const dayLength = 180000;
const bagLimit = 6;

let shopkeeperX = shopkeeperRoute[0].x;
let shopkeeperY = shopkeeperRoute[0].y;
let shopkeeperState = "entering";

let customerX = customerRoute[0].x;
let customerY = customerRoute[0].y;
let customerState = "gone";

let shopkeeperSize = 144;
let customerSize = 144;

let currentTrade;
let showBag = false;
let message = "";
let selectedItems = [];
let dailyLog = [];
let showReceipt = false;
const dailyRent = 10;
let showBudgetWarning = false;

async function setup() {
    let canvas = createCanvas(864, 576);
    canvas.parent("game");

    noSmooth();
    textFont("Pixelify Sans");

    shopBg = await loadImage("images/shop.png");
    shopkeeper = await loadImage("images/shopkeeper.png");

    customers[0] = await loadImage("images/customer1.png");
    customers[1] = await loadImage("images/customer2.png");
    customers[2] = await loadImage("images/customer3.png");
}

function draw() {
    background(0);

    if (!shopBg || !shopkeeper || customers.length < 3) {
        return;
    }

    image(shopBg, 0, 0, width, height);

    if (!showIntro && !gamePaused && !showReceipt && !gameOver) {
      updateDay();
      moveShopkeeper();
      moveCustomer();
    }
    
    drawCharacters();
    
    drawInfo();
    drawClock();
    drawPauseButton();
    drawBagIcon();

    if (customerState === "waiting" && !closing) {
        drawBoard();
    }

    if (showBag) {
        drawBag();
    }

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
    text("WELCOME TO THE PAWN SHOP", width / 2, 102);
  
    textStyle(NORMAL);
    textSize(18);
    text("Make smart deals and grow your little shop.", width / 2, 133);
  
    // How to play
    fill(65, 40, 28);
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(21);
    text("HOW TO PLAY", 142, 183);
  
    textStyle(NORMAL);
    textSize(17);
    text("Buy items offered by customers.", 142, 213);
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
    text("OPEN 8 AM - MIDNIGHT", 432, 457);
  
    drawButton("START GAME", 317, 474, 220, true, color(70, 115, 65));
  }
  

// Day and money
function drawInfo() {
    pixelBoard(10, 10, 208, 76);

    fill(65, 40, 28);
    textAlign(LEFT);
    textSize(15);

    text("DAY " + dayNumber, 24, 40);
    text("MONEY $" + money.toFixed(2), 24, 63);
}

// Clock from 8 AM to midnight
function drawClock() {
  let currentTime = gamePaused ? pauseStart : millis();
  let elapsed = dayStarted ? currentTime - startTime : 0;

    elapsed = constrain(elapsed, 0, dayLength);

    let minutes = floor((480 + elapsed / dayLength * 960) / 10) * 10;

    let hour24 = floor(minutes / 60);
    let minute = minutes % 60;

    let period = hour24 >= 12 && hour24 < 24 ? "PM" : "AM";

    let hour12 = hour24 % 12;

    if (hour12 === 0) {
        hour12 = 12;
    }

    pixelBoard(672, 10, 182, 55);

    fill(65, 40, 28);
    textAlign(CENTER);
    textSize(15);

    text(hour12 + ":" + nf(minute, 2) + " " + period, 763, 44);
}

function drawPauseButton() {

  pixelBoard(610, 10, 52, 55);

  noStroke();
  fill(65, 40, 28);

  if (gamePaused) {
      // Play icon ▶
      triangle(628, 24, 628, 50, 649, 37);
  }
  else {
      // Pause icon Ⅱ
      rect(626, 25, 7, 24);
      rect(640, 25, 7, 24);
  }
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
function drawBag() {
    pixelBoard(125, 100, 610, 370);

    fill(65, 40, 28);
    textAlign(LEFT);
    textSize(18);

    text("YOUR BAG (" + inventory.length + "/" + bagLimit + ")", 151, 139);

    textSize(14);

    if (inventory.length === 0) {
        text("Your bag is empty.", 151, 182);
    }

    for (let i = 0; i < inventory.length; i++) {
        let entry = inventory[i];
        let item = products[entry.product];

        text(
            item.name + " / " + item.category +
            " / $" + entry.boughtFor.toFixed(2),
            151, 178 + i * 39
        );
    }

    text("CLICK BAG TO CLOSE", 151, 439);
}

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

  // Reset shopkeeper
  shopkeeperX = shopkeeperRoute[0].x;
  shopkeeperY = shopkeeperRoute[0].y;
  shopkeeperRouteIndex = 1;
  shopkeeperState = "entering";

  // Reset customer
  customerX = customerRoute[0].x;
  customerY = customerRoute[0].y;
  customerState = "gone";
  routeIndex = 0;
  customerDirection = 7;
  currentCustomer = undefined;
  customerNumber = 0;

  // Reset trading
  currentTrade = undefined;
  selectedItems = [];
  message = "";

  // Reset screens
  showBag = false;
  showReceipt = false;
  showBudgetWarning = false;
  gamePaused = false;
  pauseStart = 0;
  gameOver = false;

  // Return to introduction screen
  showIntro = true;
}

function drawReceipt() {

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

  // Daily operating fee
  textAlign(LEFT);
  textSize(14);
  text("SHOP OPERATION / RENT", 155, 433);

  textAlign(RIGHT);
  text("-$10.00", 705, 433);

  // Net cash profit
  let profit = totalSold - totalBought - 10;

  textSize(15);
  textAlign(LEFT);
  text("NET PROFIT", 155, 466);

  textAlign(RIGHT);
  text((profit >= 0 ? "+" : "-") +
       "$" + abs(profit).toFixed(2), 705, 466);

  drawButton("CLOSE", 340, 483, 184, true,
             color(70, 115, 65));
}


// Check whether the shop should close
function updateDay() {
    if (dayStarted && !closing && millis() - startTime >= dayLength) {
      closing = true;
      showBag = false;
      money -= dailyRent;

      if (customerState === "waiting") {
        finishTrade();
      }
      else if (customerState === "entering") {
        customerState = "leaving";
      }

      if (customerState === "gone") {
        shopkeeperState = "leaving";
        shopkeeperRouteIndex = shopkeeperRoute.length - 2;
      }
    }
}

// Shopkeeper enters in the morning and leaves at night

function moveShopkeeper() {

  if (shopkeeperState === "entering" ||
      shopkeeperState === "leaving") {

      let target = shopkeeperRoute[shopkeeperRouteIndex];

      // Move toward target X
      if (shopkeeperX < target.x) {
          shopkeeperX = min(shopkeeperX + 1, target.x);
      }
      else if (shopkeeperX > target.x) {
          shopkeeperX = max(shopkeeperX - 1, target.x);
      }

      // Move toward target Y
      if (shopkeeperY < target.y) {
          shopkeeperY = min(shopkeeperY + 1, target.y);
      }
      else if (shopkeeperY > target.y) {
          shopkeeperY = max(shopkeeperY - 1, target.y);
      }

      // Reached this waypoint
      if (shopkeeperX === target.x &&
          shopkeeperY === target.y) {

          if (shopkeeperState === "entering") {

            if (shopkeeperRouteIndex < shopkeeperRoute.length - 1) {
              shopkeeperRouteIndex++;
            }
            else {
                shopkeeperState = "working";
                dayStarted = true;
                startTime = millis();
                scheduleCustomer();
            }
          }

          else if (shopkeeperState === "leaving") {

              if (shopkeeperRouteIndex === 1) {
                  shopkeeperRouteIndex = 0;
              }
              else {
                shopkeeperState = "gone";
            
                if (money < 0) {
                  gameOver = true;
                }
                else {
                    showReceipt = true;
                }
              }
          }
      }
  }

  else if (shopkeeperState === "gone" &&
           closing && millis() >= nextMorning) {

      dayNumber++;
      dayStarted = false;
      closing = false;
      dailyLog = [];

      shopkeeperRouteIndex = 1;
      shopkeeperState = "entering";
  }
}


// Random delay between customers
function scheduleCustomer() {
    nextArrival = millis() + random(1500, 5000);
}

// Random customer and transaction

function generateCustomer() {

  currentCustomer = random(customers);

  let itemIndex = floor(random(products.length));
  let type = random(["sell", "category"]);

  // Buyer offers 5% to 20% above original value
  let markup = random(1.05, 1.20);

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
          let productIndex = floor(random(products.length));
          currentTrade.items.push(productIndex);
      }
  }

  selectedItems = [];

  customerNumber++;

  customerX = customerRoute[0].x;
  customerY = customerRoute[0].y;

  routeIndex = 1;
  customerDirection = 7;
  customerState = "entering";

  message = "";
}


// Customer enters, stops, and exits

function moveCustomer() {

  if (customerState === "gone") {
      if (dayStarted && !closing && millis() >= nextArrival) {
          generateCustomer();
      }
  }

  else if (customerState === "entering" ||
           customerState === "leaving") {

      let target = customerRoute[routeIndex];

      // Move horizontally first if X is different
      if (customerX < target.x) {
          customerX = min(customerX + customerSpeed, target.x);
          customerDirection = 6; // Walk right
      }

      else if (customerX > target.x) {
          customerX = max(customerX - customerSpeed, target.x);
          customerDirection = 5; // Walk left
      }

      // Otherwise move vertically
      else if (customerY < target.y) {
          customerY = min(customerY + customerSpeed, target.y);
          customerDirection = 4; // Walk down
      }

      else if (customerY > target.y) {
          customerY = max(customerY - customerSpeed, target.y);
          customerDirection = 7; // Walk up
      }

      // Reached the current waypoint
      if (customerX === target.x && customerY === target.y) {

          if (routeIndex === 4 && customerState === "entering") {
              customerState = "waiting";
          }

          else if (routeIndex === 7) {
              customerState = "gone";

              if (closing) {
                  shopkeeperState = "leaving";
                  shopkeeperRouteIndex = shopkeeperRoute.length - 2;
              } else {
                  scheduleCustomer();
              }
          }

          else {
              routeIndex++;
          }
      }
  }
}


// Animate the characters


function drawCharacters() {

  let walkFrame = floor(frameCount / 12) % 4;
  let idleFrame = floor(frameCount / 30) % 2;
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, width, 250);
  drawingContext.clip();

  // Shopkeeper
  if (shopkeeperState === "entering") {

    if (shopkeeperRouteIndex === 1) {
        // Walk down
        drawSprite(shopkeeper, shopkeeperX, shopkeeperY,
                  shopkeeperSize, walkFrame, 2);
    }
    else {
        // Walk left
        drawSprite(shopkeeper, shopkeeperX, shopkeeperY,
                  shopkeeperSize, walkFrame + 4, 2);
    }
  }

  else if (shopkeeperState === "working") {
    // Stand facing left
    drawSprite(shopkeeper, shopkeeperX, shopkeeperY,
              shopkeeperSize, idleFrame + 2, 0);
  }

  else if (shopkeeperState === "leaving") {

    if (shopkeeperRouteIndex === 1) {
        // Walk right
        drawSprite(shopkeeper, shopkeeperX, shopkeeperY,
                  shopkeeperSize, walkFrame, 3);
    }
    else {
        // Walk up
        drawSprite(shopkeeper, shopkeeperX, shopkeeperY,
                  shopkeeperSize, walkFrame + 4, 3);
    }
  }

  drawingContext.restore();

  // Customer
  if (customerState === "entering" ||
      customerState === "leaving") {

      if (customerDirection === 4) {
          // Walk down
          drawSprite(currentCustomer, customerX, customerY,
                     customerSize, walkFrame, 2);
      }

      else if (customerDirection === 5) {
          // Walk left
          drawSprite(currentCustomer, customerX, customerY,
                     customerSize, walkFrame + 4, 2);
      }

      else if (customerDirection === 6) {
          // Walk right
          drawSprite(currentCustomer, customerX, customerY,
                     customerSize, walkFrame, 3);
      }

      else if (customerDirection === 7) {
          // Walk up
          drawSprite(currentCustomer, customerX, customerY,
                     customerSize, walkFrame + 4, 3);
      }
  }

  else if (customerState === "waiting") {
      // Idle facing right
      drawSprite(currentCustomer, customerX, customerY,
                 customerSize, idleFrame + 4, 0);
  }
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



function completeBuyerSale() {

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
}




// Price a buyer offers for one item
function buyerPrice(productIndex) {
  let original = products[productIndex].value;
  return Number((original * currentTrade.markup).toFixed(2));
}

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
function bundleTotal() {

  let total = 0;

  for (let index of currentTrade.items) {
      total += products[index].value;
  }

  return total;
}

// Customer dialogue board

function drawBoard() {

  pixelBoard(110, 344, 645, 222);

  fill(65, 40, 28);
  textAlign(LEFT);
  textSize(14);

  if (currentTrade.type === "sell") {

      let total = bundleTotal();

      text("SELLER OFFERS " + currentTrade.items.length + " ITEMS",
           135, 375);

      text("Total: $" + total.toFixed(2), 135, 399);

      for (let i = 0; i < currentTrade.items.length; i++) {

          let item = products[currentTrade.items[i]];

          text(item.name + " - $" + item.value.toFixed(2),
               150, 426 + i * 27);
      }

      let canBuy =
          inventory.length + currentTrade.items.length <= bagLimit &&
          money >= total;

      drawButton("BUY ALL", 150, 520, 185,
                 canBuy, color(70, 115, 65));

      drawButton("REJECT", 505, 520, 185,
                 true, color(160, 70, 60));
  }

  else {

      let entries = availableItems();
      text("BUYER WANTS: " + currentTrade.category, 135, 375);

      textSize(12);
      text("BUDGET $" + currentTrade.budget +
        " | SELECTED $" + selectedTotal().toFixed(2),
        135, 397);

      // Display available inventory
      for (let j = 0; j < entries.length; j++) {

          let index = entries[j];
          let entry = inventory[index];
          let item = products[entry.product];

          let x = 135 + (j % 2) * 305;
          let y = 414 + floor(j / 2) * 33;

          let selected = selectedItems.includes(index);

          let label = (selected ? "[X] " : "[ ] ") +
                      item.name + " $" +
                      buyerPrice(entry.product).toFixed(2);

          drawButton(label, x, y, 280, true,
              selected ? color(70, 115, 65) :
                         color(120, 85, 55));
      }

      if (entries.length === 0) {
          fill(65, 40, 28);
          text("No matching items available.", 135, 451);
      }

      drawButton("CONFIRM", 150, 520, 185,
        selectedItems.length > 0,
        color(70, 115, 65));

      drawButton("REJECT", 505, 520, 185,
                 true, color(160, 70, 60));
  }
}


// Complete a transaction
function finishTrade() {
  customerState = "leaving";
  routeIndex = 5;
  selectedItems = [];
  message = "";
}

// Handle mouse clicks

function mousePressed() {
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

  // Pause / Resume button
  if (mouseX >= 610 && mouseX <= 662 &&
    mouseY >= 10 && mouseY <= 65) {

    togglePause();
    return;
}

  // Disable other interactions while paused
  if (gamePaused) {
    return;
  }

  // Open or close bag
  if (mouseX >= 230 && mouseX <= 318 &&
      mouseY >= 10 && mouseY <= 86) {

      showBag = !showBag;
      return;
  }

  if (showBag || closing || customerState !== "waiting") {
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