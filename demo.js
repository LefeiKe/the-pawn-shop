/*
 * Optional presentation controls (?demo=1).
 * Developer-mode implementation workshopped with ChatGPT on 11/09/2026.
 */
(function () {
  if (new URLSearchParams(location.search).get("demo") !== "1") return;

  const css = document.createElement("style");
  css.textContent = "#demo-panel{position:fixed;right:12px;top:12px;z-index:10000;width:242px;max-height:calc(100vh - 24px);overflow:auto;box-sizing:border-box;padding:12px;background:#21150f;border:3px solid #d3a45f;color:#f4d69f;font:16px 'Pixelify Sans',monospace;text-align:left;box-shadow:0 4px 18px #000a}" +
    "#demo-panel h2{margin:0 0 5px;color:#f6cb72;font-size:21px}#demo-panel h3{margin:12px 0 4px;border-top:1px solid #775635;padding-top:6px;font-size:17px}" +
    "#demo-panel button,#demo-panel select{width:100%;margin:3px 0;padding:6px;background:#634127;color:#fff0cc;border:2px solid #b8874d;font:15px 'Pixelify Sans',monospace;cursor:pointer}" +
    "#demo-panel button:hover{background:#926238}#demo-panel select{background:#302015}#demo-panel p{font-size:13px;margin:5px 0}" +
    "#demo-panel.collapsed{width:auto;max-height:45px;overflow:hidden}#demo-panel.collapsed #demo-body{display:none}" +
    "#demo-panel #demo-collapse{width:auto;float:right;margin:0;padding:2px 6px}#demo-status{color:#a7e5a1;min-height:32px}";
  document.head.appendChild(css);

  const panel = document.createElement("aside");
  panel.id = "demo-panel";
  panel.innerHTML =
    '<button id="demo-collapse" aria-label="Collapse demo controls">−</button><h2>DEMO MODE</h2><div id="demo-body">' +
    '<p>Presentation only. Normal gameplay is unchanged.</p>' +
    '<button data-action="reset">Fresh demo shop</button><button data-action="money">Add $5,000</button>' +
    '<h3>Day jump</h3><select id="demo-day">' +
    '<option value="1">Day 1 — tutorial</option><option value="2">Day 2</option><option value="3">Day 3</option>' +
    '<option value="4">Day 4</option><option value="5">Day 5</option><option value="7">Day 7</option>' +
    '<option value="14">Day 14</option><option value="28">Day 28</option></select>' +
    '<button data-action="day">Jump to day</button>' +
    '<h3>Customers</h3><select id="demo-customer">' +
    '<option value="Regular">Pals of Pat’s</option><option value="Bargain">Penny Pinchers</option>' +
    '<option value="Suspicious">Precarious Purveyors</option><option value="Collector">Posh Patrons</option>' +
    '<option value="Wholesaler">Pallet Peddlers</option></select>' +
    '<button data-action="customer">Show customer & trade</button>' +
    '<h3>Shop systems</h3><button data-action="upgrades">Open upgrades</button>' +
    '<button data-action="unlock">Unlock all upgrades</button><button data-action="bag">Fill & open bag</button>' +
    '<button data-action="supplier">Supplier phone</button><button data-action="reputation">Reputation board</button><button data-action="pat">Pat’s upgrade call</button><button data-action="rent">Weekly rent reveal</button><button data-action="receipt">Daily receipt</button>' +
    '<h3>Challenges</h3><button data-action="inspector">Inspector intro</button>' +
    '<button data-action="memory">Memory mini-game</button><select id="demo-grade"><option value="5">Inspector grade A</option><option value="4">Inspector grade B</option><option value="2">Inspector grade C</option></select><button data-action="grade">Show selected grade</button><button data-action="tetrisIntro">Tetris introduction</button><button data-action="tetris">Storage Tetris directly</button>' +
    '<button data-action="posh">Posh Patron offer</button><button data-action="vase">Vase puzzle</button>' +
    '<h3>Endings</h3><select id="demo-ending">' +
    '<option value="owner">The New Owner</option><option value="trusted">A Trusted Successor</option>' +
    '<option value="promising">A Promising Start</option><option value="quiet">The Quiet Shop</option>' +
    '<option value="closed">Shop Closed</option></select><button data-action="ending">Show ending</button>' +
    '<p id="demo-status" role="status">Wait for game assets to load.</p></div>';
  document.body.appendChild(panel);
  for (const eventName of ["pointerdown", "mousedown", "mouseup", "click", "touchstart"]) {
    panel.addEventListener(eventName, event => event.stopPropagation());
  }
  panel.querySelector("#demo-collapse").addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    panel.querySelector("#demo-collapse").textContent = panel.classList.contains("collapsed") ? "+" : "−";
  });
  const status = text => { panel.querySelector("#demo-status").textContent = text; };

  function ready() {
    if (!pawnReady || !shopkeeperActor) {
      status("Assets still loading. Try again in a moment.");
      return false;
    }
    return true;
  }

  // Clear modal state while leaving the shop usable for the next demonstration.
  function prepare() {
    if (gamePaused) togglePause();
    showIntro = false; welcomeCallCompleted = true;
    phoneSeen.hello = true; phoneSeen.upgrades = true; phoneSeen.rentReveal = true;
    phonePending = ""; phoneCall = ""; phoneSavedPause = false; stopPhoneRing();
    stopTypingSound();
    showReceipt = false; showBag = false; showBudgetWarning = false;
    gameOver = false; closing = false; bankruptcyNotice = false;
    shopMenu = ""; shopMenuPaused = false;
    pawnIntroType = ""; pawnIntroPausedGame = false;
    poshOfferActive = false; poshGamePending = false; poshOfferPausedShop = false;
    poshGamePausedShop = false; poshGameResult = null;
    tetrisPromptActive = false; tetrisAcceptPurchase = null; tetrisPurchase = null;
    tetrisPausedShop = false; inspectorPhase = ""; inspectorActor = null;
    inspectorNoticePausedGame = false;
    for (const pair of [[poshGameOverlay,poshGameFrame],[memoryGameOverlay,memoryGameFrame],[tetrisOverlay,tetrisFrame]]) {
      if (pair[0]) pair[0].hidden = true;
      if (pair[1]) pair[1].src = "";
    }
    currentCustomer = new Customer("", "", null, null);
    currentCustomer.state = "gone";
    pawnVisitor = null; currentTrade = undefined;
    dayStarted = true; shopkeeperActor.state = "working";
    shopkeeperActor.x = shopkeeperRoute[shopkeeperRoute.length - 1].x;
    shopkeeperActor.y = shopkeeperRoute[shopkeeperRoute.length - 1].y;
    customersLeft = 5; nextArrival = millis() + 600000;
    unlockShopAudio();
  }

  function showCustomer(type) {
    prepare();
    dayNumber = Math.max(6, dayNumber);
    for (const key of Object.keys(pawnUnlockedTypes)) pawnUnlockedTypes[key] = true;
    if (type !== "Regular") pawnIntroSeen[type] = false;
    generateCustomer(type);
    const counter = customerRoute[4];
    currentCustomer.x = counter.x; currentCustomer.y = counter.y;
    currentCustomer.routeIndex = 4; currentCustomer.state = "waiting";
    pawnStartIntroIfNeeded();
    if (type === "Regular") playNewBoardSound();
    status("Showing " + type + " trade and its real controls.");
  }

  function showEnding(kind) {
    prepare();
    dayNumber = 28; money = 1200; totalSalesEarned = 1500;
    priceCatalogOwned = false; shelvesLevel = 0; advertisingLevel = 0;
    wealthyClienteleLevel = 0; supplierOwned = [false,false,false];
    if (kind === "owner") {
      priceCatalogOwned = true; shelvesLevel = 3; advertisingLevel = 3;
      wealthyClienteleLevel = 2; totalSalesEarned = 8000; money = 6000;
    } else if (kind === "trusted") {
      shelvesLevel = 2; advertisingLevel = 2; wealthyClienteleLevel = 1;
      totalSalesEarned = 3000;
    } else if (kind === "quiet") {
      totalSalesEarned = 400; money = 200;
    } else if (kind === "closed") money = -50;
    else { shelvesLevel = 2; advertisingLevel = 1; }
    finishGame(chooseFinalEnding());
    status("Showing " + ending.achievement + ".");
  }

  // Trigger the normal shop-opening transition when presenting another day.
  function startDemoDay(day) {
    prepare();
    dayNumber = day;
    tutorialTradesServed = 0;
    tutorialBagSeen = false;
    phonePaidToday = false;
    phoneSeen.hello = day !== 1;
    phoneSeen.upgrades = day !== 3;
    welcomeCallCompleted = day !== 1;
    for (const [unlockDay, type] of Object.entries(pawnTypeSchedule)) {
      pawnUnlockedTypes[type] = day > Number(unlockDay);
    }
    for (const type of Object.values(pawnTypeSchedule)) pawnIntroSeen[type] = false;
    dayStarted = false;
    closing = false;
    dailyLog = [];
    nextMorning = 0;
    nextArrival = 0;
    shopkeeperActor.routeIndex = shopkeeperRoute.length - 1;
    shopkeeperActor.x = shopkeeperRoute[shopkeeperActor.routeIndex].x;
    shopkeeperActor.y = shopkeeperRoute[shopkeeperActor.routeIndex].y;
    shopkeeperActor.state = "entering";
  }

  const actions = {
    reset() { restartGame(); startDemoDay(1); status("Fresh demonstration shop, starting Day 1."); },
    money() { prepare(); money += 5000; status("Balance: $" + money.toFixed(2)); },
    day() {
      const day = Number(panel.querySelector("#demo-day").value);
      startDemoDay(day);
      status("Starting Day " + day + ": customers and scheduled calls are active.");
    },
    customer() { showCustomer(panel.querySelector("#demo-customer").value); },
    upgrades() {
      prepare(); dayNumber = Math.max(3, dayNumber); money = Math.max(5000, money);
      shopOpenMenu("upgrades"); status("Upgrades open with enough money.");
    },
    unlock() {
      prepare(); priceCatalogOwned = true; shelvesLevel = 3;
      advertisingLevel = 3; wealthyClienteleLevel = 3;
      supplierOwned = [true,true,true]; money = Math.max(5000, money);
      status("All upgrades unlocked.");
    },
    bag() {
      prepare();
      if (!inventory.length) for (const id of [0,1,4,5,8])
        inventory.push({product:id,boughtFor:products[id].value});
      showBag = true; status("Inventory bag opened.");
    },
    supplier() {
      prepare(); supplierOwned = [true,true,true];
      phoneCall = "suppliers"; status("Supplier ordering phone opened.");
    },
    reputation() {
      prepare(); shopOpenMenu("people"); status("Reputation board opened.");
    },
    pat() {
      prepare(); dayNumber = Math.max(3, dayNumber);
      phoneCall = "upgrades"; playPatVoice();
      status("Pat introduces the shop upgrades.");
    },
    rent() {
      prepare(); dayNumber = 7; phoneCall = "rentReveal"; playPatVoice();
      status("Pat introduces the weekly rent challenge.");
    },
    receipt() {
      prepare();
      if (!dailyLog.length) {
        dailyLog.push({type:"BUY",name:products[0].name,amount:products[0].value});
        dailyLog.push({type:"SELL",name:products[1].name,amount:products[1].value*1.2});
      }
      showReceipt = true; status("End-of-day receipt opened.");
    },
    inspector() {
      prepare(); dayNumber = Math.max(3, dayNumber);
      inspectorActor = new Customer("Alex","Inspector",pawnSprites.Alex,pawnPortraits.Alex);
      inspectorActor.state = "waiting"; inspectorPhase = "intro";
      inspectorHasIntroduced = false; inspectorNoticePausedGame = true;
      togglePause(); playNewBoardSound();
      status("Click BEGIN INSPECTION in the shop.");
    },
    memory() {
      prepare();
      inspectorActor = new Customer("Alex","Inspector",pawnSprites.Alex,pawnPortraits.Alex);
      inspectorActor.state = "waiting"; inspectorPhase = "awaiting"; showMemoryGame();
      status("Memory game opened; grade returns to the shop.");
    },
    grade() {
      prepare();
      inspectorActor = new Customer("Alex","Inspector",pawnSprites.Alex,pawnPortraits.Alex);
      inspectorActor.state = "waiting"; inspectorPhase = "awaiting";
      inspectorNoticePausedGame = true; togglePause();
      recordInspectionResult(Number(panel.querySelector("#demo-grade").value));
      status("Inspection grade " + latestInspectionGrade + " revealed.");
    },
    tetrisIntro() {
      prepare(); tetrisIntroduced = false;
      const entries = [0,1,4,5].map(id => ({product:id,boughtFor:products[id].value}));
      requestStorageChallenge("customer", () => startStorageOverflow(entries,"customer"));
      status("Pat introduces the storage challenge. Select LET’S GO.");
    },
    tetris() {
      prepare();
      const entries = [0,1,4,5].map(id => ({product:id,boughtFor:products[id].value}));
      startStorageOverflow(entries,"customer");
      status("Storage Tetris opened.");
    },
    posh() {
      showCustomer("Collector");
      if (pawnIntroType) pawnCloseIntro();
      showPoshOffer();
      status("Posh Patron offer opened.");
    },
    vase() {
      showCustomer("Collector");
      if (pawnIntroType) pawnCloseIntro();
      poshGamePending = true; showPoshGame();
      status("Vase puzzle opened.");
    },
    ending() { showEnding(panel.querySelector("#demo-ending").value); }
  };
  panel.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button || !ready()) return;
    try { actions[button.dataset.action](); }
    catch (error) { status("Shortcut error: " + error.message); console.error(error); }
  });
})();