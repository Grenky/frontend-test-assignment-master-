# Dyvo gaming test assignment for developers

## Local launch:

1. Switch to Node 20+ version.
2. Run `npm i`.
3. Run `npm run dev`

## Description:

- Create a simple wheel game in TypeScript using the provided project as a basis.

- Please implement animations using the Canvas API (not CSS).

- You may use the provided assets and sounds (you don't have to use all of them).

- Send us a ZIP file containing the source code or a link to your GitHub repository.

- The game should meet the requirements listed below.

## Requirements on game’s look/interface:

- A simple UI (credit balance, play button, and win amount fields) is updated during gameplay.

- A game title and a play button that triggers the transition to the bonus screen.

- The bonus screen, which consists of:

    - “Press to spin” message 

    - The Wheel itself:

        - consists of 8 segments 

        - each segment displays a possible "Win amount" 

        - the wheel stop position is determined by below weights: 
            | Win amount | Weight |
            |------------|--------|
            | 2.00       | 200    |
            | 50.00      | 76     |
            | 500.00     | 12     |
            | 2.00       | 200    |
            | 100.00     | 62     |
            | 50.00      | 81     |
            | 2.00       | 200    |
            | 75.00      | 74     |

    - The wheel stop animation 
  
    - The win presentation (“You won {x}” message)

- The balance in the UI is incremented by the amount won.

- A simple transition back to the first (base) screen.

## Notes
- You are free to add any extra features, such as particle animations, tweens, etc.

- Feel free to change or rewrite any part of the base project.

- The goal is to show us how you structure your project and animate the wheel.
