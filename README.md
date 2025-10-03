# iPad Dual Joystick Controls

A mobile joystick component for React that supports dual joysticks and action buttons, designed for iPad and touchscreen devices. Fully customizable via a theme.

## Features

- Dual joysticks (left and right) with independent callbacks
- Up/Down directional buttons
- A/B action buttons
- Fully customizable sizes, colors, spacing, and button offsets
- Supports scaling for different screen sizes
- Smooth touch handling with dead zone support

## Installation

```bash
npm install ipad-dual-joystick
# or
yarn add ipad-dual-joystick
```

## Usage

```tsx
import React from "react";
import { MobileJoystickControls } from "ipad-dual-joystick";
import { JoystickTheme } from "ipad-dual-joystick/theme";

const MyGame: React.FC = () => {
  const handleLeftMove = (dx: number, dy: number) => {
    console.log("Left joystick:", dx, dy);
  };

  const handleRightMove = (dx: number, dy: number) => {
    console.log("Right joystick:", dx, dy);
  };

  const theme: Partial<JoystickTheme> = {
    joystickSize: 140,
    leftButtons: { dx: 0, dy: 90, tilt: 45 },
    rightButtons: { dx: 0, dy: 90, tilt: -45 },
  };

  return (
    <MobileJoystickControls
      onLeftJoystickMove={handleLeftMove}
      onRightJoystickMove={handleRightMove}
      onUp={(active) => console.log("Up:", active)}
      onDown={(active) => console.log("Down:", active)}
      onButtonA={(active) => console.log("A:", active)}
      onButtonB={(active) => console.log("B:", active)}
      theme={theme}
    />
  );
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `onLeftJoystickMove` | `(dx: number, dy: number) => void` | Callback for left joystick movement. dx/dy are normalized (-1 to 1) |
| `onRightJoystickMove` | `(dx: number, dy: number) => void` | Callback for right joystick movement |
| `onUp` | `(active: boolean) => void` | Callback when up button pressed/released |
| `onDown` | `(active: boolean) => void` | Callback when down button pressed/released |
| `onButtonA` | `(active: boolean) => void` | Callback for A button |
| `onButtonB` | `(active: boolean) => void` | Callback for B button |
| `dual` | `boolean` | Whether to show the right joystick (default `true`) |
| `theme` | `Partial<JoystickTheme>` | Optional theme overrides |

## Theme

`JoystickTheme` allows you to customize appearance and layout:

```ts
interface JoystickTheme {
    joystickSize?: number;
    joystickHandleSize?: number;
    joystickZIndex?: number;
    joystickOffset?: number;
    joystickHandleBg?: string;
    joystickBg?: string;

    buttonSize?: number;
    buttonGap?: number;
    buttonBg?: string;
    buttonBgActive?: string;
    buttonFontSize?: string;
    buttonColor?: string;

    buttonsUpDownOrder: "up/down" | "down/up";
    buttonsABOrder: "A/B" | "B/A";
    leftButtons: { dx: number, dy: number, tilt: number };
    rightButtons: { dx: number, dy: number, tilt: number };
}
```

### CSS Variables

The component uses CSS variables internally for scaling and positioning:

| Variable | Default | Description |
|----------|---------|-------------|
| `--scale-factor` | `1` | Device scaling factor |
| `--joystick-z-index` | `1000` | Joystick z-index |
| `--joystick-size` | `130px` | Size of joystick base |
| `--joystick-handle-size` | `50px` | Size of joystick handle |
| `--joystick-offset` | `30px` | Distance from screen edges |
| `--button-size` | `60px` | Size of A/B and up/down buttons |
| `--button-gap` | `50px` | Gap between paired buttons |
| `--buttonFontSize` | `24px` | Font size for button labels |
| `--buttonColor` | `white` | Color of button text |
| `--buttonBg` | `rgba(0,0,0,0.3)` | Button background |
| `--buttonBgActive` | `rgba(96,77,77,0.6)` | Active button background |
| `--joystickBg` | `rgba(0,0,0,0.6)` | Joystick base background |
| `--joystickHandleBg` | `rgba(200,200,200,0.8)` | Joystick handle background |
| `--base-left-buttons-tilt` | `45deg` | Tilt of left buttons |
| `--base-left-buttons-dx` | `0px` | Horizontal offset of left buttons |
| `--base-left-buttons-dy` | `85px` | Vertical offset of left buttons |
| `--base-right-buttons-tilt` | `-45deg` | Tilt of right buttons |
| `--base-right-buttons-dx` | `0px` | Horizontal offset
