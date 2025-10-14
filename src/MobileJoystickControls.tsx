import React, { useEffect, useRef, useState } from "react";

interface MobileJoystickControlsProps {
    onLeftJoystickMove?: (dx: number, dy: number) => void;
    onRightJoystickMove?: (dx: number, dy: number) => void;
    onUp?: (active: boolean) => void;
    onDown?: (active: boolean) => void;
    onButtonA?: (active: boolean) => void;
    onButtonB?: (active: boolean) => void;
}

const maxRadius = 50;
const deadZone = 0.1;

export const MobileJoystickControls: React.FC<MobileJoystickControlsProps> = ({
                                                                                  onLeftJoystickMove,
                                                                                  onRightJoystickMove,
                                                                                  onUp,
                                                                                  onDown,
                                                                                  onButtonA,
                                                                                  onButtonB,
                                                                              }) => {
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

    const [scaleFactor, setScaleFactor] = useState(1);

    // Responsive scaling
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
            if (ShowJoystickLeft) onLeftJoystickMove(leftDx, leftDy);

            const rightDx = Math.abs(rightDxRef.current) < deadZone ? 0 : rightDxRef.current;
            const rightDy = Math.abs(rightDyRef.current) < deadZone ? 0 : rightDyRef.current;
            if (ShowJoystickRight) onRightJoystickMove(rightDx, rightDy);

            animationRef.current = requestAnimationFrame(loop);
        };
        animationRef.current = requestAnimationFrame(loop);
        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        };
    }, [onLeftJoystickMove, onRightJoystickMove]);

    // Helper to compute normalized joystick values
    const computeJoystickFromPointer = (
        clientX: number,
        clientY: number,
        el: HTMLDivElement,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: ReturnType<typeof useRef>,
        dyRef: ReturnType<typeof useRef>
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
        pointerIdRef: React.RefObject<number | null>,
        setDragging: React.Dispatch<React.SetStateAction<boolean>>,
        setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
        dxRef: ReturnType<typeof useRef>,
        dyRef: ReturnType<typeof useRef>,
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
    };

    // Left Joystick Handlers
    const leftHandlers = {
        down: (e: React.PointerEvent) => {
            e.preventDefault();
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
        up: (e: React.PointerEvent) => {
            if (leftPointerIdRef.current !== e.pointerId) return;
            finishPointer(leftPointerIdRef, setDraggingLeft, setLeftPos, leftDxRef, leftDyRef, leftJoystickRef, onLeftJoystickMove);
        },
        cancel: (e: React.PointerEvent) => {
            if (leftPointerIdRef.current !== e.pointerId) return;
            finishPointer(leftPointerIdRef, setDraggingLeft, setLeftPos, leftDxRef, leftDyRef, leftJoystickRef, onLeftJoystickMove);
        },
    };

    // Right Joystick Handlers
    const rightHandlers = {
        down: (e: React.PointerEvent) => {
            e.preventDefault();
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
        up: (e: React.PointerEvent) => {
            if (rightPointerIdRef.current !== e.pointerId) return;
            finishPointer(rightPointerIdRef, setDraggingRight, setRightPos, rightDxRef, rightDyRef, rightJoystickRef, onRightJoystickMove);
        },
        cancel: (e: React.PointerEvent) => {
            if (rightPointerIdRef.current !== e.pointerId) return;
            finishPointer(rightPointerIdRef, setDraggingRight, setRightPos, rightDxRef, rightDyRef, rightJoystickRef, onRightJoystickMove);
        },
    };

    // Button handlers
    const createButtonHandlers = (
        setActive: React.Dispatch<React.SetStateAction<boolean>>,
        callback?: (active: boolean) => void
    ) => ({
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

    const upHandlers = createButtonHandlers(setIsUpActive, onUp);
    const downHandlers = createButtonHandlers(setIsDownActive, onDown);
    const aHandlers = createButtonHandlers(setIsAActive, onButtonA);
    const bHandlers = createButtonHandlers(setIsBActive, onButtonB);

    const ShowButtonA = typeof onButtonA === "function";
    const ShowButtonB = typeof onButtonB === "function";
    const ShowButtonUp = typeof onUp === "function";
    const ShowButtonDown = typeof onDown === "function";

    const ShowJoystickLeft = typeof onLeftJoystickMove === "function";
    const ShowJoystickRight = typeof onRightJoystickMove === "function";

    return (
        <div className="mobile-joystick-controls">
            {/* Left Joystick */}
            {ShowJoystickLeft && <div
                ref={leftJoystickRef}
                className="joystick left-joystick"
                onPointerDown={leftHandlers.down}
                onPointerMove={leftHandlers.move}
                onPointerUp={leftHandlers.up}
                onPointerCancel={leftHandlers.cancel}
            >
                <div
                    className={`joystick-handle ${draggingLeft ? "active" : ""}`}
                    style={{ transform: `translate(${leftPos.x}px, ${leftPos.y}px) scale(${draggingLeft ? 1.2 : 1})` }}
                />
            </div>}

            {/* Left Up/Down Buttons */}
            <div className="button-bar left-buttons">
                {ShowButtonUp && <div
                    className={`action-button up ${isUpActive ? "active" : ""}`}
                    onPointerDown={upHandlers.down}
                    onPointerUp={upHandlers.up}
                    onPointerCancel={upHandlers.up}
                >
                    ↑
                </div> }
                { ShowButtonDown && <div
                    className={`action-button down ${isDownActive ? "active" : ""}`}
                    onPointerDown={downHandlers.down}
                    onPointerUp={downHandlers.up}
                    onPointerCancel={downHandlers.up}
                >
                    ↓
                </div> }
            </div>

            {/* Right Joystick */}
            {ShowJoystickRight && <div
                ref={rightJoystickRef}
                className="joystick right-joystick"
                onPointerDown={rightHandlers.down}
                onPointerMove={rightHandlers.move}
                onPointerUp={rightHandlers.up}
                onPointerCancel={rightHandlers.cancel}
            >
                <div
                    className={`joystick-handle ${draggingRight ? "active" : ""}`}
                    style={{ transform: `translate(${rightPos.x}px, ${rightPos.y}px) scale(${draggingRight ? 1.2 : 1})` }}
                />
            </div> }

            {/* Right A/B Buttons */}
            <div className="button-bar right-buttons">
                {ShowButtonA && <div
                    className={`action-button a ${isAActive ? "active" : ""}`}
                    onPointerDown={aHandlers.down}
                    onPointerUp={aHandlers.up}
                    onPointerCancel={aHandlers.up}
                >
                    A
                </div> }
                { ShowButtonB && <div
                    className={`action-button b ${isBActive ? "active" : ""}`}
                    onPointerDown={bHandlers.down}
                    onPointerUp={bHandlers.up}
                    onPointerCancel={bHandlers.up}
                >
                    B
                </div> }
            </div>
        </div>
    );
};
