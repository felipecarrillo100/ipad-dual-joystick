import React, { useState } from "react";
import './App.css';
import { MobileJoystickControls } from "../../src";
import {useFrequencyMeter} from "./utils/useFrequencyMeter";
import {JOYSTICK_EMIT_ON_CHANGE} from "../../src/MobileJoystickControls";
import "../../src/styles.scss";

const App: React.FC = () => {
    const [left, setLeft] = useState({ dx: 0, dy: 0 });
    const [right, setRight] = useState({ dx: 0, dy: 0 });
    const [buttons, setButtons] = useState({ a: false, b: false, up: false, down: false });
    const { trigger, frequencies } = useFrequencyMeter();


    return (
        <>
            <div className="app-container">
                <h1>Joystick Controller</h1>
                <p>This example shows how to wire the dual joystick controller</p>

                {/* State Panel */}
                <div className="state-panel">
                    <div className="joystick-state">
                        <h3>Left Joystick</h3>
                        <p>dx: {left.dx.toFixed(2)}</p>
                        <p>dy: {left.dy.toFixed(2)}</p>

                        <h3>Frequency</h3>
                        <p>Joystick 1 Hz: {frequencies.J1?.toFixed(2)}</p>
                        <p>Joystick 2 Hz: {frequencies.J2?.toFixed(2)}</p>
                    </div>
                    <div className="joystick-state">
                        <h3>Right Joystick</h3>
                        <p>dx: {right.dx.toFixed(2)}</p>
                        <p>dy: {right.dy.toFixed(2)}</p>
                    </div>
                    <div className="buttons-state">
                        <h3>Buttons</h3>
                        <p>A: <span className={buttons.a ? "active" : ""}>{buttons.a ? "ON" : "OFF"}</span></p>
                        <p>B: <span className={buttons.b ? "active" : ""}>{buttons.b ? "ON" : "OFF"}</span></p>
                        <p>Up: <span className={buttons.up ? "active" : ""}>{buttons.up ? "ON" : "OFF"}</span></p>
                        <p>Down: <span className={buttons.down ? "active" : ""}>{buttons.down ? "ON" : "OFF"}</span></p>
                    </div>
                </div>

                {/* Joystick Controls */}
                <MobileJoystickControls
                    autoFade={true}
                    joystickEmitMode={JOYSTICK_EMIT_ON_CHANGE}
                    onLeftJoystickMove={(dx, dy) => {
                        setLeft({ dx, dy });
                        trigger("J1");
                    }}
                    onRightJoystickMove={(dx, dy) => {
                        setRight({ dx, dy });
                        trigger("J2");
                    }}
                    onUp={(active) => {
                        setButtons(b => ({ ...b, up: active }));
                    }}
                    onDown={(active) => setButtons(b => ({ ...b, down: active }))}
                    onButtonA={(active) => setButtons(b => ({ ...b, a: active }))}
                    onButtonB={(active) => setButtons(b => ({ ...b, b: active }))}
                />
            </div>
        </>
    );
};

export default App;
