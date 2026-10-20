// Dialogue-only update for The Pawn Shop.
// Load AFTER sketch.js, customer_ui.js and shop_systems.js.
// Does not change trading layout, art, fonts, buttons or trade mechanics.

const naturalCustomerLines = {
  Regular: {
    sell: ["Hey! Mind taking a look at what I've brought?", "I'm clearing out a few things. Interested?", "I thought I'd stop by and see what you'd offer.", "Good to see you! I've brought a few things today.", "Hopefully we can make a deal."],
    category: ["Hi again! Mind if I take a look around?", "I'm hoping to find something useful.", "Let's see what you've got today.", "I thought I'd stop by while I was nearby.", "It's always nice to visit this place."],
    accepted: ["Thanks! That worked out nicely.", "Great, see you next time!", "Pleasure doing business with you.", "That's perfect. Thank you!"],
    rejected: ["No worries. Maybe next time!", "That's all right. I'll come back another day.", "Oh well, thanks anyway.", "Maybe we'll have better luck next time."],
    bargainYes: ["Sure, that sounds fair!", "All right, I can work with that.", "You've got yourself a deal!"],
    bargainNo: ["Sorry, I'd rather stick with my original price.", "Hmm, I don't think that works for me.", "I'd prefer not to go any lower."]
  },
  Bargain: {
    sell: ["I'm hoping we can agree on a good price.", "Let's see how sharp your bargaining skills are.", "I've got a pretty good offer for you today.", "I'm sure we can work something out."],
    category: ["I'm here to see if you've got any good deals.", "I'm keeping a close eye on my budget today.", "I always love finding a bargain.", "Let's see if your prices can impress me."],
    accepted: ["Not bad! I might come back for more.", "All right, we have a deal.", "Now that's more like it!", "A fair deal for both of us, I suppose."],
    rejected: ["Too bad. I'll keep looking.", "Guess we'll have to agree to disagree.", "Maybe we'll find a better deal next time.", "All right, I'll try somewhere else."],
    bargainYes: ["Fine, you drive a hard bargain!", "You got me. Deal!", "All right, but only this once!"],
    bargainNo: ["No thanks. That price doesn't work for me.", "That's a little more than I wanted to spend.", "I'm not budging on this one.", "Nice try, but I'm sticking to my price."]
  },
  Collector: {
    sell: ["I thought this might interest your shop.", "I've decided to part with a few possessions.", "Perhaps you'll appreciate what I've brought.", "Let's see if we can reach an agreement."],
    category: ["I'm curious to see what's new in your shop.", "I do enjoy discovering unexpected treasures.", "Show me what you have to offer today.", "I'm in the mood to browse your collection."],
    accepted: ["Excellent. A pleasure, as always.", "Splendid! I'm quite pleased.", "A satisfactory arrangement.", "Very good. Until next time."],
    rejected: ["A pity. Perhaps another time.", "Very well, I understand.", "That's unfortunate, but no matter.", "I'll return when the timing is better."],
    bargainYes: ["Very well. That seems reasonable.", "I can agree to those terms.", "An interesting proposal. Accepted."],
    bargainNo: ["I'm afraid I must decline.", "I believe my original offer is appropriate.", "I don't think that adjustment is necessary."]
  },
  Suspicious: {
    sell: ["Let's keep this quick, all right?", "I've got something to get off my hands.", "We can make a deal without too many questions.", "I'd appreciate a little discretion."],
    category: ["Just looking. Don't mind me.", "You got anything interesting today?", "Let's keep this between us, okay?", "I'm not staying long."],
    accepted: ["Good. We're done here.", "Nice doing business. Keep it quiet.", "All right. I'll be going now.", "That's settled, then."],
    rejected: ["Suit yourself.", "Your loss, I guess.", "Fine. Forget I was here.", "Whatever. I'll find another buyer."],
    bargainYes: ["Fine. Just make it quick.", "All right, you win.", "Deal. Now let's move on."],
    bargainNo: ["Not a chance.", "That's not happening.", "My price stays where it is.", "You're asking too much."]
  },
  Inspector: {
    sell: ["I'd like to discuss an offer.", "Let's take care of this properly."],
    category: ["I'd like to take a look around.", "Interesting shop you've got here."],
    accepted: ["Thank you for your cooperation."], rejected: ["Understood."],
    bargainYes: ["That seems reasonable."], bargainNo: ["I'll have to decline."]
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
