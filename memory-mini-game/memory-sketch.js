/*
 * Pixel Pat's Pawns and Parcels — Inspection Memory Game
 * Authors: Lefei Ke (lk3104), Margot Anderson ([NetID]),
 *          Shuangran Zhao ([NetID]), Abdullah Noor ([NetID])
 * Submission Date: November 9, 2026
 * Description: Memorize displayed merchandise prices and answer
 * five questions to receive an inspection grade.
 * Controls: Mouse to flip memory cards and select answers.
 */

// shop background
let shopBg;
const MEMORY_OFFSET_X = 32;
const MEMORY_OFFSET_Y = 38;

// item images
let itemImages = {};

// track which cards have hidden prices
let priceHidden = [false, false, false, false, false, false];

// card flip animation progress (0 = front, 1 = back)
let cardFlip = [0, 0, 0, 0, 0, 0];

// animation speed
let flipSpeed = 0.08;

// four answer choices
let answers = [];

// item information
let items = [
    { name: "Watch", price: 35 },
    { name: "Phone", price: 60 },
    { name: "Bread", price: 15 },
    { name: "Apple", price: 10 },
    { name: "Hammer", price: 40 },
    { name: "Shovel", price: 30 }
];

// game states and timer
let gameState = "loading";
let startTime = 0;
let questionStartTime = 0;
let answerTime = 20;

let timeOut = false;

// randomly selected item
let questionItem;

// random question bank
let questionType = "";
let questionText = "";
let correctAnswer;
let usedQuestionTypes = [];

// question types selected for each round
let questionPlan = [];

// the item missing from the inventory record
let missingItem;

// items that have already been asked
let usedItems = [];

// question counter
let questionNumber = 1;
let totalQuestions = 5;

// Player's score
let score = 0;

async function setup() {
    createCanvas(864, 576);

    // Load background
    shopBg = await loadImage("../images/shop.png");

    // Load item images
    itemImages.Watch = await loadImage("memory images/watch.png");
    itemImages.Phone = await loadImage("memory images/phone.png");
    itemImages.Bread = await loadImage("memory images/bread.png");
    itemImages.Apple = await loadImage("memory images/apple.png");
    itemImages.Hammer = await loadImage("memory images/hammer.png");
    itemImages.Shovel = await loadImage("memory images/shovel.png");

    textFont("Pixelify Sans");
    beginMemoryInspection();
}


function beginMemoryInspection() {
    questionNumber = 1;
    score = 0;
    usedItems = [];
    timeOut = false;
    priceHidden = [false, false, false, false, false, false];
    cardFlip = [0, 0, 0, 0, 0, 0];
    usedQuestionTypes = [];

    randomizePrices();
    generateQuestionPlan();
    newQuestion();

    startTime = millis();
    gameState = "memorize";
}

function draw() {
    background(0);

    // display shop background
    if (shopBg) {
        image(shopBg, 0, 0, width, height);
    }

    // Match the main shop start screen dimming (180 / 255 opacity).
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    // Keep the original 800 x 500 game interface centered in 864 x 576.
    push();
    translate(MEMORY_OFFSET_X, MEMORY_OFFSET_Y);

    // Inspection panel
    pixelBoard(70, 50, 660, 430);

    // title
    textAlign(CENTER);
    fill(65, 40, 25);
    textSize(22);

    if (gameState !== "final") {
        text("INSPECTION MEMORY TEST", 400, 110);
    }

    // Begin on the memory cards; Alex already introduced the inspection.
    if (gameState === "memorize") {


        fill(50);
        textSize(14);
        text("Let's see how familiar you are with your merchandise!", 400, 150);

        textSize(14);
        text("Click a card to hide or reveal its price.", 400, 178);

        // display six flipping item cards
        for (let i = 0; i < items.length; i++) {

            let x = 220 + (i % 3) * 180;
            let y = 245 + floor(i / 3) * 95;

            // target: front = 0, back = 1
            let target = priceHidden[i] ? 1 : 0;

            // animate toward the target
            if (cardFlip[i] < target) {
                cardFlip[i] = min(cardFlip[i] + flipSpeed, target);
            }
            else if (cardFlip[i] > target) {
                cardFlip[i] = max(cardFlip[i] - flipSpeed, target);
            }

            // card becomes narrow, then expands
            let cardScale = abs(cos(cardFlip[i] * PI));

            push();

            translate(x, y);
            scale(cardScale, 1);

            // card background
            stroke(110, 80, 50);
            strokeWeight(2);

            if (cardFlip[i] < 0.5) {
                fill(250, 240, 210);
            }
            else {
                fill(225, 205, 165);
            }

            rect(-65, -45, 130, 85, 3);

            noStroke();

            // front: image, name, and price
            if (cardFlip[i] < 0.5) {

                image(itemImages[items[i].name], -22, -42, 44, 44);

                fill(50);
                textSize(14);
                text(items[i].name, 0, 13);

                fill(150, 80, 40);
                textSize(14);
                text("$" + items[i].price, 0, 32);
            }

            // back: image only
            else {

                image(itemImages[items[i].name], -30, -30, 60, 60);
            }

            pop();
        }

        // READY button
        fill(70, 115, 65);
        rect(330, 415, 140, 40);

        fill(255);
        textSize(14);
        text("READY", 400, 442);
    }

    // ask memory questions
    else if (gameState === "question") {

        fill(50);

        let timeLeft = answerTime - floor((millis() - questionStartTime) / 1000);

        if (timeLeft <= 0) {
            timeOut = true;
            gameState = "incorrect";
        }

        // show question number
        fill(50);
        textSize(18);
        text("Question " + questionNumber + " / " + totalQuestions, 400, 150);

        // show question
        textSize(18);
        if (questionNumber === 1) {

            fill(50);
            textSize(18);
            text("Which item is missing?", 400, 188);

            // Display five item images and one missing item
            for (let i = 0; i < items.length; i++) {

                let x = 220 + (i % 3) * 180;
                let y = 295 + floor(i / 3) * 55;

                // Card background
                stroke(110, 80, 50);
                strokeWeight(2);
                fill(250, 240, 210);
                rect(x - 55, y - 23, 110, 43, 3);

                noStroke();

                if (items[i].name === missingItem.name) {

                    // Missing item
                    fill(150, 80, 40);
                    textSize(26);
                    text("?", x, y + 9);
                }
                else {

                    // Show item image
                    image(itemImages[items[i].name],
                        x - 18, y - 19, 36, 36);
                }
            }
        }
        else {
            fill(50);
            textSize(18);
            textAlign(CENTER, CENTER);
            text(questionText, 120, 185, 560, 55);
            textAlign(CENTER, BASELINE);
        }
        

        // answer countdown
        fill(50);
        textSize(18);
        if (questionNumber === 1) {
            text("Time left: " + timeLeft, 400, 245);
        }
        else {
            text("Time left: " + timeLeft, 400, 272);
        }


        
        // display four answer buttons
        for (let i = 0; i < answers.length; i++) {

            let x, y, buttonWidth, buttonHeight;

            if (questionNumber === 1) {
                x = 190 + i * 140;
                y = 410;
                buttonWidth = 110;
                buttonHeight = 44;
            }
            else {
                x = 280 + (i % 2) * 240;
                y = 320 + floor(i / 2) * 64;
                buttonWidth = 210;
                buttonHeight = 48;
            }

            // Button background
            fill(250, 240, 210);
            stroke(110, 80, 50);
            strokeWeight(2);

            rect(x - buttonWidth / 2, y,
                buttonWidth, buttonHeight, 3);

            noStroke();
            fill(30);

            // Display answer
            if (questionType === "price" || questionType === "difference") {
                textSize(16);
                text("$" + answers[i], x, y + 30);
            }
            else {
                textSize(14);
                textAlign(CENTER, CENTER);
                text(String(answers[i]), x - buttonWidth / 2 + 6,
                    y + 4, buttonWidth - 12, buttonHeight - 8);
                textAlign(CENTER, BASELINE);
            }
        }
    }    

    // correct answer
    else if (gameState === "correct") {

        fill(50, 150, 80);
        textSize(26);
        text("CORRECT!", 400, 230);

        fill(50);
        textSize(20);
        text("You got it right!", 400, 280);

        // restart button
        fill(70, 115, 65);
        rect(300, 330, 200, 60);

        fill(255);
        textSize(24);

        // show FINISH on the last question
        if (questionNumber === totalQuestions) {
            text("FINISH", 400, 370);
        }
        else {
            text("NEXT", 400, 370);
        }
        
    }

    // incorrect answer
    else if (gameState === "incorrect"){

        fill(200, 60, 60);
        textSize(26);
        if (timeOut) {
            text("TIME'S UP!", 400, 230);
        }
        else {
            text("INCORRECT!", 400, 230);
        }

        fill(50);
        textSize(18);
        if (questionType === "price" || questionType === "difference") {
            text("Correct answer: $" + correctAnswer, 400, 280);
        }
        else {
            text("Correct answer: " + correctAnswer, 400, 280);
        }

        // restart button
        fill(70, 115, 65);
        rect(300, 330, 200, 60);

        fill(255);
        textSize(20);
        
        // show FINISH on the last question
        if (questionNumber === totalQuestions) {
            text("FINISH", 400, 370);
        }
        else {
            text("NEXT", 400, 370);
        }
    }

    
    // final result screen
    else if (gameState === "final") {

        fill(50);
        textSize(24);
        text("INSPECTION COMPLETE!", 400, 160);

        textSize(24);
        text("Your score: " + score + " / " + totalQuestions, 400, 260);

        // return to shop button
        fill(70, 115, 65);
        rect(280, 330, 240, 60);

        fill(255);
        textSize(16);
        text("RETURN TO SHOP", 400, 370);
    }
    pop();
}

// Correct-answer cash sound and incorrect-answer click behavior
// integrated with ChatGPT on 11/08/2026.
function mousePressed() {
    const localMouseX = mouseX - MEMORY_OFFSET_X;
    const localMouseY = mouseY - MEMORY_OFFSET_Y;

    if (gameState === "memorize") {

        // click READY to begin questions
        if (localMouseX > 330 && localMouseX < 470 &&
            localMouseY > 415 && localMouseY < 455) {

            playMiniClick();
            questionStartTime = millis();
            gameState = "question";
        }

        // click item cards to hide / reveal prices
        else {
            for (let i = 0; i < items.length; i++) {

                let x = 220 + (i % 3) * 180;
                let y = 245 + floor(i / 3) * 95;

                if (localMouseX > x - 65 && localMouseX < x + 65 &&
                    localMouseY > y - 45 && localMouseY < y + 40) {

                    playMiniClick();
                    priceHidden[i] = !priceHidden[i];
                }
            }
        }
    }

    
    // Check the selected answer
    else if (gameState === "question") {

        for (let i = 0; i < answers.length; i++) {

            let x, y, buttonWidth, buttonHeight;

            if (questionNumber === 1) {
                x = 190 + i * 140;
                y = 410;
                buttonWidth = 110;
                buttonHeight = 44;
            }
            else {
                x = 280 + (i % 2) * 240;
                y = 320 + floor(i / 2) * 64;
                buttonWidth = 210;
                buttonHeight = 48;
            }

            if (
                localMouseX > x - buttonWidth / 2 &&
                localMouseX < x + buttonWidth / 2 &&
                localMouseY > y &&
                localMouseY < y + buttonHeight
            ) {

                if (answers[i] === correctAnswer) {
                    playMiniCash();
                    score++;
                    gameState = "correct";
                }
                else {
                    playMiniClick();
                    gameState = "incorrect";
                }

                break;
            }
        }
    }


    // go to the next question
    else if (gameState === "correct" || gameState === "incorrect") {

        if (
            localMouseX > 300 && localMouseX < 500 &&
            localMouseY > 330 && localMouseY < 390
        ) {
            playMiniClick();
            questionNumber++;

            if (questionNumber <= totalQuestions) {
                newQuestion();
                timeOut = false;
                questionStartTime = millis();
                gameState = "question";
            }
            else {
                gameState = "final";
            }
        }
    }

    // play again or retry after failure
    else if (gameState === "final") {

        if (
            localMouseX > 280 && localMouseX < 520 &&
            localMouseY > 330 && localMouseY < 390
        ) {

            let rating;

            if (score === 5) {
                rating = "A";
            }
            else if (score >= 3) {
                rating = "B";
            }
            else {
                rating = "C";
            }

            // Send the result to the main game
            playMiniClick();
            window.parent.postMessage({
                type: "memoryGameComplete",
                score: score,
                rating: rating
            }, window.location.origin);
        }
    }
}


// generate five question types for each round
// Build a balanced five-question sequence from the current displayed prices.
function generateQuestionPlan() {

    // Q1 is always the missing item question
    questionPlan = ["missing"];

    // find the highest and lowest prices
    let prices = items.map(item => item.price);

    let highestPrice = Math.max(...prices);
    let lowestPrice = Math.min(...prices);

    let highestItems = items.filter(
        item => item.price === highestPrice
    );

    let lowestItems = items.filter(
        item => item.price === lowestPrice
    );

    // find items with the second highest distinct price
    let sortedPrices = [...new Set(prices)].sort((a, b) => b - a);

    let secondHighestItems = [];

    if (sortedPrices.length >= 2) {
        secondHighestItems = items.filter(
            item => item.price === sortedPrices[1]
        );
    }

    // find matching price pairs
    let matchingPairs = [];

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {

            if (items[i].price === items[j].price) {
                matchingPairs.push([items[i], items[j]]);
            }
        }
    }

    // available question types
    let questionBank = [
        "price",
        "comparison",
        "difference"
    ];

    if (highestItems.length === 1) {
        questionBank.push("highest");
    }

    if (lowestItems.length === 1) {
        questionBank.push("lowest");
    }

    if (secondHighestItems.length === 1) {
        questionBank.push("order");
    }

    if (matchingPairs.length > 0) {
        questionBank.push("equal");
    }

    // price Match requires exactly two items sharing a price
    let validMatch = items.some(item =>
        items.filter(other => other.price === item.price).length === 2
    );

    if (validMatch) {
        questionBank.push("match");
    }

    // randomize question order
    shuffle(questionBank, true);

    // select four additional question types
    for (let type of questionBank) {

        if (questionPlan.length >= totalQuestions) {
            break;
        }

        // avoid using Equal and Match in the same round
        if (type === "equal" && questionPlan.includes("match")) {
            continue;
        }

        if (type === "match" && questionPlan.includes("equal")) {
            continue;
        }

        questionPlan.push(type);
    }
}


// Prepare one question and four distinct choices with the answer included.
function newQuestion() {

    questionType = questionPlan[questionNumber - 1];

    // Q1: Missing item
    if (questionNumber === 1) {

        questionType = "missing";
        missingItem = random(items);
        questionItem = missingItem;

        correctAnswer = missingItem.name;
        answers = [correctAnswer];

        while (answers.length < 4) {
            let name = random(items).name;

            if (!answers.includes(name)) {
                answers.push(name);
            }
        }

        shuffle(answers, true);
        return;
    }

    // find the highest and lowest prices
    let highestPrice = Math.max(...items.map(item => item.price));
    let lowestPrice = Math.min(...items.map(item => item.price));

    let highestItems = items.filter(item => item.price === highestPrice);
    let lowestItems = items.filter(item => item.price === lowestPrice);

    // find pairs with the same or different prices
    let matchingPairs = [];
    let differentPairs = [];

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {

            let pair = items[i].name + " & " + items[j].name;

            if (items[i].price === items[j].price) {
                matchingPairs.push(pair);
            }
            else {
                differentPairs.push(pair);
            }
        }
    }

    // price memory question
    if (questionType === "price") {

        questionItem = random(items);
        questionText = "How much was the " + questionItem.name + "?";

        correctAnswer = questionItem.price;
        answers = [correctAnswer];

        while (answers.length < 4) {

            let price = floor(random(2, 21)) * 5;

            if (!answers.includes(price)) {
                answers.push(price);
            }
        }
    }

    // highest price question
    else if (questionType === "highest") {

        questionText = "Which item was the most expensive?";
        correctAnswer = highestItems[0].name;

        makeItemAnswers(correctAnswer);
    }

    // lowest price question
    else if (questionType === "lowest") {

        questionText = "Which item was the cheapest?";
        correctAnswer = lowestItems[0].name;

        makeItemAnswers(correctAnswer);
    }

    // same price question
    else if (questionType === "equal") {

        questionText = "Which two items had the same price?";
        correctAnswer = random(matchingPairs);

        answers = [correctAnswer];

        while (answers.length < 4) {

            let pair = random(differentPairs);

            if (!answers.includes(pair)) {
                answers.push(pair);
            }
        }
    }

    // price comparison question
    else if (questionType === "comparison") {

        // find two items with different prices
        let item1 = random(items);
        let item2 = random(items);

        while (item1.price === item2.price) {
            item2 = random(items);
        }

        questionText = "Which cost more: " + item1.name + " or " + item2.name + "?";

        // find the more expensive item
        if (item1.price > item2.price) {
            correctAnswer = item1.name;
        }
        else {
            correctAnswer = item2.name;
        }

        // include both compared items in the choices
        answers = [item1.name, item2.name];

        while (answers.length < 4) {
            let name = random(items).name;

            if (!answers.includes(name)) {
                answers.push(name);
            }
        }
    }

    // price order question
    else if (questionType === "order") {

        // Sort unique prices from highest to lowest
        let sortedPrices = [...new Set(items.map(item => item.price))]
            .sort((a, b) => b - a);

        let secondPrice = sortedPrices[1];

        let secondItems = items.filter(
            item => item.price === secondPrice
        );

        questionText = "Which item had the second highest price?";

        correctAnswer = secondItems[0].name;

        makeItemAnswers(correctAnswer);
    }

    // price match question
    else if (questionType === "match") {

        // find items that have exactly one price match
        let validItems = items.filter(item => {

            let samePriceItems = items.filter(
                other => other.price === item.price
            );

            return samePriceItems.length === 2;
        });

        questionItem = random(validItems);

        // find the other item with the same price
        let matchingItem = items.find(
            item =>
                item.price === questionItem.price &&
                item.name !== questionItem.name
        );

        questionText = "Which item matched " + questionItem.name + "'s price?";

        correctAnswer = matchingItem.name;

        answers = [correctAnswer];

        while (answers.length < 4) {
            let name = random(items).name;

            if (!answers.includes(name) && name !== questionItem.name) {
                answers.push(name);
            }
        }
    }

    // price difference question
    else if (questionType === "difference") {

        let item1 = random(items);
        let item2 = random(items);

        while (item1.price === item2.price) {
            item2 = random(items);
        }

        questionText = "Price difference: " + item1.name + " & " + item2.name + "?";

        correctAnswer = abs(item1.price - item2.price);

        answers = [correctAnswer];

        // generate three incorrect prices
        while (answers.length < 4) {

            let difference = floor(random(1, 20)) * 5;

            if (!answers.includes(difference)) {
                answers.push(difference);
            }
        }
    }



    shuffle(answers, true);
}

// generate four item-name choices
function makeItemAnswers(correctName) {

    answers = [correctName];

    while (answers.length < 4) {

        let name = random(items).name;

        if (!answers.includes(name)) {
            answers.push(name);
        }
    }
}


// generate random prices for all items
// Assign round-specific prices while guaranteeing useful comparisons.
function randomizePrices() {

    for (let i = 0; i < items.length; i++) {
        items[i].price = floor(random(2, 21)) * 5;
    }
    // Comparisons and differences require at least two distinct prices.
    if (items.every(item => item.price === items[0].price)) {
        items[items.length - 1].price = items[0].price === 100 ? 95 : items[0].price + 5;
    }
}

// pixel-art panel (same style as main game)
function pixelBoard(x, y, w, h) {
    noStroke();

    fill(65, 40, 28);
    rect(x, y, w, h);

    fill(145, 91, 51);
    rect(x + 4, y + 4, w - 8, h - 8);

    fill(221, 191, 143);
    rect(x + 9, y + 9, w - 18, h - 18);
}
