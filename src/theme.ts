export interface JoystickTheme {
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

    // New properties
    buttonsUpDownOrder: "up/down" | "down/up"; // order of directional buttons
    buttonsABOrder: "A/B" | "B/A"; // order of A/B buttons
    leftButtons: { dx: number, dy: number, tilt: number },
    rightButtons: { dx: number, dy: number, tilt: number },
}

export const defaultJoystickTheme: JoystickTheme = {
    joystickSize: 130,
    joystickHandleSize: 50,
    joystickZIndex: 1000,
    joystickOffset: 30,
    joystickBg: "rgba(0, 0, 0, 0.6)",
    joystickHandleBg: "rgba(200, 200, 200, 0.8)",

    buttonSize: 60,
    buttonGap: 50,
    buttonBg: "rgba(0, 0, 0, 0.3)",
    buttonBgActive: "rgba(96, 77, 77, 0.6)",
    buttonFontSize: "24px",
    buttonColor: "white",

    buttonsUpDownOrder: "up/down",
    buttonsABOrder: "A/B",
    leftButtons: { dx: 0, dy: 85, tilt: 45 },
    rightButtons: { dx: 0, dy: 85, tilt: -45 },
};
