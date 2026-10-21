// The Pawn Shop: red telephone, Mr. Pennyworth, upgrades and weekly rent.
// Load LAST in index.html, after customer_dialogue_only.js.
// Uses p5.js, arrays, objects, conditions, loops, and mousePressed().

let phoneSheet;
let phonePending = '';  // 'hello', 'upgrades', 'rentReveal', 'rent'
let phoneCall = '';     // active call panel
let phoneSeen = {hello:false, upgrades:false, rentReveal:false};
let phoneSelected = [];
let phoneSavedPause = false;
let phoneHint = '';
let phoneHintUntil = 0;
let phonePaidToday = false;
const phoneX = 673, phoneY = 360, phoneW = 180, phoneH = 180;

// Request the asset at startup. Existing setup() remains the only setup function.
let phoneOriginalSetup = setup;
setup = async function() {
  await phoneOriginalSetup();
  phoneSheet = await loadImage('images/phone.png');
};

function phoneRentAmount(day) {
  // Rent is due at the end of Days 14, 21, 28...; no decimals.
  return round(10 * pow(1.2, floor(day / 7) - 2));
}

function phoneStart(eventName) {
  phonePending = eventName;
  phoneSelected = [];
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
  if (phoneSavedPause) togglePause();
  phoneSavedPause = false;
}

// Replace the original daily closing logic, which deducted $10 every day.
// Rent is collected only by the landlord's rent-day call.
updateDay = function() {
  if (dayStarted && !closing && millis() - startTime >= dayLength) {
    closing = true;
    showBag = false;
    if (customerState === 'waiting') finishTrade();
    else if (customerState === 'entering') customerState = 'leaving';
    if (customerState === 'gone') {
      shopkeeperState = 'leaving';
      shopkeeperRouteIndex = shopkeeperRoute.length - 2;
    }
  }
};

// Day banner countdown only appears after the Day 7 surprise.
let phoneOriginalDrawInfo = drawInfo;
drawInfo = function() {
  phoneOriginalDrawInfo();
  if (dayNumber <= 7) return;
  let remaining = 7 - (dayNumber % 7);
  if (remaining === 7) remaining = 0;
  // Small line beneath DAY X but within the existing day/money panel.
  fill(74, 47, 30); textAlign(LEFT); textStyle(NORMAL);
  textSize(12);
  let label = remaining === 0 ? '(rent due today)' : '(' + remaining + ' days till rent)';
  // Put countdown directly after the day number, not beside the money.
  text(label, 88, 39);
};

// Hide upgrades until Day 3, without changing the PEOPLE button.
let phoneOriginalTabs = shopDrawTabs;
shopDrawTabs = function() {
  if (showIntro || showReceipt || gameOver || closing) return;
  drawButton('PEOPLE', 328, 12, 124, true, color(98, 67, 46));
  if (dayNumber >= 3 && phoneSeen.upgrades && !phonePending && !phoneCall) {
    drawButton('UPGRADES', 462, 12, 140, true, color(98, 67, 46));
  }
};


function phoneBox() {
  noStroke(); fill(0, 0, 0, 185); rect(0, 0, width, height);
  pixelBoard(105, 65, 654, 455);
  textAlign(CENTER); textStyle(BOLD); fill(97, 58, 36);
  textSize(24); text('MR. PENNYWORTH', 432, 112);
  textStyle(NORMAL);
}
function phoneDrawCall() {
  phoneBox();
  if (phoneCall === 'hello') {
    fill(66, 43, 29);
    textAlign(LEFT);
    textStyle(NORMAL);
    textSize(19);
    text('Ah, you must be the new shopkeeper!', 190, 177);
    text("Name's Mr. Pennyworth. I own this place,", 190, 212);
    text("so I thought I'd give you a little welcome call.", 190, 247);
    text('Take good care of the shop, will you?', 190, 301);
    text("I'll be checking in from time to time!", 190, 336);
    drawButton('CONTINUE', 330, 443, 204, true, color(70, 115, 65));

  } else if (phoneCall === 'upgrades') {
    fill(66, 43, 29);
    textAlign(LEFT);
    textStyle(NORMAL);
    textSize(19);
    text("How's business treating you?", 190, 170);
    textSize(18);
    text("I've got some improvements available for your shop.", 190, 214);
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

    text("Well, well! You've made it through your first week!", 170, 157);
    text("I hope you've enjoyed my generosity.", 170, 193);
    text("The first week was on the house!", 170, 229);
    text("From now on, rent is due every seven days.", 170, 265);
    text("$10 to start, with a 20% increase each week.", 170, 301);
    text("Business is business!", 170, 337);

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
  } else if (phoneCall === 'hotline') {
    { fill(66, 43, 29); textAlign(LEFT); textStyle(NORMAL); textSize(24); text('ORDERING HOTLINE', 143, 186, 570, 28); };
    { fill(66, 43, 29); textAlign(LEFT); textStyle(NORMAL); textSize(20); text('Order one Apple for $8?', 143, 267, 570, 28); };
    { fill(66, 43, 29); textAlign(LEFT); textStyle(NORMAL); textSize(17); text('Available bag space: ' + (shopCapacity() - inventory.length), 143, 310, 570, 28); };
    drawButton('ORDER $8', 151, 420, 200, money >= 8 && inventory.length < shopCapacity(), color(70, 115, 65));
    drawButton('CANCEL', 511, 420, 200, true, color(155, 83, 66));
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
let phoneOriginalReceipt = drawReceipt;
drawReceipt = function() {
  phoneOriginalReceipt();
  // Cover the original fixed-rent/net-profit rows, retaining the pixel board's cream color.
  noStroke(); fill(221,191,143); rect(138, 414, 588, 64);
  let rent = 0, income = 0, spending = 0;
  for (let entry of dailyLog) {
    if (entry.type === 'RENT') rent += entry.amount;
    if (entry.type === 'SELL' || entry.type === 'DISCOUNT') income += entry.amount;
    if (entry.type === 'BUY') spending += entry.amount;
  }
  fill(65,40,28); textStyle(NORMAL); textSize(14);
  textAlign(LEFT); text('RENT',155,435);
  textAlign(RIGHT); text(rent ? '-$'+rent.toFixed(2) : '$0',705,435);
  textSize(16); textAlign(LEFT); text('NET PROFIT',155,468);
  textAlign(RIGHT); let profit = income - spending - rent;
  text((profit >= 0 ? '+' : '-') + '$' + abs(profit).toFixed(2),705,468);
};

let phoneOriginalDraw = draw;
draw = function() {
  phoneCheckEvents();
  phoneOriginalDraw();
  if (showIntro || gameOver) return;
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
};

let phoneOriginalMouse = mousePressed;
mousePressed = function() {
  if (phonePending && !phoneCall) {
    if (pawnHit(phoneX,phoneY,phoneW,phoneH)) {
      phoneCall = phonePending;
      phonePending = '';
    }
    return;
  }
  if (phoneCall) {
    if (phoneCall === 'rent') {
      for (let i = 0; i < inventory.length && i < 8; i++) {
        let x = 135 + (i % 2) * 297;
        let y = 220 + floor(i / 2) * 44;
        if (pawnHit(x,y,278,36)) {
          let pos = phoneSelected.indexOf(i);
          if (pos === -1) phoneSelected.push(i);
          else phoneSelected.splice(pos,1);
          return;
        }
      }
      if (pawnHit(135,460,235,32)) { phoneSellSelection(); return; }
      if (pawnHit(495,460,235,32)) { phoneSelected=[]; phonePayRent();phoneEndCall();return; }
    } else if (phoneCall === 'hotline') {
      if (pawnHit(151,420,200,32)) {
        if (money >= 8 && inventory.length < shopCapacity()) {
          money -= 8; inventory.push({product:3,boughtFor:8});
          dailyLog.push({type:'BUY',name:'Apple',amount:8});
          phoneEndCall();
        }
        return;
      }
      if (pawnHit(511,420,200,32)) { phoneEndCall();return; }
    } else if (pawnHit(330,443,204,32)) { phoneEndCall(); return; }
    return;
  }
  if (showIntro || showReceipt || gameOver || closing || pawnIntroType) {
    phoneOriginalMouse(); return;
  }
  // Block the hidden upgrade tab until the Day 3 call has finished.
  if (dayNumber < 3 && pawnHit(462,12,140,32)) return;
  if (pawnHit(phoneX,phoneY,phoneW,phoneH) && !pawnTradeActive() && !shopMenu) {
    if (shopUpgrades[4]) {
      phoneSavedPause = !gamePaused;
      if (phoneSavedPause) togglePause();
      phoneCall = 'hotline';
    } else {
      phoneHint='ORDERING HOTLINE LOCKED'; phoneHintUntil=millis()+2200;
    }
    return;
  }
  phoneOriginalMouse();
};

let phoneOriginalRestart = restartGame;
restartGame = function() {
  phoneOriginalRestart();
  phonePending='';phoneCall='';phoneSelected=[];
  phoneSeen={hello:false, upgrades:false, rentReveal:false};
  phoneSavedPause=false;phonePaidToday=false;
};

// Ensure each rent day is handled only once even if the receipt stays open.
let phoneOriginalNextDay = moveShopkeeper;
moveShopkeeper = function() {
  let before = dayNumber;
  phoneOriginalNextDay();
  if (dayNumber !== before) phonePaidToday = false;
};

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
  customerState = 'gone';
  currentTrade = undefined;
  selectedItems = [];
  pawnVisitor = null;
  dayNumber = day;
  dayStarted = true;
  startTime = millis();
  nextArrival = millis() + 6000;
  nextMorning = 0;
  shopkeeperState = 'working';
  shopkeeperX = 710;
  shopkeeperY = 260;
  phonePaidToday = false;
  dailyLog = [];
  // Prior announcements are logically unlocked when jumping beyond them.
  if (day > 1) phoneSeen.hello = true;
  if (day > 3) phoneSeen.upgrades = true;
  if (day > 7) phoneSeen.rentReveal = true;
  if (day === 3) phoneSeen.upgrades = false; // Test the unlock call.
  if (day === 7) phoneSeen.rentReveal = false; // Test the reveal at closing.
}

// Close the day immediately and open its receipt. Phone events work normally.
function testEndDay() {
  if (showIntro || phonePending || phoneCall || pawnIntroType || gameOver) return;
  if (shopMenu) shopCloseMenu();
  gamePaused = false;
  showBag = false;
  showBudgetWarning = false;
  customerState = 'gone';
  currentTrade = undefined;
  selectedItems = [];
  closing = true;
  dayStarted = false;
  shopkeeperState = 'gone';
  showReceipt = true;
}

// Small on-screen keyboard reference; no mouse controls to clash with trading.
function drawTestPanel() {
  if (!DEV_TEST_MODE || !testPanelVisible) return;
  push();
  noStroke(); fill(40, 29, 25, 235); rect(216, 100, 433, 170);
  fill(255); textFont('Pixelify Sans'); textAlign(LEFT); textStyle(NORMAL);
  textSize(20); text('DEV TEST MODE', 234, 130);
  textSize(16);
  text('N = next day     E = end today', 234, 160);
  text('3 = Day 3       7 = Day 7', 234, 187);
  text('8 = Day 8       0 = Day 14', 234, 214);
  text('T = hide/show    (not for release)', 234, 244);
  pop();
}

let testPreviousDraw = draw;
draw = function() {
  testPreviousDraw();
  drawTestPanel();
};

let testPreviousKeyPressed = typeof keyPressed === 'function' ? keyPressed : null;
keyPressed = function() {
  if (DEV_TEST_MODE) {
    let k = String(key).toLowerCase();
    if (k === 't') { testPanelVisible = !testPanelVisible; return false; }
    if (testPanelVisible) {
      if (k === 'n') testJumpToDay(dayNumber + 1);
      else if (k === 'e') testEndDay();
      else if (k === '3') testJumpToDay(3);
      else if (k === '7') testJumpToDay(7);
      else if (k === '8') testJumpToDay(8);
      else if (k === '0') testJumpToDay(14);
      else if (testPreviousKeyPressed) return testPreviousKeyPressed();
      return false;
    }
  }
  if (testPreviousKeyPressed) return testPreviousKeyPressed();
};
