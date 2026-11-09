# The Pawn Shop

**The Pawn Shop** is a pixel-art shop-management game built with **p5.js** for NYU's Interactive Computing course. Take over the counter for 28 days, starting with **$150**. Buy low, sell high, build a reputation around town, expand your business, and keep up with the rent. Pixel Pat, the shop's longtime owner, is there to guide you.

## Play

1. Open the shop and serve the day's customers. The shop closes after the customer quota is met—not after a timer.
2. **BUY** items customers bring in, or select matching inventory items from **BAG** to **SELL** to buyers. Buyers have budgets and may request specific item categories.
3. Try **BARGAIN** to improve a deal. A failed bargain lowers your reputation with that customer group; successful trades help restore it.
4. Use **REPUTATION**, **UPGRADES**, **BAG**, and the telephone to manage the business.
5. Review the end-of-day receipt and prepare for the next day.

Day 1 is a guided, five-customer walkthrough with short, typewriter-style subtitles. Later days let you trade freely. Controls are primarily mouse-based.

## Customer Types

New types are introduced in a fixed sequence; previously introduced types keep visiting.

| First appears | Customer type | Behavior |
| --- | --- | --- |
| Day 1 | **Pals of Pat's** | Regular customers with everyday offers and requests; Day 1 includes the tutorial. |
| Day 2 | **Penny Pinchers** | Bargain hunters with tighter budgets who are harder to negotiate with. |
| Day 3 | **Precarious Purveyors** | Suspicious traders whose tempting deals can damage other customer relationships. |
| Day 4 | **Posh Patrons** | Wealthy collectors seeking valuable items; some offer a broken-vase challenge. |
| Day 5 | **Pallet Peddlers** | Wholesale traders with fixed prices. As buyers, they accept any category, have no budget limit, and pay 90% of original value. |

Each special type receives an introduction when first encountered. The Pals of Pat's introduction pop-up is intentionally omitted. The shop tracks reputation by customer group; reputation influences bargaining outcomes.

## Shop Upgrades

Upgrades appear from Day 3, except **Wealthy Clientele**, which becomes available on Day 6. Each level must be bought in order.

| Upgrade | Price(s) | Effect |
| --- | --- | --- |
| **Price Catalog** | $90 | Reveals original item values during trades and in BAG. |
| **Display Shelves I–III** | $100 / $220 / $450 | Raises buyers' selling prices by 5% per level (up to 15%). |
| **Advertising I–III** | $100 / $200 / $400 | Raises the daily base customer quota from 5 to 7, 10, or 13. |
| **Wealthy Clientele I–III** | $120 / $260 / $480 | Raises regular buyers' budgets by 15%, 30%, or 50% total; Pallet Peddlers are excluded. |
| **Tipsy Barrel Partnership** | $150 | Unlocks wholesale wine orders by telephone. |
| **Flashback Partnership** | $220 | Unlocks wholesale camera orders by telephone. |
| **Rusty Wrench Partnership** | $180 | Unlocks wholesale drill orders by telephone. |

Supplier orders can contain **1, 3, or 6 items**, with bulk discounts for larger orders. Deliveries arrive the next morning and reserve inventory space while pending.

There are **no purchasable Storage upgrades**. The bag starts with **6 slots**, and successful Storage Reorganization (Tetris) challenges grant **3 additional permanent slots** each.

## Days, Rent, and Endings

- Customer quota is based on Advertising, with inspection grades potentially changing it by **+2** (A), **0** (B), or **−2** (C), to a minimum of three customers.
- The first week is rent-free. Pat explains rent on Day 7; payments begin on **Day 14**, recur every seven days, and increase by 20% each week (rounded to whole dollars).
- If the balance is negative at the end of a week, the player has **three days** to recover. Remaining in debt at the end of that period closes the shop.
- The run concludes at the end of **Day 28**. Endings depend on money earned and upgrades unlocked, with special outcomes for exceptional success or very limited progress.
- The final results screen includes ending dialogue, money, upgrades, final storage capacity, and items bought and sold. An achievement-style notification appears afterward.

## Integrated Mini-Games

The three mini-games run in embedded iframes and communicate their results back to the main game.

### Broken Vase Repair — Posh Patrons

Certain collectors offer a shattered antique vase. Complete the repair puzzle to earn a repaired item and bonus value to sell later.

### Storage Reorganization — Tetris

When a purchase would exceed storage capacity, the player can attempt a Tetris-style challenge. Winning adds **3 permanent storage slots**; failing risks losing the purchase and payment.

### Inspector Memory Game

Inspector Alex visits separately from the normal customer quota. The player plays a card-matching memory game; the result produces an **A, B, or C** grade that affects subsequent customer traffic.

## Running Locally

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Serve the folder using the **Live Server** extension or another local HTTP server.
4. Open `index.html` in a browser.

The game uses `sketch.js` for its main logic, `index.html` for the canvas and iframe overlays, and the `images/`, `sounds/`, `vase-puzzle/`, `storage-tetris/`, and `memory-mini-game/` folders for assets and mini-games. No build step is needed. A local server is recommended so iframe and asset paths work reliably.

## Code Organization

- `sketch.js` contains the main shop state, customer/shopkeeper/product classes, trading, upgrades, and game flow.
- Each mini-game lives in its own directory and communicates with the shop through iframe messages.
- `index.html` handles the page layout, audio toggle, and embedded game windows.
- Debug-only keyboard shortcuts are not included in the submission version.

Built with **JavaScript**, **p5.js**, pixel-art assets, and object-oriented classes including `Customer`, `Shopkeeper`, `Product`, and `CustomerProfile`.
