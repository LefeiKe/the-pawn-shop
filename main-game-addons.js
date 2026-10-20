
// Pawn Shop customer types, relationships, and upgrades.
// Uses only p5.js and JavaScript techniques from class.
// This file is loaded after sketch.js so the original game remains intact.

let peopleMenu = "";
let customerGroups = ["REGULAR", "COLLECTOR", "BARGAIN", "SUSPICIOUS"];
let groupScores = [50, 50, 50, 50];
let characterProfiles = [
  {name:"Mia", group:0, sprite:0},
  {name:"Noah", group:0, sprite:1},
  {name:"Victoria", group:1, sprite:2},
  {name:"Edward", group:1, sprite:1},
  {name:"Jay", group:2, sprite:0},
  {name:"Lily", group:2, sprite:2},
  {name:"Marcus", group:3, sprite:1}
];
let visitingProfile = null;
let purchasedUpgrades = [false, false, false, false, false];
let upgradeLabels = ["PRICE CATALOG", "STORAGE +2", "DISPLAY SHELVES", "ADVERTISING", "ORDER HOTLINE"];
let upgradeCosts = [90, 130, 120, 100, 160];
let additionalStorage = 0;
let bargainAttempted = false;
let bargainFeedback = "";
let upgradeFeedback = "";
let menuPausedGame = false;

function mouseInBox(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w &&
         mouseY >= y && mouseY <= y + h;
}
function groupRelationship() {
  if (visitingProfile === null) return 50;
  return groupScores[visitingProfile.group];
}
function modifyRelationship(amount) {
  if (visitingProfile === null) return;
  let g = visitingProfile.group;
  groupScores[g] = constrain(groupScores[g] + amount, 0, 100);
}
function relationName(score) {
  if (score >= 80) return "TRUSTED";
  if (score >= 60) return "FRIENDLY";
  if (score < 30) return "UNFRIENDLY";
  return "NEUTRAL";
}
function getShopCapacity() {
  return bagLimit + additionalStorage;
}
function drawAddonTabs() {
  drawButton("PEOPLE", 333, 10, 118, true, color(95, 65, 43));
  drawButton("UPGRADES", 464, 10, 130, true, color(95, 65, 43));
}
function drawPeopleScreen() {
  noStroke();
  fill(0, 0, 0, 165);
  rect(0, 0, width, height);
  pixelBoard(112, 60, 640, 455);
  textAlign(LEFT);
  fill(65, 40, 28);
  textSize(12);
  text("CUSTOMER RELATIONSHIPS", 142, 101);
  textSize(8);
  text("Each customer group starts at 50/100.", 142, 137);
  for (let i = 0; i < 4; i++) {
    let y = 185 + i * 70;
    let score = groupScores[i];
    fill(65, 40, 28);
    text(customerGroups[i], 142, y);
    text(score + "/100 " + relationName(score), 476, y);
    noStroke();
    fill(115, 84, 58);
    rect(142, y + 13, 565, 14);
    fill(score >= 60 ? color(70, 115, 65) : color(180, 128, 69));
    rect(142, y + 13, 565 * score / 100, 14);
  }
  drawButton("CLOSE", 338, 459, 188, true, color(95, 65, 43));
}
function drawUpgradeScreen() {
  noStroke();
  fill(0, 0, 0, 165);
  rect(0, 0, width, height);
  pixelBoard(85, 35, 694, 500);
  fill(65, 40, 28);
  textAlign(LEFT);
  textSize(12);
  text("SHOP UPGRADES", 113, 75);
  textSize(9);
  text("BALANCE $" + money.toFixed(2), 113, 103);
  let descriptions = [
    "See item base values in the trade panel.",
    "Add two spaces to your inventory.",
    "Earn five percent more from every sale.",
    "Customers arrive slightly sooner.",
    "Order an apple for eight dollars."
  ];
  for (let i = 0; i < 5; i++) {
    let y = 126 + i * 66;
    fill(65, 40, 28);
    textSize(9);
    text(upgradeLabels[i], 113, y);
    textSize(7);
    text(descriptions[i], 113, y + 22);
    drawButton(purchasedUpgrades[i] ? "OWNED" : "$" + upgradeCosts[i],
      617, y - 15, 132,
      !purchasedUpgrades[i] && money >= upgradeCosts[i],
      color(70, 115, 65));
  }
  if (purchasedUpgrades[4]) {
    drawButton("ORDER $8", 600, 449, 150,
      money >= 8 && inventory.length < getShopCapacity(),
      color(70, 115, 65));
  }
  fill(65, 40, 28);
  textSize(7);
  text(upgradeFeedback, 114, 491);
  drawButton("CLOSE", 344, 497, 175, true, color(95, 65, 43));
}
function orderProduct() {
  if (!purchasedUpgrades[4] || money < 8 ||
      inventory.length >= getShopCapacity()) return;
  money -= 8;
  inventory.push({product:3, boughtFor:8});
  dailyLog.push({type:"BUY", name:"Apple", amount:8});
  upgradeFeedback = "ORDER ARRIVED!";
}
function tryBargaining() {
  if (!currentTrade || bargainAttempted || groupRelationship() < 60) return;
  bargainAttempted = true;
  let chance = 0.45 + (groupRelationship() - 60) * 0.005;
  if (visitingProfile && visitingProfile.group === 2) chance -= 0.12;
  if (random() < chance) {
    if (currentTrade.type === "sell") currentTrade.askFactor *= 0.9;
    else currentTrade.markup *= 1.1;
    modifyRelationship(2);
    bargainFeedback = "COUNTEROFFER ACCEPTED!";
  } else {
    modifyRelationship(-5);
    bargainFeedback = "COUNTEROFFER REFUSED!";
  }
}

// Keep original customer movement. Change only which character and price rule is used.
let originalGenerateCustomer = generateCustomer;
generateCustomer = function() {
  originalGenerateCustomer();
  visitingProfile = random(characterProfiles);
  currentCustomer = customers[visitingProfile.sprite];
  let group = visitingProfile.group;
  currentTrade.askFactor = group === 3 ? 0.75 : 1;
  if (group === 1) {
    currentTrade.budget = floor(currentTrade.budget * 1.7);
    currentTrade.markup *= 1.08;
  } else if (group === 2) {
    currentTrade.budget = floor(currentTrade.budget * 0.8);
    currentTrade.markup *= 0.93;
  }
  let relationBonus = 1 + (groupScores[group] - 50) * 0.002;
  currentTrade.markup *= relationBonus;
  bargainAttempted = false;
  bargainFeedback = "";
};

let originalBundleTotal = bundleTotal;
bundleTotal = function() {
  let total = originalBundleTotal();
  return Number((total * (currentTrade.askFactor || 1)).toFixed(2));
};
let originalBuyerPrice = buyerPrice;
buyerPrice = function(index) {
  let price = originalBuyerPrice(index);
  if (purchasedUpgrades[2]) price *= 1.05;
  return Number(price.toFixed(2));
};
let originalScheduleCustomer = scheduleCustomer;
scheduleCustomer = function() {
  originalScheduleCustomer();
  if (purchasedUpgrades[3]) {
    nextArrival = millis() + random(1300, 3300);
  }
};
let originalDrawBag = drawBag;
drawBag = function() {
  originalDrawBag();
  fill(65, 40, 28);
  textAlign(LEFT);
  textSize(8);
  text("CAPACITY " + inventory.length + "/" + getShopCapacity(), 151, 454);
};
let originalDrawBoard = drawBoard;
drawBoard = function() {
  originalDrawBoard();
  if (currentTrade && currentTrade.type === "sell") {
    let valid = inventory.length + currentTrade.items.length <= getShopCapacity() && money >= bundleTotal();
    drawButton("BUY ALL", 150, 520, 185, valid, color(70, 115, 65));
    fill(65, 40, 28); textAlign(LEFT); textSize(8);
    text("TOTAL $" + bundleTotal().toFixed(2), 600, 399);
  }
  if (!currentTrade || !visitingProfile) return;
  pixelBoard(113, 313, 638, 29);
  fill(65, 40, 28);
  textAlign(LEFT);
  textSize(8);
  text(visitingProfile.name.toUpperCase() + " | " +
       customerGroups[visitingProfile.group] + " | " +
       groupRelationship() + "/100", 132, 332);
  if (purchasedUpgrades[0]) {
    fill(65, 40, 28);
    textSize(7);
    text("CATALOG: " + products[currentTrade.product].name +
         " $" + products[currentTrade.product].value, 135, 506);
  }
  if (groupRelationship() >= 60 && !bargainAttempted) {
    drawButton("BARGAIN", 347, 520, 143, true, color(95, 65, 43));
  } else if (bargainFeedback !== "") {
    fill(65, 40, 28);
    textSize(7);
    text(bargainFeedback, 339, 503);
  }
};
let originalDraw = draw;
draw = function() {
  originalDraw();
  if (!showIntro && !gameOver) {
    drawAddonTabs();
    if (peopleMenu === "relationships") drawPeopleScreen();
    if (peopleMenu === "upgrades") drawUpgradeScreen();
  }
};

let originalMousePressed = mousePressed;
mousePressed = function() {
  if (!showIntro && !gameOver && peopleMenu !== "") {
    if (peopleMenu === "relationships") {
      if (mouseInBox(338, 459, 188, 32)) {
        peopleMenu = "";
        if (menuPausedGame) { togglePause(); menuPausedGame = false; }
      }
    } else if (peopleMenu === "upgrades") {
      if (mouseInBox(344, 497, 175, 32)) {
        peopleMenu = "";
        if (menuPausedGame) { togglePause(); menuPausedGame = false; }
      } else if (purchasedUpgrades[4] && mouseInBox(600, 449, 150, 32)) {
        orderProduct();
      } else {
        for (let i = 0; i < 5; i++) {
          let y = 126 + i * 66 - 15;
          if (mouseInBox(617, y, 132, 32) &&
              !purchasedUpgrades[i] && money >= upgradeCosts[i]) {
            money -= upgradeCosts[i];
            purchasedUpgrades[i] = true;
            if (i === 1) additionalStorage += 2;
            upgradeFeedback = upgradeLabels[i] + " UNLOCKED!";
            break;
          }
        }
      }
    }
    return;
  }
  if (!showIntro && !gameOver && !showReceipt && !showBudgetWarning) {
    if (mouseInBox(333, 10, 118, 32)) {
      peopleMenu = "relationships";
      if (!gamePaused) { togglePause(); menuPausedGame = true; }
      showBag = false;
      return;
    }
    if (mouseInBox(464, 10, 130, 32)) {
      peopleMenu = "upgrades";
      if (!gamePaused) { togglePause(); menuPausedGame = true; }
      showBag = false;
      return;
    }
    if (!gamePaused && customerState === "waiting" &&
        !closing && groupRelationship() >= 60 &&
        mouseInBox(347, 520, 143, 32)) {
      tryBargaining();
      return;
    }
  }
  // Match seller payment and storage capacity with the new display.
  if (!showIntro && !gameOver && !showReceipt && !showBudgetWarning &&
      !gamePaused && !showBag && !closing &&
      customerState === "waiting" && currentTrade &&
      currentTrade.type === "sell" &&
      mouseInBox(150, 520, 185, 32)) {
    let price = bundleTotal();
    if (money < price || inventory.length + currentTrade.items.length > getShopCapacity()) return;
    money -= price;
    let perItem = price / currentTrade.items.length;
    for (let idx of currentTrade.items) {
      inventory.push({product:idx, boughtFor:perItem});
      dailyLog.push({type:"BUY",name:products[idx].name,amount:perItem});
    }
    modifyRelationship(3);
    finishTrade();
    return;
  }
  let wasWaiting = customerState === "waiting";
  let wasBuyer = wasWaiting && currentTrade && currentTrade.type !== "sell";
  let wasRejected = wasWaiting && mouseInBox(505, 520, 185, 32) && !showBag && !closing;
  originalMousePressed();
  if (wasRejected && customerState === "leaving") modifyRelationship(-1);
};

let originalRestartGame = restartGame;
restartGame = function() {
  originalRestartGame();
  groupScores = [50, 50, 50, 50];
  purchasedUpgrades = [false, false, false, false, false];
  additionalStorage = 0;
  visitingProfile = null;
  peopleMenu = "";
  bargainAttempted = false;
  bargainFeedback = "";
  upgradeFeedback = "";
  menuPausedGame = false;
};

// Buyer sales may also finish through the budget confirmation popup.
let baseCompleteBuyerSale = completeBuyerSale;
completeBuyerSale = function() {
  baseCompleteBuyerSale();
  modifyRelationship(3);
};
// Expose a simple hook to teammates; invoke when their mini-game finishes.
function pawnShopMiniGameResult(moneyDelta, relationDelta) {
  money += moneyDelta;
  modifyRelationship(relationDelta);
}
