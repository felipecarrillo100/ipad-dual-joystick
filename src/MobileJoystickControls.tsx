import React, { useEffect, useRef, useState } from "react";
import "./MobileJoystickControls.scss";
import { JoystickTheme, defaultJoystickTheme } from "./theme";

interface MobileJoystickControlsProps {
    onLeftJoystickMove: (dx: number, dy: number) => void;
    onRightJoystickMove: (dx: number, dy: number) => void;
    onUp: (active: boolean) => void;
    onDown: (active: boolean) => void;
    onButtonA?: (active: boolean) => void;
    onButtonB?: (active: boolean) => void;
    dual?: boolean;
    theme?: Partial<JoystickTheme>;
}

const maxRadius = 50;
const deadZone = 0.1;

const setCssVariable = (value: number | undefined, unit: string) => {
    return value !== undefined ? `${value}${unit}` : undefined;
};

export const MobileJoystickControls: React.FC<MobileJoystickControlsProps> = ({
                                                                                  onLeftJoystickMove,
                                                                                  onRightJoystickMove,
                                                                                  onUp,
                                                                                  onDown,
                                                                                  onButtonA,
                                                                                  onButtonB,
                                                                                  dual = true,
                                                                                  theme = {},
                                                                              }) => {
    const mergedTheme: JoystickTheme = { ...defaultJoystickTheme, ...theme };

    // State
    const [draggingLeft, setDraggingLeft] = useState(false);
    const [leftPos, setLeftPos] = useState({ x: 0, y: 0 });
    const [draggingRight, setDraggingRight] = useState(false);
    const [rightPos, setRightPos] = useState({ x: 0, y: 0 });
    const [isUpActive, setIsUpActive] = useState(false);
    const [isDownActive, setIsDownActive] = useState(false);
    const [isAActive, setIsAActive] = useState(false);
    const [isBActive, setIsBActive] = useState(false);

    // Refs
    const leftJoystickRef = useRef<HTMLDivElement | null>(null);
    const leftPointerIdRef = useRef<number | null>(null);
    const leftDxRef = useRef(0);
    const leftDyRef = useRef(0);

    const rightJoystickRef = useRef<HTMLDivElement | null>(null);
    const rightPointerIdRef = useRef<number | null>(null);
    const rightDxRef = useRef(0);
    const rightDyRef = useRef(0);

    const animationRef = useRef<number | null>(null);

    // Responsive scaling
    const [scaleFactor, setScaleFactor] = useState(1);
    useEffect(() => {
        const computeScale = () => {
            const factor = Math.min(window.innerWidth, window.innerHeight) / 768;
            setScaleFactor(factor);
        };
        computeScale();
        window.addEventListener("resize", computeScale);
        return () => window.removeEventListener("resize", computeScale);
    }, []);

    // Continuous joystick loop
    useEffect(() => {
        const loop = () => {
            const leftDx = Math.abs(leftDxRef.current) < deadZone ? 0 : leftDxRef.current;
            const leftDy = Math.abs(leftDyRef.current) < deadZone ? 0 : leftDyRef.current;
            if (leftDx !== 0 || leftDy !== 0) onLeftJoystickMove(leftDx, leftDy);

            const rightDx = Math.abs(rightDxRef.current) < deadZone ? 0 : rightDxRef.current;
            const rightDy = Math.abs(rightDyRef.current) < deadZone ? 0 : rightDyRef.current;
            if (rightDx !== 0 || rightDy !== 0) onRightJoystickMove(rightDx, rightDy);

            animationRef.current = requestAnimationFrame(loop);
        };
        animationRef.current = requestAnimationFrame(loop);
        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        };
    }, [onLeftJoystickMove, onRightJoystickMove]);

    const computeJoystickFromPointer = (
        clientX: number,
        clientY: number,
        el: HTMLDivElement,
        setPos: (p: { x: number; y: number }) => void,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>
    ) => {
        const rect = el.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const limitedDistance = Math.min(distance, maxRadius * scaleFactor);
        const x = Math.cos(angle) * limitedDistance;
        const y = Math.sin(angle) * limitedDistance;
        setPos({ x, y });
        dxRef.current = x / (maxRadius * scaleFactor);
        dyRef.current = -y / (maxRadius * scaleFactor);
    };

    const finishPointer = (
        pointerIdRef: React.MutableRefObject<number | null>,
        setDragging: React.Dispatch<React.SetStateAction<boolean>>,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>,
        elRef: React.RefObject<HTMLDivElement | null>
    ) => {
        const el = elRef.current;
        if (el && pointerIdRef.current !== null) el.releasePointerCapture?.(pointerIdRef.current);
        pointerIdRef.current = null;
        setDragging(false);
        setPos({ x: 0, y: 0 });
        dxRef.current = 0;
        dyRef.current = 0;
    };

    const createJoystickHandlers = (
        ref: React.RefObject<HTMLDivElement | null>,
        pointerIdRef: React.MutableRefObject<number | null>,
        setDragging: React.Dispatch<React.SetStateAction<boolean>>,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>
    ) => ({
        down: (e: React.PointerEvent) => {
            e.preventDefault();
            const el = ref.current;
            if (!el) return;
            pointerIdRef.current = e.pointerId;
            el.setPointerCapture?.(e.pointerId);
            setDragging(true);
            computeJoystickFromPointer(e.clientX, e.clientY, el, setPos, dxRef, dyRef);
        },
        move: (e: React.PointerEvent) => {
            if (pointerIdRef.current !== e.pointerId) return;
            e.preventDefault();
            const el = ref.current;
            if (!el) return;
            computeJoystickFromPointer(e.clientX, e.clientY, el, setPos, dxRef, dyRef);
        },
        up: (e: React.PointerEvent) => {
            if (pointerIdRef.current !== e.pointerId) return;
            e.preventDefault();
            finishPointer(pointerIdRef, setDragging, setPos, dxRef, dyRef, ref);
        },
        cancel: (e: React.PointerEvent) => {
            if (pointerIdRef.current !== e.pointerId) return;
            e.preventDefault();
            finishPointer(pointerIdRef, setDragging, setPos, dxRef, dyRef, ref);
        },
    });

    const leftHandlers = createJoystickHandlers(leftJoystickRef, leftPointerIdRef, setDraggingLeft, setLeftPos, leftDxRef, leftDyRef);
    const rightHandlers = createJoystickHandlers(rightJoystickRef, rightPointerIdRef, setDraggingRight, setRightPos, rightDxRef, rightDyRef);

    const createButtonHandler = (setActive: React.Dispatch<React.SetStateAction<boolean>>, callback?: (active: boolean) => void) => ({
        down: (e: React.PointerEvent) => {
            e.preventDefault();
            setActive(true);
            callback?.(true);
        },
        up: (e: React.PointerEvent) => {
            e.preventDefault();
            setActive(false);
            callback?.(false);
        },
    });

    const upHandler = createButtonHandler(setIsUpActive, onUp);
    const downHandler = createButtonHandler(setIsDownActive, onDown);
    const aHandler = createButtonHandler(setIsAActive, onButtonA);
    const bHandler = createButtonHandler(setIsBActive, onButtonB);

    return (
        <div className="mobile-joystick-controls" style={{
            "--scale-factor": scaleFactor,
            "--joystick-z-index": mergedTheme.joystickZIndex,
            "--base-joystick-offset": setCssVariable(mergedTheme.joystickOffset, `px`),
            "--joystick-size": setCssVariable(mergedTheme.joystickSize, `px`),
            "--base-joystick-handle-size": setCssVariable(mergedTheme.joystickHandleSize, `px`),
            "--base-button-gap": setCssVariable(mergedTheme.buttonGap, `px`),
            "--base-button-size": setCssVariable(mergedTheme.buttonSize, `px`),
            "--joystickBg": mergedTheme.joystickBg,
            "--joystickHandleBg": mergedTheme.joystickHandleBg,
            "--buttonBg": mergedTheme.buttonBg,
            "--buttonBgActive": mergedTheme.buttonBgActive,
            "--buttonColor": mergedTheme.buttonColor,
            "--buttonFontSize": mergedTheme.buttonFontSize,

            "--base-left-buttons-tilt": setCssVariable(mergedTheme.leftButtons?.tilt, "deg"),
            "--base-left-buttons-dx": setCssVariable(mergedTheme.leftButtons?.dx, `px`),
            "--base-left-buttons-dy": setCssVariable(mergedTheme.leftButtons?.dy, `px`),

            "--base-right-buttons-tilt": setCssVariable(mergedTheme.rightButtons?.tilt, `deg`),
            "--base-right-buttons-dx": setCssVariable(mergedTheme.rightButtons?.dx , `px`),
            "--base-right-buttons-dy": setCssVariable(mergedTheme.rightButtons?.dy, `px`),
        } as React.CSSProperties}>
            <div className="relative-container">
                {/* Left up/down buttons */}
                <div className="button-bar up-down-buttons" >
                    <div className="button-pair">
                        {mergedTheme.buttonsUpDownOrder === "up/down" ? (
                            <>
                                <div
                                    className={`action-button up${isUpActive ? " active" : ""}`}
                                    onPointerDown={upHandler.down}
                                    onPointerUp={upHandler.up}
                                >
                                    ↑
                                </div>
                                <div
                                    className={`action-button down${isDownActive ? " active" : ""}`}
                                    onPointerDown={downHandler.down}
                                    onPointerUp={downHandler.up}
                                >
                                    ↓
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className={`action-button down${isDownActive ? " active" : ""}`}
                                    onPointerDown={downHandler.down}
                                    onPointerUp={downHandler.up}
                                >
                                    ↓
                                </div>
                                <div
                                    className={`action-button up${isUpActive ? " active" : ""}`}
                                    onPointerDown={upHandler.down}
                                    onPointerUp={upHandler.up}
                                >
                                    ↑
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Left joystick */}
                <div
                    ref={leftJoystickRef}
                    className="joystick left-joystick"
                    onPointerDown={leftHandlers.down}
                    onPointerMove={leftHandlers.move}
                    onPointerUp={leftHandlers.up}
                    onPointerCancel={leftHandlers.cancel}
                >
                    <div
                        className={`joystick-handle${draggingLeft ? " active" : ""}`}
                        style={{transform: `translate(${leftPos.x}px, ${leftPos.y}px) scale(${draggingLeft ? 1.2 : 1})`}}
                    />
                </div>

                {/* Left A/B buttons */}
                <div className="button-bar a-b-buttons">
                    <div className="button-pair" >
                        {mergedTheme.buttonsABOrder === "A/B" ? (
                            <>
                                <div
                                    className={`action-button a${isAActive ? " active" : ""}`}
                                    onPointerDown={aHandler.down}
                                    onPointerUp={aHandler.up}
                                >
                                    A
                                </div>
                                <div
                                    className={`action-button b${isBActive ? " active" : ""}`}
                                    onPointerDown={bHandler.down}
                                    onPointerUp={bHandler.up}
                                >
                                    B
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className={`action-button b${isBActive ? " active" : ""}`}
                                    onPointerDown={bHandler.down}
                                    onPointerUp={bHandler.up}
                                >
                                    B
                                </div>
                                <div
                                    className={`action-button a${isAActive ? " active" : ""}`}
                                    onPointerDown={aHandler.down}
                                    onPointerUp={aHandler.up}
                                >
                                    A
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right joystick */}
                {dual && (
                    <div
                        ref={rightJoystickRef}
                        className="joystick right-joystick"
                        onPointerDown={rightHandlers.down}
                        onPointerMove={rightHandlers.move}
                        onPointerUp={rightHandlers.up}
                        onPointerCancel={rightHandlers.cancel}
                    >
                        <div
                            className={`joystick-handle${draggingRight ? " active" : ""}`}
                            style={{transform: `translate(${rightPos.x}px, ${rightPos.y}px) scale(${draggingRight ? 1.2 : 1})` }}/>
                    </div>
                )}
            </div>
        </div>
    );
};
