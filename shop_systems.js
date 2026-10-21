// THE PAWN SHOP - relationships, upgrades, bargaining
// Add AFTER sketch.js and customer_ui.js in index.html.
// Only p5.js + beginner JavaScript (arrays, objects, functions and mousePressed).

let shopMenu = "";             // "people", "upgrades", or ""
let shopMenuPaused = false;
let shopUpgrades = [false, false, false, false, false];
let shopUpgradeTitles = ["PRICE CATALOG", "STORAGE +2", "DISPLAY SHELVES",
                         "ADVERTISING", "ORDERING HOTLINE"];
let shopUpgradePrices = [90, 130, 120, 100, 160];
let shopUpgradeDescriptions = [
  "Show original item values during trading.",
  "Increase bag space by two items.",
  "Earn 5% more on sales.",
  "Attract customers more frequently.",
  "Order an Apple for $8 whenever you have space."
];
let shopMessage = "";
let shopBargained = false;
let shopTradeMultiplier = 1;

// One centralized capacity check. Used by the trading UI and bag.
// Fix a score of 0 displaying as 50 in the earlier customer UI.
pawnScore = function() {
  if (!pawnVisitor) return 50;
  return pawnRelationship[pawnVisitor.type];
};

function shopCapacity() {
  return bagLimit + (shopUpgrades[1] ? 2 : 0);
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


function shopDrawTabs() {
  // Draw HUD tabs only during normal play, not in intro/receipt etc.
  if (showIntro || showReceipt || gameOver || closing) return;
  drawButton("PEOPLE", 328, 12, 124, true, color(98, 67, 46));
  drawButton("UPGRADES", 462, 12, 140, true, color(98, 67, 46));
}

function shopDrawPeople() {
  noStroke(); fill(0, 0, 0, 175); rect(0, 0, width, height);
  pixelBoard(116, 57, 632, 462);
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(22); text("CUSTOMER RELATIONSHIPS", 145, 102); };
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(14); text("Every group starts at 50 / 100", 145, 131); };

  let groups = ["Regular", "Bargain", "Collector", "Suspicious"];
  let names = ["REGULAR CUSTOMERS", "BARGAIN HUNTERS", "WEALTHY COLLECTORS", "SUSPICIOUS SELLERS"];
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

function shopDrawUpgrades() {
  noStroke(); fill(0, 0, 0, 175); rect(0, 0, width, height);
  pixelBoard(94, 33, 676, 508);
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(22); text("SHOP UPGRADES", 125, 74); };
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16); text("BALANCE: $" + money.toFixed(2), 125, 103); };
  for (let i = 0; i < 5; i++) {
    let y = 120 + i * 69;
    shopMenuCard(119, y, 626, 62);
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(17); text(shopUpgradeTitles[i], 134, y + 22, 450, 28); };
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(14); text(shopUpgradeDescriptions[i], 134, y + 43, 455, 28); };
    let owned = shopUpgrades[i];
    drawButton(owned ? "OWNED" : "$" + shopUpgradePrices[i],
               609, y + 15, 116, !owned && money >= shopUpgradePrices[i],
               color(73, 120, 72));
  }
  if (shopUpgrades[4]) {
    drawButton("ORDER $8", 568, 474, 156,
               money >= 8 && inventory.length < shopCapacity(), color(73, 120, 72));
  }
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(12); text(shopMessage.substring(0, 34), 125, 504); };
  drawButton("CLOSE", 350, 501, 166, true, color(98, 67, 46));
}

// Save prior wrappers, so customer movement and trade logic continue to run.
let shopPreviousDraw = draw;
draw = function() {
  shopPreviousDraw();
  if (showIntro || showReceipt || gameOver) return;
  if (pawnIntroType) return;
  shopDrawTabs();
  if (shopMenu === "people") shopDrawPeople();
  if (shopMenu === "upgrades") shopDrawUpgrades();
};

let shopPreviousGenerate = generateCustomer;
generateCustomer = function() {
  shopPreviousGenerate();
  shopBargained = false;
  shopTradeMultiplier = 1;
  if (pawnVisitor && pawnVisitor.type !== "Inspector") {
    let score = pawnRelationship[pawnVisitor.type];
    // Small, predictable relationship discount/bonus for sales.
    currentTrade.markup *= 1 + (score - 50) * 0.002;
  }
};

let shopPreviousBuyerPrice = buyerPrice;
buyerPrice = function(index) {
  let price = shopPreviousBuyerPrice(index);
  if (shopUpgrades[2]) price *= 1.05;
  return Number(price.toFixed(2));
};
let shopPreviousBundleTotal = bundleTotal;
bundleTotal = function() {
  return Number((shopPreviousBundleTotal() * shopTradeMultiplier).toFixed(2));
};
let shopPreviousArrival = scheduleCustomer;
scheduleCustomer = function() {
  shopPreviousArrival();
  if (shopUpgrades[3]) nextArrival = millis() + random(1000, 3200);
};

let shopPreviousDrawBag = drawBag;
drawBag = function() {
  shopPreviousDrawBag();
  // Original bag title uses bagLimit; cover only its title with a corrected one.
  fill(221, 191, 143); noStroke(); rect(146, 116, 537, 31);
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(20); text("YOUR BAG (" + inventory.length + "/" + shopCapacity() + ")", 151, 139); };
};

// Supplement customer_ui's trade screen, without changing its portrait layout.
let shopPreviousTradeBoard = pawnTradeBoard;
pawnTradeBoard = function() {
  shopPreviousTradeBoard();
  if (!pawnTradeActive()) return;

  if (shopUpgrades[0]) {
    // Show bundle's base value or buyer's requested category reference.
    let value = 0;
    if (currentTrade.type === "sell") {
      for (let idx of currentTrade.items) value += products[idx].value;
    } else value = products[currentTrade.product].value;
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(14); text("CATALOG VALUE: $" + value.toFixed(2), 501, 230); };
  }
  if (pawnScore() >= 60 && !shopBargained) {
    pawnButton("BARGAIN", 481, 489, 152, true, color(157, 113, 55));
  }
};

function shopTryBargain() {
  if (pawnScore() < 60 || shopBargained || !currentTrade) return;
  shopBargained = true;
  let chance = 0.5 + (pawnScore() - 60) * 0.005;
  if (pawnVisitor.type === "Bargain") chance -= 0.12;
  if (random() < chance) {
    if (currentTrade.type === "sell") shopTradeMultiplier *= 0.9;
    else currentTrade.markup *= 1.1;
    pawnChangeScore(2);
    pawnMessage = "COUNTEROFFER ACCEPTED!";
  } else {
    pawnChangeScore(-5);
    pawnMessage = "COUNTEROFFER REJECTED!";
  }
}
function shopBuyUpgrade(i) {
  if (shopUpgrades[i] || money < shopUpgradePrices[i]) return;
  money -= shopUpgradePrices[i];
  shopUpgrades[i] = true;
  shopMessage = shopUpgradeTitles[i] + " UNLOCKED";
}

let shopPreviousMouse = mousePressed;
mousePressed = function() {
  if (pawnIntroType) { shopPreviousMouse(); return; }
  if (shopMenu !== "") {
    if (shopMenu === "people") {
      if (pawnHit(347, 462, 170, 32)) shopCloseMenu();
    } else {
      if (pawnHit(350, 501, 166, 32)) shopCloseMenu();
      else if (shopUpgrades[4] && pawnHit(568, 474, 156, 32)) {
        if (money >= 8 && inventory.length < shopCapacity()) {
          money -= 8;
          inventory.push({product:3, boughtFor:8});
          dailyLog.push({type:"BUY", name:"Apple", amount:8});
          shopMessage = "APPLE ORDER RECEIVED";
        }
      } else {
        for (let i = 0; i < 5; i++) {
          let y = 120 + i * 69 + 15;
          if (pawnHit(609, y, 116, 32)) { shopBuyUpgrade(i); break; }
        }
      }
    }
    return;
  }
  if (!showIntro && !showReceipt && !gameOver && !closing && !showBudgetWarning) {
    if (pawnHit(328, 12, 124, 32)) { shopOpenMenu("people"); return; }
    if (pawnHit(462, 12, 140, 32)) { shopOpenMenu("upgrades"); return; }
  }
  if (pawnTradeActive() && !gamePaused && !showBag &&
      pawnScore() >= 60 && !shopBargained &&
      pawnHit(481, 489, 152, 36)) {
    shopTryBargain(); return;
  }
  // Prevent purchase beyond upgraded storage size.
  if (pawnTradeActive() && currentTrade.type === "sell" &&
      !gamePaused && !showBag && pawnHit(312, 489, 152, 36)) {
    let cost = bundleTotal();
    if (inventory.length + currentTrade.items.length > shopCapacity()) {
      pawnMessage = "NOT ENOUGH SPACE"; return;
    }
    if (cost > money) { pawnMessage = "NOT ENOUGH MONEY"; return; }
    money -= cost;
    for (let idx of currentTrade.items) {
      let bought = cost / currentTrade.items.length;
      inventory.push({product:idx, boughtFor:bought});
      dailyLog.push({type:"BUY", name:products[idx].name, amount:bought});
    }
    pawnChangeScore(3);
    finishTrade();
    return;
  }
  shopPreviousMouse();
};

let shopPreviousRestart = restartGame;
restartGame = function() {
  shopPreviousRestart();
  shopMenu = "";
  shopMenuPaused = false;
  shopUpgrades = [false, false, false, false, false];
  shopMessage = "";
  shopBargained = false;
  shopTradeMultiplier = 1;
};
