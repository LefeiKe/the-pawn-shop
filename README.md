# The Pawn Shop

The Pawn Shop is a shop-management game made with **p5.js** for NYU's Interactive Computing course. You start with **$150** and run a small pawn shop: buy items from customers, sell them for a profit, build relationships, and keep enough money for rent.

## How to Play

1. Start the game and open your shop for the day.
2. When a customer arrives, read their offer or request.
3. **Buy** items from sellers if you have enough money and bag space, or **sell** matching items to buyers.
4. Check your bag, relationships, and available upgrades as you play.
5. Review your daily receipt after the shop closes. Plan ahead for weekly rent!

Most menus and trading actions use **mouse clicks**. Use the on-screen pause button to pause or resume the game.

## Features

### Customers and Trading

- 12 named customers with custom sprite-sheet animations and portraits.
- Regular customers, bargain hunters, collectors, and suspicious sellers, with different trading behavior.
- New customer types introduced gradually, with an introduction screen for each type.
- Randomized conversations and responses to trades and bargaining.
- Buying, selling by item category, customer budgets, and warnings for insufficient money or storage.
- Relationship scores that change through interactions; bargaining unlocks at a relationship score of 60.

### Shop Management

- Starting cash of $150 and a limited inventory bag (6 items initially).
- A bag screen showing item name, category, and purchase price.
- A **People** menu for relationship information.
- Five purchasable upgrades, unlocked on Day 3:

| Upgrade | Cost | Effect |
| --- | ---: | --- |
| Price Catalog | $90 | Show original item values while trading |
| Storage +2 | $130 | Increase bag capacity to 8 items |
| Display Shelves | $120 | Earn 5% more on sales |
| Advertising | $100 | Bring customers in more frequently |
| Ordering Hotline | $160 | Order an Apple for $8 when space is available |

### Days, Rent, and Events

- A daily in-game schedule, with each day lasting about 3 real minutes.
- An animated shopkeeper who opens and closes the shop.
- End-of-day receipts listing purchases, sales, rent, and net profit.
- Telephone calls from **Mr. Pennyworth**, the landlord, introducing important events.
- A free first week; rent is due every seven days starting on **Day 14**, beginning at $10 and increasing by 20% each week (rounded to whole dollars).
- An option on rent days to sell selected inventory items to the landlord for 80% of their original value.
- A game-over screen and restart option if the shop runs out of money.

## Mini-Games

### Broken Vase Repair Puzzle
- **Trigger:** Special customers bring broken items to the shop and ask for repairs.
- **Gameplay:** Put the broken pieces together to repair the item.
- **Reward:** If successful, the customer thanks the player and gives them the repaired item as a gift, which can be added to inventory and sold for profit.

### Storage Tetris Puzzle
- **Trigger:** The player wants to purchase an item, but the bag has reached its storage limit.
- **Gameplay:** Complete a Tetris-style puzzle to make room for the new item.
- **Reward:** Winning grants the extra storage space needed to keep the purchased item.

### Inspector Memory Game
- **Trigger:** An inspector visits the shop, and the player chooses to buy from or sell to them.
- **Gameplay:** Flip cards and find matching pairs in a memory game.
- **Risk:** Losing the game results in a negative consequence for the player.

These mini-games are being developed by our team and will introduce additional challenges, rewards, and risks to the main gameplay.

## Built With

- **p5.js** for drawing, animation, mouse and keyboard input, and game logic.
- **JavaScript** with object-oriented classes (`Customer`, `Shopkeeper`, `Product`, and `CustomerProfile`).
- **HTML** to load the sketch and p5.js library.
- Custom character art and sprite sheets, plus pixel-art assets.

## Running the Game

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Open `index.html` with **Live Server** (or another local web server).
4. Play in your browser.

The main game code is in `sketch.js`, and the artwork is in `images/` and the included asset folders. No build step is required.

## Development Notes

The current development version includes a keyboard test panel for jumping to days and testing game events. **Developer Test Mode should be disabled before the final release** by changing `DEV_TEST_MODE` to `false` in `sketch.js`.
