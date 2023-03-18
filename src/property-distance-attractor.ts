import { Behavior } from '@babylonjs/core/Behaviors/behavior';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Observable } from '@babylonjs/core/Misc/observable';
import { Nullable } from '@babylonjs/core/types';


type IndexedObject = { [index: string]: any };


export interface PropertyAttractorOptions<T> {
  /**
   * Distance limits from the target [closest, farthest].
   * When distance between target and current node less than the closest distance
   * the applied value is equal to the closest value.
   * When distance between target and current node more than the farthest distance
   * the applied value is equal to the farthest value.
   * When distance between target and current node between the closest and farthest distances
   * the applied value is calculated as linear interpolation between the closest and farthest values.
   */
  distance: [number, number];
  target: TransformNode;
  closest: T;
  farthest: T;
  /**
   * If object is passed then it will be updated with the current value.
   */
  updatableValue?: T;
}


export class PropertyDistanceAttractor<T extends (number | IndexedObject)> implements Behavior<TransformNode> {
  public readonly name = 'PropertyAttractor';
  public isEnable = true;
  public onUpdate = new Observable<T>();

  private target: Nullable<TransformNode> = null;
  private options: PropertyAttractorOptions<T>;
  private previousDistance: number = Infinity;


  constructor(options: PropertyAttractorOptions<T>) {
    this.options = options;
  }


  public init(): void {}


  public attach(target: TransformNode): void {
    this.target = target;

    this.target.getScene().onBeforeRenderObservable.add(this.update);
  }


  public detach(): void {
    this.target = null;
  }


  private update = (): void => {
    if (!this.isEnable || !this.target) {
      return;
    }

    const currentTargetPosition = this.target.getAbsolutePosition();
    const optionsTargetPosition = this.options.target.getAbsolutePosition();

    const distance = currentTargetPosition.subtract(optionsTargetPosition).length();
    if (distance === this.previousDistance) {
      return;
    }

    let currentValue: T;

    if (distance <= this.options.distance[0]) {
      currentValue = this.options.closest;

    } else if (distance >= this.options.distance[1]) {
      currentValue = this.options.farthest;

    } else {
      const t = (distance - this.options.distance[0]) / (this.options.distance[1] - this.options.distance[0]);
      currentValue = this.lerp(this.options.closest, this.options.farthest, t) as T;
    }

    this.updateUpdatableValue(currentValue);

    this.onUpdate.notifyObservers(currentValue);

    this.previousDistance = distance;
  };


  private updateUpdatableValue(value: T): void {
    if (!this.options.updatableValue) {
      return;
    }

    if (typeof value === 'number') {
      (this.options.updatableValue as number) = value;
    } else {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          if (value[key] instanceof Vector3 && (this.options.updatableValue as IndexedObject)[key] instanceof Vector3) {
            (this.options.updatableValue as IndexedObject)[key].copyFrom(value[key]);
          } else {
            (this.options.updatableValue as IndexedObject)[key] = value[key];
          }
        }
      }
    }
  }


  private lerp(
    a: number | IndexedObject | Vector3,
    b: number | IndexedObject | Vector3,
    t: number,
  ): number | { [index: string]: any } {
    if (typeof a === 'number' && typeof b === 'number') {
      return a + t * (b - a);

    } else if (a instanceof Vector3 && b instanceof Vector3) {
      return Vector3.Lerp(a, b, t);

    } else if (typeof a === 'object' && typeof b === 'object') {
      const result: Record<string, any> = {};

      for (const key in a) {
        if (a.hasOwnProperty(key) && b.hasOwnProperty(key) && !key.startsWith('_')) {
          result[key] = this.lerp((a as IndexedObject)[key], (b as IndexedObject)[key], t);
        }
      }

      return result;
    }

    throw new Error('Invalid input types for lerp method');
  }
}
