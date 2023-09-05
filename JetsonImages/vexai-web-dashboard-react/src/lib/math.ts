/* eslint-disable @typescript-eslint/no-namespace */

export namespace Units {
  const d2r = Math.PI / 180;
  const r2d = 180 / Math.PI;

  /**
   *
   * @param a
   * @param b
   * @returns
   */
  export const fmod = (a: number, b: number): number => {
    return Number((a - Math.floor(a / b) * b).toPrecision(8));
  };

  /**
   *
   * @param degrees
   * @returns
   */
  export const deg2rad = (degrees: number): number => {
    return degrees * d2r;
  };

  /**
   *
   * @param radians
   * @returns
   */
  export const rad2deg = (radians: number): number => {
    return radians * r2d;
  };

  /**
   *
   * @param r
   * @returns
   */
  export const rotation = (r: number) => {
    if (r < 0) {
      return r + 360;
    }
    return r;
  };
}

export namespace Distance {
  /**
   *
   */
  export interface DistanceFn {
    (
      v1: { x: number; y: number; z: number },
      v2: { x: number; y: number; z: number }
    ): number;
  }

  /**
   *
   * @param v1
   * @param v2
   * @returns
   */
  export const L2 = (
    v1: { x: number; y: number; z: number },
    v2: { x: number; y: number; z: number }
  ): number => {
    return Math.sqrt(
      Math.pow(v2.x - v1.x, 2) +
        Math.pow(v2.y - v1.y, 2) +
        Math.pow(v2.z - v1.z, 2)
    );
  };

  /**
   *
   * @param v1
   * @param v2
   * @returns
   */
  export const L1 = (
    v1: { x: number; y: number; z: number },
    v2: { x: number; y: number; z: number }
  ): number => {
    return (
      Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y) + Math.abs(v1.z - v2.z)
    );
  };
}

export namespace Vector {
  /**
   *
   */
  export interface Vector2D {
    x: number;
    y: number;
  }

  /**
   *
   * @param v1
   * @param v2
   * @returns
   */
  export const dot = (v1: Vector2D, v2: Vector2D): number => {
    return v1.x * v2.x + v1.y * v2.y;
  };

  /**
   *
   * @param v
   * @returns
   */
  export const magnitude = (v: Vector2D): number => {
    return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
  };

  /**
   *
   * @param v
   * @param degrees
   * @returns
   */
  export const rotate = (v: Vector2D, degrees: number): Vector2D => {
    const theta = Units.deg2rad(degrees);

    const cs = Math.round(1000 * Math.cos(theta)) / 1000;
    const sn = Math.round(1000 * Math.sin(theta)) / 1000;

    return {
      x: v.x * sn + v.y * cs,
      y: v.x * cs - v.y * sn,
    };
  };

  /**
   *
   * @param v1
   * @param v2
   * @returns
   */
  export const angleBetween = (v1: Vector2D, v2: Vector2D): number => {
    return Math.acos(dot(v1, v2) / (magnitude(v1) * magnitude(v2)));
  };
}
