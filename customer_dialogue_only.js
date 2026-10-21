// Dialogue-only update for The Pawn Shop.
// Load AFTER sketch.js, customer_ui.js and shop_systems.js.
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
pawnNewConversation = function() {
  return chooseCustomerLine(currentTrade.type === 'sell' ? 'sell' : 'category');
};

// Handle bargaining outcomes after the original bargaining calculation.
let originalShopBargain = shopTryBargain;
shopTryBargain = function() {
  let before = shopBargained;
  let oldScore = pawnScore();
  originalShopBargain();
  if (!before && shopBargained) {
    let succeeded = pawnScore() > oldScore;
    pawnConversation = chooseCustomerLine(succeeded ? 'bargainYes' : 'bargainNo');
    // Preserve the text panel layout; use its existing message line for status only.
    pawnMessage = succeeded ? 'BARGAIN ACCEPTED' : 'BARGAIN REJECTED';
  }
};

// Show one brief, customer-only parting remark over the *existing* shop scene.
let originalFinishCustomerTrade = finishTrade;
finishTrade = function() {
  if (pawnVisitor) {
    customerReaction = chooseCustomerLine(customerDialogueOutcome);
    customerReactionUntil = millis() + 2200;
  }
  customerDialogueOutcome = 'rejected';
  originalFinishCustomerTrade();
};

// Detect completed sales without replacing the existing money/inventory logic.
let originalCompleteCustomerSale = completeBuyerSale;
completeBuyerSale = function() {
  customerDialogueOutcome = 'accepted';
  originalCompleteCustomerSale();
};

// Observe the previous game actions so successful purchase has a parting line.
let originalDialogueMouse = mousePressed;
mousePressed = function() {
  let active = pawnTradeActive() && !gamePaused && !showBag && !pawnIntroType && shopMenu === '';
  let buyingFromCustomer = active && currentTrade.type === 'sell';
  let payButton = buyingFromCustomer && pawnHit(312, 489, 152, 36);
  let eligible = payButton && money >= bundleTotal() &&
    inventory.length + currentTrade.items.length <= shopCapacity();
  if (eligible) customerDialogueOutcome = 'accepted';
  originalDialogueMouse();
  // If transaction did not actually end, discard speculative outcome.
  if (eligible && customerState === 'waiting') customerDialogueOutcome = 'rejected';
};

let originalDialogueDraw = draw;
draw = function() {
  originalDialogueDraw();
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
};

let originalDialogueRestart = restartGame;
restartGame = function() {
  originalDialogueRestart();
  lastCustomerDialogue = '';
  customerReaction = '';
  customerReactionUntil = 0;
  customerDialogueOutcome = 'rejected';
};
