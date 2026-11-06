// shop background
let shopBg;

// item images
let itemImages = {};

// track which cards have hidden prices
let priceHidden = [false, false, false, false, false, false];

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
let gameState = "start";
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

// the item missing from the inventory record
let missingItem;

// items that have already been asked
let usedItems = [];

// question counter
let questionNumber = 1;
let totalQuestions = 3;

// Player's score
let score = 0;

async function setup() {
    createCanvas(800, 500);

    // Load background
    shopBg = await loadImage("memory images/shop.png");

    // Load item images
    itemImages.Watch = await loadImage("memory images/watch.png");
    itemImages.Phone = await loadImage("memory images/phone.png");
    itemImages.Bread = await loadImage("memory images/bread.png");
    itemImages.Apple = await loadImage("memory images/apple.png");
    itemImages.Hammer = await loadImage("memory images/hammer.png");
    itemImages.Shovel = await loadImage("memory images/shovel.png");

    textFont("Press Start 2P");
}


function draw() {
    background(0);

    // display shop background
    if (shopBg) {
        image(shopBg, 0, 0, width, height);
    }

    // Inspection panel
    pixelBoard(100, 100, 600, 320);

    // title
    textAlign(CENTER);
    fill(65, 40, 25);
    textSize(22);

    // title
    if (gameState === "start") {
        text("INSPECTOR ARRIVED!", width / 2, 185);
    }
    else if (gameState !== "final") {
        text("INSPECTION MEMORY TEST", width / 2, 145);
    }
    

    // start screen
    if (gameState === "start") {

        textSize(14);
        text("Some inventory records are missing!", width / 2, 235);
        text("Help restore the records!", width / 2, 260);  

        fill(70, 115, 65);
        rect(300, 290, 200, 60);

        fill(255);
        textSize(18);
        text("BEGIN TEST", 400, 330);
    }

    // memorize the inventory
    else if (gameState === "memorize") {

        fill(50);
        textSize(12);
        text("Memorize the items and their prices!", width / 2, 170);

        textSize(12);
        text("Click a card to hide or reveal its price.", width / 2, 195);

        // display six item cards
        for (let i = 0; i < items.length; i++) {

            let x = 220 + (i % 3) * 180;
            let y = 255 + floor(i / 3) * 95;

            // card background
            stroke(110, 80, 50);
            strokeWeight(2);
            fill(250, 240, 210);
            rect(x - 65, y - 45, 130, 85, 3);

            noStroke();

            // item image
            image(itemImages[items[i].name], x - 22, y - 42, 44, 44);

            // item name
            fill(50);
            textSize(11);
            text(items[i].name, x, y + 13);

            // show or hide price
            fill(150, 80, 40);
            textSize(14);

            if (priceHidden[i] === false) {
                text("$" + items[i].price, x, y + 32);
            }
            else {
                text("???", x, y + 32);
            }
        }

        // READY button
        fill(70, 115, 65);
        rect(330, 395, 140, 35);

        fill(255);
        textSize(14);
        text("READY", 400, 419);
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
        text("Question " + questionNumber + " / " + totalQuestions, width / 2, 190);

        // show question
        textSize(18);
        if (questionNumber === 1) {

            fill(50);
            textSize(15);
            text("Which item is missing?", width / 2, 215);

            // Display five item images and one missing item
            for (let i = 0; i < items.length; i++) {

                let x = 220 + (i % 3) * 180;
                let y = 270 + floor(i / 3) * 50;

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
            text(questionText, width / 2, 225);
        }
        

        // answer countdown
        fill(50);
        textSize(14);
        if (questionNumber === 1) {
            text("Time left: " + timeLeft, width / 2, 235);
        }
        else {
            text("Time left: " + timeLeft, width / 2, 260);
        }


        
        // display four answer buttons
        for (let i = 0; i < answers.length; i++) {

            let x, y, buttonWidth, buttonHeight;

            if (questionNumber === 1) {
                x = 190 + i * 140;
                y = 350;
                buttonWidth = 110;
                buttonHeight = 45;
            }
            else {
                x = 280 + (i % 2) * 240;
                y = 300 + floor(i / 2) * 58;
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
            if (questionType === "price") {
                textSize(16);
                text("$" + answers[i], x, y + 30);
            }
            else {
                textSize(10);
                text(answers[i], x, y + 30);
            }
        }
    }    

    // correct answer
    else if (gameState === "correct") {

        fill(50, 150, 80);
        textSize(26);
        text("CORRECT!", width / 2, 230);

        fill(50);
        textSize(18);
        text("You got it right!", width / 2, 280);

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
            text("TIME'S UP!", width / 2, 230);
        }
        else {
            text("INCORRECT!", width / 2, 230);
        }

        fill(50);
        textSize(12);
        if (questionType === "price") {
            text("Correct answer: $" + correctAnswer, width / 2, 280);
        }
        else {
            text("Correct answer: " + correctAnswer, width / 2, 280);
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
        text("INSPECTION COMPLETE!", width / 2, 145);

        textSize(22);
        text("Your score: " + score + " / " + totalQuestions, width / 2, 220);

        // pass or fail
        if (score >= 2) {
            fill(50, 150, 80);
            text("YOU PASSED!", width / 2, 280);
        }
        else {
            fill(200, 60, 60);
            text("YOU FAILED!", width / 2, 280);
        }

        // play again button
        fill(70, 115, 65);
        rect(300, 330, 200, 60);

        fill(255);
        textSize(18);
        text("PLAY AGAIN", 400, 370);
    }
}

function mousePressed() {

    // start the game
    if(gameState === "start") {

        if (mouseX > 300 && mouseX < 500 &&
            mouseY > 290 && mouseY < 350) {
            
            // start a new game
            questionNumber = 1;
            score = 0;
            usedItems = [];
            timeOut = false;
            priceHidden = [false, false, false, false, false, false];
            usedQuestionTypes = [];

            // generate new prices
            randomizePrices();

            newQuestion();

            startTime = millis();
            gameState = "memorize";
        }
    }

    else if (gameState === "memorize") {

        // click READY to begin questions
        if (mouseX > 330 && mouseX < 470 &&
            mouseY > 395 && mouseY < 430) {

            questionStartTime = millis();
            gameState = "question";
        }

        // click item cards to hide / reveal prices
        else {
            for (let i = 0; i < items.length; i++) {

                let x = 220 + (i % 3) * 180;
                let y = 255 + floor(i / 3) * 95;

                if (mouseX > x - 65 && mouseX < x + 65 &&
                    mouseY > y - 45 && mouseY < y + 40) {

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
                y = 350;
                buttonWidth = 110;
                buttonHeight = 45;
            }
            else {
                x = 280 + (i % 2) * 240;
                y = 300 + floor(i / 2) * 58;
                buttonWidth = 210;
                buttonHeight = 48;
            }

            if (
                mouseX > x - buttonWidth / 2 &&
                mouseX < x + buttonWidth / 2 &&
                mouseY > y &&
                mouseY < y + buttonHeight
            ) {

                if (answers[i] === correctAnswer) {
                    score++;
                    gameState = "correct";
                }
                else {
                    gameState = "incorrect";
                }

                break;
            }
        }
    }


    // go to the next question
    else if (gameState === "correct" || gameState === "incorrect") {

        if (
            mouseX > 300 && mouseX < 500 &&
            mouseY > 330 && mouseY < 390
        ) {
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
            mouseX > 300 && mouseX < 500 &&
            mouseY > 330 && mouseY < 390
        ) {
            gameState = "start";
        }
    }
}


function newQuestion() {

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

    // Find the highest and lowest prices
    let highestPrice = Math.max(...items.map(item => item.price));
    let lowestPrice = Math.min(...items.map(item => item.price));

    let highestItems = items.filter(item => item.price === highestPrice);
    let lowestItems = items.filter(item => item.price === lowestPrice);

    // Find pairs with the same or different prices
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

    // Build the available question types
    let questionBank = ["price"];

    if (highestItems.length === 1) {
        questionBank.push("highest");
    }

    if (lowestItems.length === 1) {
        questionBank.push("lowest");
    }

    if (matchingPairs.length > 0 && differentPairs.length >= 3) {
        questionBank.push("equal");
    }

    // Avoid repeating a question type
    let availableTypes = questionBank.filter(
        type => !usedQuestionTypes.includes(type)
    );

    // Fallback if no unused type is available
    if (availableTypes.length === 0) {
        availableTypes = questionBank;
    }

    questionType = random(availableTypes);
    usedQuestionTypes.push(questionType);

    // Price memory question
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

    // Highest price question
    else if (questionType === "highest") {

        questionText = "Which item was the most expensive?";
        correctAnswer = highestItems[0].name;

        makeItemAnswers(correctAnswer);
    }

    // Lowest price question
    else if (questionType === "lowest") {

        questionText = "Which item was the cheapest?";
        correctAnswer = lowestItems[0].name;

        makeItemAnswers(correctAnswer);
    }

    // Same price question
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

    shuffle(answers, true);
}

// Generate four item-name choices
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
function randomizePrices() {

    for (let i = 0; i < items.length; i++) {

        items[i].price = floor (random(2, 21)) * 5;
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
