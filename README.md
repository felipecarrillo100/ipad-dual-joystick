 ipad-dual-joystick

## Description

**`ipad-dual-joystick`** is a sleek, **mobile-optimized React component** that brings **dual on-screen joysticks** and optional buttons (`A` and `B`) to your web games and interactive apps.  
Designed for iPhones, iPads, and modern Android devices, it gives you the precision and responsiveness of a game controller, directly in the browser.

Perfect for games, simulations, and interactive experiences that require fluid, touch-friendly controls.

### Benefits

- **Responsive Design**: Works flawlessly on different screen sizes, orientations, and aspect ratios.
- **Optional controls**: Only show joysticks or buttons if the corresponding callbacks are provided.
- **Customizable**: Easily tweak colors, sizes, positions, and offsets through SCSS variables.
- **Lightweight & Dependency-Free**: No frameworks, no bloated libraries, just clean React code.
- **Multiplatform**: Optimized for iOS and Android touch devices.
- **Intuitive & Smooth**: Pointer events, dead-zone handling, and dynamic joystick scaling ensure precise input.
- **Future-Proof**: Ready for games and apps that require rapid prototyping or full-scale production.

---
## Installation

Install via npm:

```bash
npm install ipad-dual-joystick
```

## Usage

```tsx
import React from "react";
// Import Javascript Module
import { MobileJoystickControls } from "ipad-dual-joystick";
// Import SCSS/CSS styling
import "ipad-dual-joystick/dist/styles.scss";

const MyGame: React.FC = () => {
    const handleLeftMove = (dx: number, dy: number) => {
        console.log("Left joystick:", dx, dy);
    };

    const handleRightMove = (dx: number, dy: number) => {
        console.log("Right joystick:", dx, dy);
    };

    const handleUp = (active: boolean) => console.log("Up:", active);
    const handleDown = (active: boolean) => console.log("Down:", active);
    const handleA = (active: boolean) => console.log("A:", active);
    const handleB = (active: boolean) => console.log("B:", active);

    return (
        <MobileJoystickControls
            onLeftJoystickMove={handleLeftMove}   // optional
            onRightJoystickMove={handleRightMove} // optional
            onUp={handleUp}                       // optional
            onDown={handleDown}                   // optional
            onButtonA={handleA}                   // optional
            onButtonB={handleB}                   // optional
            autoFade={true}                       // optional
        />
    );
};
```
## Styling

You can fully customize the appearance of joysticks and buttons using SCSS:

```scss
$joystick-bg: rgba(50, 50, 50, 0.5);
$joystick-handle-bg: #ff0000;
$joystick-handle-active-bg: #00ff00;
$button-bg: #333333;
$button-active-bg: #ff8800;

@import "ipad-dual-joystick/dist/MobileJoystickControls.scss";

```

Variables you can customize:

- $joystick-bg
- $joystick-handle-bg
- $joystick-handle-active-bg
- $button-bg
- $button-active-bg
- $button-color
- $button-active-color
- $joystick-size
- $joystick-handle-size
- $button-size
- $button-gap
- $joystick-offset-vertical
- $joystick-offset-horizontal
- $button-offset-vertical

## Features

- Dual joysticks with smooth analog input
- Optional action buttons (A and B)
- Dead-zone and scaling for precise control
- Responsive layout for portrait and landscape modes
- Fully customizable via SCSS or CSS

## Props
Optional callbacks: if you don’t provide a callback, the corresponding joystick or button will not render.

| Prop                  | Type                               | Optional | Description                                |
|-----------------------| ---------------------------------- |----------|--------------------------------------------|
| `onLeftJoystickMove`  | `(dx: number, dy: number) => void` | Yes      | Callback for left joystick movement        |
| `onRightJoystickMove` | `(dx: number, dy: number) => void` | Yes      | Callback for right joystick movement       |
| `onUp`                | `(active: boolean) => void`        | Yes      | Callback for "Up" button press/release     |
| `onDown`              | `(active: boolean) => void`        | Yes      | Callback for "Down" button press/release   |
| `onButtonA`           | `(active: boolean) => void`        | Yes      | Callback for "A" button press/release      |
| `onButtonB`           | `(active: boolean) => void`        | Yes      | Callback for "B" button press/release      |
| `autoFade`            | `boolean`        | Yes      | If True fade after 5 seconds of inactivity |


## License

MIT
