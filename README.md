# PropertyDistanceAttractor

PropertyDistanceAttractor is a behavior class for BabylonJS that adds numeric
values interpolation by the distance between target and attractor.

In this example the target is animated camera, and attractor is the red cube. When the camera is close to the cube, the behavior class increase the camera shake amplitude. The amplitude is equal to zero by default, and increase when distance between camera and attractor is less than 5, and when distance is less than 1 the amplitude has maximum value.

![Example](docs/example.mp4)

## Installation

To install PropertyDistanceAttractor, simply run:

```bash
npm install property-distance-attractor
```

## Usage

Here's an example of how to use PropertyDistanceAttractor:

```ts
import { PropertyDistanceAttractor } from 'property-distance-attractor';
import { SceneLoader } from '@babylonjs/core';


SceneLoader.Append('/assets/', 'myScene.gltf', this.scene, scene => {
  // Find a camera
  const myCam = scene.getCameraByName('myCam');

  
  // Find an attractor
  const myAttractor = scene.getMeshByName('myAttractor');

  
  // Define any updatable object
  const myObject: CameraShakeOptions = {
    amplitude: 0,
  };

  
  if (myCam && myAttractor) {
    // Attach behavior to attractor
    const propertyDistanceAttractor = new PropertyDistanceAttractor({
      distance: [1, 5],
      target: animatableNode as unknown as TransformNode,
      closest: {
        amplitude: new Vector3(0, 10, 0),
      },
      farthest: {
        amplitude: new Vector3(0, 0, 0),
      },
      updatableValue: cameraShakeOptions,
    });
    myAttractor.addBehavior(propertyDistanceAttractor);
  }
});
```

Also, you can subscribe to update event:

```ts
propertyDistanceAttractor.onUpdate.add((value: CameraShakeOptions) => {
  console.log('onUpdate:', value.amplitude.y);
});
```

And optionally you can define an interface of working object in the generic type:

```ts
const propertyDistanceAttractor = new PropertyDistanceAttractor<CameraShakeOptions>({
  // ...
});
```

## Options

- `distance` - Defines the distance range between attractor and target.
- `target` - The target object, distance is calculated from this object to attractor.
- `closest` - An object or a value that uses when distance is closest to attractor.
- `farthest` - An object or a value that uses when distance is farthest to attractor.
- `updatableValue` - An object that has updatable values.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please
follow the standard Gitflow workflow and submit a pull request.

## Relative resources

- [Babylon.js](https://www.babylonjs.com/)
- [Behaviors](https://doc.babylonjs.com/features/featuresDeepDive/behaviors)
- [Interesting examples of BabylonJS usage](https://yuka.babylonpress.org/examples/)
