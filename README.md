# ipad-device-orientation

`ipad-device-orientation` is a React hook package that allows reading iPad device orientation accurately (yaw, pitch, roll).  
It is designed to handle all 4 iPad screen rotations and compensates for sign changes in beta and gamma angles, providing horizon-relative pitch and roll values.

---

## Features

- Provides yaw, pitch, and roll angles in degrees.
- Supports all 4 iPad orientations:
    - Portrait
    - Portrait upside-down
    - Landscape-left
    - Landscape-right
- Horizon-relative pitch and roll calculation.
- Optional yaw reset.
- Ready-to-use example component: `OrientationPanel`.

---

## Installation

```bash
npm install ipad-device-orientation
```

or using yarn:

```bash
yarn add ipad-device-orientation
```

---

## Hook Usage

```tsx
import React from 'react';
import { useDeviceOrientation } from 'ipad-device-orientation';

const MyComponent = () => {
  const { yaw, pitch, roll, resetYaw, permissionGranted, requestPermission } = useDeviceOrientation();

  return (
    <div>
      {!permissionGranted ? (
        <button onClick={requestPermission}>Enable Orientation</button>
      ) : (
        <div>
          <div>Yaw: {yaw.toFixed(1)}°</div>
          <div>Pitch: {pitch.toFixed(1)}°</div>
          <div>Roll: {roll.toFixed(1)}°</div>
          <button onClick={resetYaw}>Reset Yaw</button>
        </div>
      )}
    </div>
  );
};
```

**Notes on values:**

- **Pitch:** horizon = 0°, looking down = -90°, looking up = 90°.
- **Roll:** horizontal tilt relative to horizon. Small tilts give accurate roll.
- **Yaw:** based on device alpha with optional offset. Reflects compass heading.

---

## Full Example

A sample is available at the github page of this project that illustrates how to wire the hook in an React application

---

## Using DeviceOrientationProvider (React Context)
If your app has multiple components that need device orientation, or if you’re using a router-based application, calling the hook separately in each component may not be ideal. Instead, it can be more convenient to use a context provider. This approach ensures that orientation is tracked once and the values are shared across all components, simplifying your code and preventing multiple event listeners.

**Example:**
```typescript
// App.tsx
import React from "react";
import { DeviceOrientationProvider } from "ipad-device-orientation";
import { OrientationPanel } from "./components/OrientationPanel";
import { AnotherComponent } from "./components/AnotherComponent";

// Wrapp with DeviceOrientationProvider any component that may require orientation
const App: React.FC = () => {
  return (
          <DeviceOrientationProvider>
            <OrientationPanel />
            <AnotherComponent />
          </DeviceOrientationProvider>
  );
};

export default App;
```
**Consuming the Context**
```typescript
import React from "react";
import { useDeviceOrientationContext } from "ipad-device-orientation";

export const AnotherComponent: React.FC = () => {
  const { yaw, pitch, roll, resetYaw, permissionGranted, requestPermission } =
    useDeviceOrientationContext();

  return (
    <div>
      <h3>Device Orientation:</h3>
      <div>Yaw: {yaw.toFixed(1)}°</div>
      <div>Pitch: {pitch.toFixed(1)}°</div>
      <div>Roll: {roll.toFixed(1)}°</div>
      {!permissionGranted && (
        <button onClick={requestPermission}>Enable Orientation</button>
      )}
      <button onClick={resetYaw}>Reset Yaw</button>
    </div>
  );
};
```
**Benefits**

- Single source of truth: Orientation is tracked only once, even if multiple components consume the context.
- Persistent state: On iOS, device orientation events require explicit user permission. Once granted, the context remains active across navigation, so components do not need to request permission again.
- Cleaner code: Components can consume orientation values from the context without each calling useDeviceOrientation individually, reducing duplication and multiple event listeners.

## iOS HTTPS Requirement

On iOS devices, device orientation events **require HTTPS**.  
Attempting to use the hook on HTTP or file:// will not trigger permission requests.

---

## Device Orientation Behavior

- **Beta:** tilts front/back; changes with gamma when device near vertical.
- **Gamma:** tilts left/right; flips sign at ±90° when device is near vertical.
- **Alpha:** compass heading; affected by gamma and beta at extreme tilts.
- All calculations are adjusted for screen rotation.

---

## Limitations

- GPS or WebXR is not required or used; hook is based on device sensors only.
- On older iPads, slight inaccuracies may occur near vertical or extreme tilts.
- Works best when device is held reasonably level for pitch/roll accuracy.

---

## License

MIT
