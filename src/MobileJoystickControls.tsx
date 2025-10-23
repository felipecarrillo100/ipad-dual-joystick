import React, { useEffect, useRef, useState } from "react";

/** Joystick event emission behavior */
export const JOYSTICK_EMIT_ALWAYS = "JoystickEmitAlways";
export const JOYSTICK_EMIT_ON_CHANGE = "JoystickEmitOnChange";

interface MobileJoystickControlsProps {
    onLeftJoystickMove?: (dx: number, dy: number) => void;
    onRightJoystickMove?: (dx: number, dy: number) => void;
    onUp?: (active: boolean) => void;
    onDown?: (active: boolean) => void;
    onButtonA?: (active: boolean) => void;
    onButtonB?: (active: boolean) => void;
    /** Optional: joystick update rate in Hz (default = 30) */
    joystickRateHz?: number;
    /** Joystick event emission behavior (default = JOYSTICK_EMIT_ALWAYS) */
    joystickEmitMode?: typeof JOYSTICK_EMIT_ALWAYS | typeof JOYSTICK_EMIT_ON_CHANGE;
}

const maxRadius = 50;
const deadZone = 0.1;
const maxOutside = 0.35;

export const MobileJoystickControls: React.FC<MobileJoystickControlsProps> = ({
                                                                                  onLeftJoystickMove,
                                                                                  onRightJoystickMove,
                                                                                  onUp,
                                                                                  onDown,
                                                                                  onButtonA,
                                                                                  onButtonB,
                                                                                  joystickRateHz = 30,
                                                                                  joystickEmitMode = JOYSTICK_EMIT_ON_CHANGE,
                                                                              }) => {
    const [draggingLeft, setDraggingLeft] = useState(false);
    const [leftPos, setLeftPos] = useState({ x: 0, y: 0 });
    const [draggingRight, setDraggingRight] = useState(false);
    const [rightPos, setRightPos] = useState({ x: 0, y: 0 });

    const [isUpActive, setIsUpActive] = useState(false);
    const [isDownActive, setIsDownActive] = useState(false);
    const [isAActive, setIsAActive] = useState(false);
    const [isBActive, setIsBActive] = useState(false);

    const [isActive, setIsActive] = useState(false);
    const fadeTimeoutRef = useRef<number | null>(null);

    // Joystick state refs
    const leftJoystickRef = useRef<HTMLDivElement | null>(null);
    const leftPointerIdRef = useRef<number | null>(null);
    const leftDxRef = useRef(0);
    const leftDyRef = useRef(0);

    const rightJoystickRef = useRef<HTMLDivElement | null>(null);
    const rightPointerIdRef = useRef<number | null>(null);
    const rightDxRef = useRef(0);
    const rightDyRef = useRef(0);

    const animationRef = useRef<number | null>(null);
    const lastUpdateRef = useRef(0);

    // Previous joystick active state (for ON_CHANGE mode)
    const leftActiveRef = useRef(false);
    const rightActiveRef = useRef(false);

    // Visibility fade management
    const activateControls = () => {
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        setIsActive(true);
    };
    const scheduleFade = () => {
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = window.setTimeout(() => setIsActive(false), 3000);
    };

    const ShowButtonA = typeof onButtonA === "function";
    const ShowButtonB = typeof onButtonB === "function";
    const ShowButtonUp = typeof onUp === "function";
    const ShowButtonDown = typeof onDown === "function";
    const ShowJoystickLeft = typeof onLeftJoystickMove === "function";
    const ShowJoystickRight = typeof onRightJoystickMove === "function";

    // Throttled joystick loop
    useEffect(() => {
        const intervalMs = 1000 / joystickRateHz;

        const loop = (timestamp: number) => {
            if (!lastUpdateRef.current || timestamp - lastUpdateRef.current >= intervalMs) {
                const leftDx = Math.abs(leftDxRef.current) < deadZone ? 0 : leftDxRef.current;
                const leftDy = Math.abs(leftDyRef.current) < deadZone ? 0 : leftDyRef.current;
                const rightDx = Math.abs(rightDxRef.current) < deadZone ? 0 : rightDxRef.current;
                const rightDy = Math.abs(rightDyRef.current) < deadZone ? 0 : rightDyRef.current;

                // LEFT JOYSTICK
                if (ShowJoystickLeft && onLeftJoystickMove) {
                    if (joystickEmitMode === JOYSTICK_EMIT_ALWAYS) {
                        onLeftJoystickMove(leftDx, leftDy);
                    } else {
                        const moving = leftDx !== 0 || leftDy !== 0;
                        if (moving) {
                            leftActiveRef.current = true;
                            onLeftJoystickMove(leftDx, leftDy);
                        } else if (leftActiveRef.current) {
                            leftActiveRef.current = false;
                            onLeftJoystickMove(0, 0);
                        }
                    }
                }

                // RIGHT JOYSTICK
                if (ShowJoystickRight && onRightJoystickMove) {
                    if (joystickEmitMode === JOYSTICK_EMIT_ALWAYS) {
                        onRightJoystickMove(rightDx, rightDy);
                    } else {
                        const moving = rightDx !== 0 || rightDy !== 0;
                        if (moving) {
                            rightActiveRef.current = true;
                            onRightJoystickMove(rightDx, rightDy);
                        } else if (rightActiveRef.current) {
                            rightActiveRef.current = false;
                            onRightJoystickMove(0, 0);
                        }
                    }
                }

                lastUpdateRef.current = timestamp;
            }
            animationRef.current = requestAnimationFrame(loop);
        };

        animationRef.current = requestAnimationFrame(loop);
        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        };
    }, [
        onLeftJoystickMove,
        onRightJoystickMove,
        joystickRateHz,
        joystickEmitMode,
        ShowJoystickLeft,
        ShowJoystickRight,
    ]);

    // Joystick computation
    const computeJoystickFromPointer = (
        clientX: number,
        clientY: number,
        el: HTMLDivElement,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>
    ) => {
        const rect = el.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const limitedDistance = Math.min(distance, maxRadius * (1 + maxOutside));
        const x = Math.cos(angle) * limitedDistance;
        const y = Math.sin(angle) * limitedDistance;

        setPos({ x, y });

        const normalizedX = x / (maxRadius * (1 + maxOutside));
        const normalizedY = -y / (maxRadius * (1 + maxOutside));

        dxRef.current = Math.abs(normalizedX) > deadZone ? normalizedX : 0;
        dyRef.current = Math.abs(normalizedY) > deadZone ? normalizedY : 0;
    };

    const finishPointer = (
        pointerIdRef: React.RefObject<number | null>,
        setDragging: React.Dispatch<React.SetStateAction<boolean>>,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: React.MutableRefObject<number>,
        dyRef: React.MutableRefObject<number>,
        elRef: React.RefObject<HTMLDivElement | null>,
        callback?: (dx: number, dy: number) => void
    ) => {
        const el = elRef.current;
        if (el && pointerIdRef.current !== null) el.releasePointerCapture?.(pointerIdRef.current);
        pointerIdRef.current = null;
        setDragging(false);
        setPos({ x: 0, y: 0 });
        dxRef.current = 0;
        dyRef.current = 0;
        if (callback) callback(0, 0);
        scheduleFade();
    };

    // Joystick handlers
    const leftHandlers = {
        down: (e: React.PointerEvent) => {
            e.preventDefault();
            activateControls();
            const el = leftJoystickRef.current;
            if (!el) return;
            leftPointerIdRef.current = e.pointerId;
            el.setPointerCapture?.(e.pointerId);
            setDraggingLeft(true);
            computeJoystickFromPointer(e.clientX, e.clientY, el, setLeftPos, leftDxRef, leftDyRef);
        },
        move: (e: React.PointerEvent) => {
            if (leftPointerIdRef.current !== e.pointerId) return;
            const el = leftJoystickRef.current;
            if (!el) return;
            computeJoystickFromPointer(e.clientX, e.clientY, el, setLeftPos, leftDxRef, leftDyRef);
        },
        up: (_e: React.PointerEvent) =>
            finishPointer(leftPointerIdRef, setDraggingLeft, setLeftPos, leftDxRef, leftDyRef, leftJoystickRef, onLeftJoystickMove),
        cancel: (_e: React.PointerEvent) =>
            finishPointer(leftPointerIdRef, setDraggingLeft, setLeftPos, leftDxRef, leftDyRef, leftJoystickRef, onLeftJoystickMove),
    };

    const rightHandlers = {
        down: (e: React.PointerEvent) => {
            e.preventDefault();
            activateControls();
            const el = rightJoystickRef.current;
            if (!el) return;
            rightPointerIdRef.current = e.pointerId;
            el.setPointerCapture?.(e.pointerId);
            setDraggingRight(true);
            computeJoystickFromPointer(e.clientX, e.clientY, el, setRightPos, rightDxRef, rightDyRef);
        },
        move: (e: React.PointerEvent) => {
            if (rightPointerIdRef.current !== e.pointerId) return;
            const el = rightJoystickRef.current;
            if (!el) return;
            computeJoystickFromPointer(e.clientX, e.clientY, el, setRightPos, rightDxRef, rightDyRef);
        },
        up: (_e: React.PointerEvent) =>
            finishPointer(rightPointerIdRef, setDraggingRight, setRightPos, rightDxRef, rightDyRef, rightJoystickRef, onRightJoystickMove),
        cancel: (_e: React.PointerEvent) =>
            finishPointer(rightPointerIdRef, setDraggingRight, setRightPos, rightDxRef, rightDyRef, rightJoystickRef, onRightJoystickMove),
    };

    // Button handlers
    const createButtonHandlers = (
        setActive: React.Dispatch<React.SetStateAction<boolean>>,
        callback?: (active: boolean) => void
    ) => ({
        down: (e: React.PointerEvent) => {
            e.preventDefault();
            activateControls();
            setActive(true);
            callback?.(true);
        },
        up: (e: React.PointerEvent) => {
            e.preventDefault();
            setActive(false);
            callback?.(false);
            scheduleFade();
        },
    });

    const upHandlers = createButtonHandlers(setIsUpActive, onUp);
    const downHandlers = createButtonHandlers(setIsDownActive, onDown);
    const aHandlers = createButtonHandlers(setIsAActive, onButtonA);
    const bHandlers = createButtonHandlers(setIsBActive, onButtonB);

    return (
        <div
            className="mobile-joystick-controls"
            style={{ opacity: isActive ? 1 : 0.2, transition: "opacity 0.5s ease" }}
        >
            {ShowJoystickLeft && (
                <div
                    ref={leftJoystickRef}
                    className="joystick left-joystick"
                    onPointerDown={leftHandlers.down}
                    onPointerMove={leftHandlers.move}
                    onPointerUp={leftHandlers.up}
                    onPointerCancel={leftHandlers.cancel}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div
                        className={`joystick-handle ${draggingLeft ? "active" : ""}`}
                        style={{ transform: `translate(${leftPos.x}px, ${leftPos.y}px)` }}
                    />
                </div>
            )}

            <div className="button-bar left-buttons">
                {ShowButtonUp && (
                    <div
                        className={`action-button up ${isUpActive ? "active" : ""}`}
                        onPointerDown={upHandlers.down}
                        onPointerUp={upHandlers.up}
                        onPointerCancel={upHandlers.up}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        ↑
                    </div>
                )}
                {ShowButtonDown && (
                    <div
                        className={`action-button down ${isDownActive ? "active" : ""}`}
                        onPointerDown={downHandlers.down}
                        onPointerUp={downHandlers.up}
                        onPointerCancel={downHandlers.up}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        ↓
                    </div>
                )}
            </div>

            {ShowJoystickRight && (
                <div
                    ref={rightJoystickRef}
                    className="joystick right-joystick"
                    onPointerDown={rightHandlers.down}
                    onPointerMove={rightHandlers.move}
                    onPointerUp={rightHandlers.up}
                    onPointerCancel={rightHandlers.cancel}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div
                        className={`joystick-handle ${draggingRight ? "active" : ""}`}
                        style={{ transform: `translate(${rightPos.x}px, ${rightPos.y}px)` }}
                    />
                </div>
            )}

            <div className="button-bar right-buttons">
                {ShowButtonA && (
                    <div
                        className={`action-button a ${isAActive ? "active" : ""}`}
                        onPointerDown={aHandlers.down}
                        onPointerUp={aHandlers.up}
                        onPointerCancel={aHandlers.up}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        A
                    </div>
                )}
                {ShowButtonB && (
                    <div
                        className={`action-button b ${isBActive ? "active" : ""}`}
                        onPointerDown={bHandlers.down}
                        onPointerUp={bHandlers.up}
                        onPointerCancel={bHandlers.up}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        B
                    </div>
                )}
            </div>
        </div>
    );
};
