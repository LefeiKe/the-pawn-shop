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

- Advertising sets the base customer count to **5, 7, 10, or 13** per day. The latest inspection grade modifies it by **+2** (A), **0** (B), or **−2** (C), with a minimum of three.
- The first week is rent-free. Pat introduces rent on Day 7; payments begin on **Day 14**, repeat on Days 21 and 28, and increase by **20% per week** (rounded to whole dollars).
- If the balance is negative at the end of a rent week, the shop has **three days to recover**. Staying in debt past that deadline triggers **SHOP CLOSED**.
- The game normally ends after **Day 28**. The ending depends on the total money earned from sales and how many upgrades were purchased, **not** simply the final cash balance.
- Each purchased upgrade level counts individually toward the upgrade total; each one-time supplier partnership counts once. Tetris storage rewards do **not** count as purchased upgrades.

### Endings

The checks run in the order shown; the first matching condition determines the ending.

| Ending | Condition | Outcome |
| --- | --- | --- |
| **SHOP CLOSED** | Fail the three-day debt recovery deadline, or finish Day 28 with negative cash | Defeat: the pawn shop closes. |
| **SPECIAL ENDING: THE NEW OWNER** | Unlock **8+** upgrades **and** earn **$7,500+** in total sales | Victory: Pat entrusts the entire shop to you. |
| **SPECIAL ENDING: THE QUIET SHOP** | Unlock **2 or fewer** upgrades **and** earn **less than $1,000** in total sales | Modest victory: you survive the month with a quiet little shop. |
| **A TRUSTED SUCCESSOR** | Unlock **5+** upgrades **and** earn **$2,500+** in total sales (without meeting the higher-priority special ending) | Victory: Pat keeps you on as the trusted shop manager. |
| **A PROMISING START** | Complete Day 28 without meeting any of the above conditions | Victory: you successfully complete your first month. |

The final results screen includes Pat's ending call, a scrollable statistics summary (money, income, upgrades, storage capacity, and items bought/sold), and an achievement-style notification.

## Integrated Mini-Games

All three mini-games appear within the main shop, using embedded iframes that return results to the main game. The background music continues while they are open.

### Broken Vase Repair — Posh Patrons (Margot Anderson-Song)

Posh Patrons may offer a broken antique vase as a special challenge. Choose **“I'll take a stab at it”** to start the puzzle immediately; selecting **“Not today”** skips it.

- **Goal:** Reassemble the vase on a **3 × 3 grid** of eight movable pieces and one empty space within **3 minutes**.
- **Controls:** **Click** a piece to rotate it clockwise by 90°. **Click and drag** a piece toward the empty square to move it; only pieces directly adjacent to the empty square can move. **SHUFFLE BOARD** rearranges the puzzle.
- **Reference:** A finished-vase preview appears beside the puzzle.
- **Success:** Complete the arrangement before time runs out to finish the challenge, register the repaired vase, and receive the Posh Patron's bonus response.
- **Failure:** Running out of time or closing the challenge counts as an unsuccessful attempt.

### Storage Reorganization — Tetris (Abdullah Noor)

When a customer purchase or supplier delivery would exceed the shop's current storage capacity, the player can attempt a storage challenge.

- **Goal:** Clear **5 complete rows** on a **10 × 20** board. Several bottom rows start partially filled with crates.
- **Controls:** **Left/Right** or **A/D** to move; **Up/W** to rotate clockwise; **Down/S** for soft drop; **Space** for hard drop; **P** to pause. Use the on-screen button to give up.
- **Rules:** Falling pieces lock into the grid. Filled rows disappear; parts of broken-up items are converted into crates. The game ends when five rows are cleared or a new piece cannot spawn.
- **Success:** Gain **3 permanent storage slots**. The game then saves as much of the pending purchase as capacity allows.
- **Failure:** The pending purchase and its payment are lost. Previously owned inventory remains protected.
- **Sound:** The line-clear effect plays when rows are removed.

### Inspector Memory Game — Inspector Alex (Shuangran Zhao)

Inspector Alex arrives separately from ordinary customers, roughly every **4–6 days**, and does not count toward the day's customer quota.

- **Memorize:** Study **six merchandise cards** and their displayed prices. Click a card to hide or reveal its price, then press **READY**.
- **Questions:** Answer **5 multiple-choice questions**, with **4 choices** and **20 seconds per question**. The first asks which item is missing; later questions test remembered prices, highest/lowest values, price comparisons, or differences.
- **Pricing:** Each inspection round generates its own displayed prices for the memory challenge. These are the prices to remember for that round, rather than live transaction totals from the main shop.
- **Feedback:** Correct answers play a cash sound; incorrect selections play a click sound. After each result, continue to the next question.
- **Grade:** **A = 5 correct**, **B = 3–4 correct**, and **C = 0–2 correct**. The grade changes daily customer traffic by **+2**, **0**, or **−2**, respectively, until superseded by a later inspection.

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
