// The Pawn Shop - customer sprites, portraits and redesigned trading screen.
// Load AFTER sketch.js. Uses only p5.js + ordinary JavaScript.
// Asset folders: images/customer_spritesheets/ and images/customer_portraits/

let pawnProfiles = [
  {name:'Mia',type:'Regular'}, {name:'Noah',type:'Regular'},
  {name:'Emma',type:'Regular'}, {name:'Leo',type:'Regular'},
  {name:'Rose',type:'Regular'}, {name:'Sophie',type:'Regular'},
  {name:'Jay',type:'Bargain'}, {name:'Lily',type:'Bargain'},
  {name:'Victoria',type:'Collector'}, {name:'Edward',type:'Collector'},
  {name:'Marcus',type:'Suspicious'}, {name:'Alex',type:'Inspector'}
];
let pawnSprites = {};
let pawnPortraits = {};
let pawnVisitor = null;
let pawnMessage = '';
let pawnRelationship = {Regular:50,Bargain:50,Collector:50,Suspicious:50};
let pawnReady = false;
let pawnIntroSeen = {Regular:false,Bargain:false,Collector:false,Suspicious:false};
let pawnIntroType = '';
let pawnIntroPausedGame = false;
let pawnConversation = '';
const pawnTypeNames = {Regular:'REGULAR CUSTOMER',Bargain:'BARGAIN HUNTER',Collector:'WEALTHY COLLECTOR',Suspicious:'SUSPICIOUS SELLER',Inspector:'SHOP VISITOR'};
const pawnTypeExplanations = {
  Regular:['REGULAR CUSTOMERS','The most common visitors to your pawn shop.','Fair trades help build trust over time.'],
  Bargain:['BARGAIN HUNTERS','These customers have tighter budgets.','They are especially difficult to negotiate with.'],
  Collector:['WEALTHY COLLECTORS','Collectors can spend more than ordinary buyers.','Their offers may be especially profitable.'],
  Suspicious:['SUSPICIOUS SELLERS','These visitors seem to be in a hurry to make a deal.','They are often surprisingly flexible with their prices.']
};
const pawnDialogue = {
  Regular:{sell:['I FOUND A FEW THINGS TO SELL.','WOULD YOU BE INTERESTED IN THESE?','I HOPE THIS IS A FAIR PRICE.'],category:['DO YOU HAVE ANYTHING USEFUL?','I AM LOOKING FOR SOMETHING TODAY.','LET ME SEE WHAT YOU HAVE IN STOCK.']},
  Bargain:{sell:['I THINK THIS IS A GREAT DEAL.','HOW MUCH CAN YOU GIVE ME?','I REALLY NEED A GOOD PRICE.'],category:['MY BUDGET IS A LITTLE TIGHT.','ANY CHANCE OF A GOOD DEAL?','I AM TRYING NOT TO SPEND TOO MUCH.']},
  Collector:{sell:['THIS MIGHT INTEREST YOU.','I BROUGHT SOMETHING FROM MY COLLECTION.','I KNOW GOOD ITEMS WHEN I SEE THEM.'],category:['I AM LOOKING FOR SOMETHING SPECIAL.','QUALITY MATTERS MORE THAN PRICE.','SHOW ME YOUR FINEST STOCK.']},
  Suspicious:{sell:['NO NEED TO ASK TOO MANY QUESTIONS.','I HAVE AN INTERESTING OFFER FOR YOU.','TRUST ME, THIS IS A BARGAIN.'],category:['JUST SHOW ME WHAT YOU HAVE.','I AM ONLY LOOKING AROUND.','KEEP THIS BETWEEN US, ALL RIGHT?']}
};
function pawnNewConversation() {
  if (!pawnVisitor) return '';
  let options = pawnDialogue[pawnVisitor.type];
  if (!options) return 'WELCOME TO THE SHOP.';
  return random(currentTrade.type === 'sell' ? options.sell : options.category);
}
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
let pawnUnlockedTypes = {Regular:true, Bargain:false, Collector:false, Suspicious:false};
let pawnNewTypeDay = -1;
function pawnPickVisitor() {
  let types = ['Regular', 'Bargain', 'Collector', 'Suspicious'];
  let weights = [60, 20, 12, 8];
  let allowed = [];
  let total = 0;
  for (let i = 0; i < types.length; i++) {
    let type = types[i];
    let canVisit = pawnUnlockedTypes[type] ||
      (dayNumber > 1 && pawnNewTypeDay !== dayNumber);
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
function pawnScore() {
  if (!pawnVisitor) return 50;
  return pawnRelationship[pawnVisitor.type] || 50;
}
function pawnChangeScore(amount) {
  if (!pawnVisitor) return;
  let type = pawnVisitor.type;
  pawnRelationship[type] = constrain(pawnRelationship[type] + amount,0,100);
}
function pawnTradeActive() {
  return pawnReady && !showIntro && !showReceipt && !showBudgetWarning &&
         !gameOver && !closing && customerState === 'waiting' && currentTrade;
}

// Keep all the original setup work (shopkeeper, background, original assets).
let pawnOldSetup = setup;
setup = async function() {
  await pawnOldSetup();
  for (let p of pawnProfiles) {
    let file = p.name.toLowerCase() + '.png';
    pawnSprites[p.name] = await loadImage('images/customer_spritesheets/' + file);
    pawnPortraits[p.name] = await loadImage('images/customer_portraits/' + file);
  }
  pawnReady = true;
};

// Preserve customer route + original trade generation; replace random sprite.
let pawnOldGenerate = generateCustomer;
generateCustomer = function() {
  pawnOldGenerate();
  if (!pawnReady) return;
  pawnVisitor = pawnPickVisitor();
  currentCustomer = pawnSprites[pawnVisitor.name];
  pawnMessage = '';
  pawnConversation = pawnNewConversation();
  // Collector has more to spend; bargain hunters have less.
  if (pawnVisitor.type === 'Collector') {
    currentTrade.budget = floor(currentTrade.budget * 1.5);
    currentTrade.markup *= 1.1;
  }
  if (pawnVisitor.type === 'Bargain') {
    currentTrade.budget = floor(currentTrade.budget * 0.85);
    currentTrade.markup *= 0.93;
  }
  selectedItems = [];
};

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
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(15); text('RELATIONSHIP', 43, 435, 205, 28); };
  fill(115,91,72); rect(43,449,205,14);
  fill(199,139,60);rect(43,449,205*pawnScore()/100,14);
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16); text(pawnScore() + ' / 100', 43, 488); };
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
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16); text('SELLER OFFERS ' + currentTrade.items.length + ' ITEMS', 310, 207); };
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16); text('TOTAL: $' + bundleTotal().toFixed(2), 310, 229); };
    let items = currentTrade.items;
    for (let i=0; i<items.length && i<4; i++) {
      let product = products[items[i]];
      pawnPanel(306,242+i*47,504,44);
      { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16); text(product.name.toUpperCase(), 324, 268+i*47); };
      { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(15); textAlign(RIGHT); text('$' + product.value.toFixed(2), 790, 268 + i * 47); };
    }
    let canBuy = inventory.length + items.length <= bagLimit && money >= bundleTotal();
    pawnButton('BUY ALL',312,489,152,canBuy,color(60,112,67));
  } else {
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(16); text('WANTS: ' + currentTrade.category.toUpperCase(), 310, 207); };
    { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(15); text('BUDGET $'+currentTrade.budget+' | SELECTED $'+selectedTotal().toFixed(2), 310, 229, 480, 28); };
    let entries = availableItems();
    for(let i=0; i<entries.length && i<4; i++) {
      let idx=entries[i];let item=products[inventory[idx].product];
      let y=242+i*47;
      pawnPanel(306,y,504,44);
      let checked=selectedItems.includes(idx);
      { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(14); text((checked?'[X] ':'[ ] ')+item.name.toUpperCase(), 324, y+26); };
      { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(15); textAlign(RIGHT); text('$' + buyerPrice(inventory[idx].product).toFixed(2), 790, y + 26); };
      pawnRows.push({index:idx,x:306,y:y,w:504,h:44});
    }
    if(entries.length===0) { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(14); text('NO MATCHING ITEMS IN BAG', 324, 275); };
    if(entries.length>4) { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(12); text('SHOWING FIRST 4 MATCHING ITEMS', 324, 455); };
    pawnButton('SELL',312,489,152,selectedItems.length>0,color(60,112,67));
  }
  pawnButton('REJECT',651,489,152,true,color(156,63,52));
  { fill(63, 40, 30); textAlign(LEFT); textStyle(NORMAL); textSize(12); text(pawnMessage.substring(0,50), 310, 468); };
}
let pawnOldDraw = draw;
draw = function() {
  pawnOldDraw();
  if(pawnTradeActive()) pawnTradeBoard();
  pawnStartIntroIfNeeded();
  if (pawnIntroType) pawnDrawIntro();
};

// New trade board interactions; all unrelated input still uses existing handler.
let pawnOldMouse = mousePressed;
mousePressed = function() {
  if (pawnIntroType) {
    if (pawnHit(333,381,198,36)) pawnCloseIntro();
    return;
  }
  if(!pawnTradeActive()) {pawnOldMouse();return;}
  if(gamePaused || showBag) {pawnOldMouse();return;}
  // Reject current customer.
  if(pawnHit(651,489,152,36)) {
    pawnChangeScore(-1);
    finishTrade();return;
  }
  if(currentTrade.type==='sell') {
    if(pawnHit(312,489,152,36)) {
      let total=bundleTotal();
      if(inventory.length+currentTrade.items.length>bagLimit){pawnMessage='NOT ENOUGH SPACE';return;}
      if(total>money){pawnMessage='NOT ENOUGH MONEY';return;}
      money-=total;
      for(let idx of currentTrade.items) {
        inventory.push({product:idx,boughtFor:products[idx].value});
        dailyLog.push({type:'BUY',name:products[idx].name,amount:products[idx].value});
      }
      pawnChangeScore(3);finishTrade();return;
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
let pawnOldCompleteSale = completeBuyerSale;
completeBuyerSale = function() {
  pawnOldCompleteSale();pawnChangeScore(3);
};
let pawnOldRestart = restartGame;
restartGame = function() {
  pawnOldRestart();
  pawnRelationship = {Regular:50,Bargain:50,Collector:50,Suspicious:50};
  pawnVisitor=null;pawnMessage='';pawnRows=[];
  pawnIntroSeen={Regular:false,Bargain:false,Collector:false,Suspicious:false};
  pawnIntroType='';pawnIntroPausedGame=false;pawnConversation='';
  pawnUnlockedTypes={Regular:true,Bargain:false,Collector:false,Suspicious:false};
  pawnNewTypeDay=-1;
};
