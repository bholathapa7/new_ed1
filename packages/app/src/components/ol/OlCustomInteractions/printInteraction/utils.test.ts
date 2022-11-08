/* eslint-disable no-magic-numbers, max-lines */
import { vec2 } from 'gl-matrix';
import { Coordinate } from 'ol/coordinate';
import {
  createDiagonalSquare,
  getClosestPointFromLine,
  getClosestPointFromRect,
  getFarthestPointFromLine,
  getInsidePoints,
  getIntersectingBoundLines,
  getLineIntersection,
  getMaxAllowedRect,
  getNextPoint,
  getPrevPoint,
  getRelativeAngle,
  getRotatePoint,
  getScaleRatio,
  getScaledRect,
  getSortedRect,
  isPointInsideRect,
  radToDeg,
  toCoordinate,
  toVec2,
} from './utils';

describe('printInteraction utils', () => {
  describe('createDiagonalSquare', () => {
    test('Should return a diagonal square', () => {
      expect(
        createDiagonalSquare(0, 0, 10),
      ).toEqual([
        [0, 0],
        [14.142135620117188, 14.142135620117188],
        [28.284271240234375, 0],
        [14.142135620117188, -14.142135620117188],
      ].map(toVec2));
    });
  });

  describe('getClosestPointFromLine', () => {
    describe('When given point is somewhere outside of the start of the line', () => {
      test('Should return with the start point of the line', () => {
        expect(
          getClosestPointFromLine(
            toVec2([-2, 5]),
            toVec2([0, 5]),
            toVec2([10, 15]),
          ),
        ).toEqual(toVec2([0, 5]));
      });
    });

    describe('When given point somewhere outside of the end of the line', () => {
      test('Should return with the end point of the line', () => {
        expect(
          getClosestPointFromLine(
            toVec2([12, 15]),
            toVec2([0, 5]),
            toVec2([10, 15]),
          ),
        ).toEqual(toVec2([10, 15]));
      });
    });

    describe('When given point is somewhere parallel to the line', () => {
      test('Should return ', () => {
        expect(
          getClosestPointFromLine(
            toVec2([8, 2]),
            toVec2([0, 5]),
            toVec2([10, 15]),
          ),
        ).toEqual(toVec2([2.5, 7.5]));
      });
    });
  });

  describe('getClosestPointFromRect', () => {
    test('Should be able to get the closest point from rect', () => {
      const points: vec2[] = [
        [0, 8],
        [16, 8],
        [16, 0],
        [0, 0],
      ].map(toVec2);

      // Point outside rect
      expect(
        getClosestPointFromRect(toVec2([9, 12]), points),
      ).toEqual(toVec2([16, 8]));

      // Point inside rect
      expect(
        getClosestPointFromRect(toVec2([8, 7]), points),
      ).toEqual(toVec2([0, 8]));
    });
  });

  describe('getFarthestPointFromLine', () => {
    test('Should be able to get the correct farthest point', () => {
      const points: vec2[] = [
        [0, 0],
        [2, 14],
        [4, 18],
        [3, 16],
      ].map(toVec2);

      // Diagonal line
      expect(
        getFarthestPointFromLine(points, toVec2([0, 0]), toVec2([20, 20])),
      ).toEqual(toVec2([11, 11]));

      // Straight line
      expect(
        getFarthestPointFromLine(points, toVec2([0, 0]), toVec2([0, 20])),
      ).toEqual(toVec2([0, 18]));
    });
  });

  describe('getInsidePoints', () => {
    describe('When the rectangles are not intersecting', () => {
      test('Should return an empty array', () => {
        const rect1: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const rect2: vec2[] = [
          [100, 100],
          [260, 100],
          [260, 20],
          [100, 20],
        ].map(toVec2);

        expect(
          getInsidePoints(rect1, rect2),
        ).toEqual([]);
      });
    });

    describe('When the rectangles are intersecting', () => {
      test('Should return all intersecting points from the two rects', () => {
        const rect1: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const rect2: vec2[] = [
          [10, 10],
          [26, 10],
          [26, 2],
          [10, 2],
        ].map(toVec2);

        expect(
          getInsidePoints(rect1, rect2),
        ).toEqual([
          [16, 8],
        ].map(toVec2));
      });
    });
  });

  describe('getIntersectingBoundLines', () => {
    describe('When the rectangles are not intersecting', () => {
      test('Should return an empty array', () => {
        const rect1: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const rect2: vec2[] = [
          [100, 100],
          [260, 100],
          [260, 20],
          [100, 20],
        ].map(toVec2);

        expect(
          getIntersectingBoundLines(rect1, rect2),
        ).toEqual([]);
      });
    });

    describe('When the rectangles are intersecting', () => {
      test('Should return all intersecting points from the two rects', () => {
        const rect1: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const rect2: vec2[] = [
          [10, 10],
          [26, 10],
          [26, 2],
          [10, 2],
        ].map(toVec2);

        expect(
          getIntersectingBoundLines(rect1, rect2),
        ).toEqual([
          [10, 8],
          [16, 2],
        ].map(toVec2));
      });
    });
  });

  describe('getLineIntersection', () => {
    describe('When the lines have no length', () => {
      test('Should return null', () => {
        expect(
          getLineIntersection(
            toVec2([0, 0]), toVec2([0, 0]),
            toVec2([0, 0]), toVec2([0, 10]),
          ),
        ).toBe(null);

        expect(
          getLineIntersection(
            toVec2([0, 0]), toVec2([0, 10]),
            toVec2([0, 0]), toVec2([0, 0]),
          ),
        ).toBe(null);
      });
    });

    describe('When the lines have no intersection', () => {
      test('Should return null', () => {
        expect(
          getLineIntersection(
            toVec2([5, 0]), toVec2([5, 10]),
            toVec2([0, 0]), toVec2([0, 10]),
          ),
        ).toBe(null);
      });
    });

    describe('When the lines intersect', () => {
      test('Should return the intersection point', () => {
        expect(
          getLineIntersection(
            toVec2([0, 10]), toVec2([10, 0]),
            toVec2([0, 0]), toVec2([10, 10]),
          ),
        ).toEqual(toVec2([5, 5]));
      });
    });
  });

  describe('getMaxAllowedRect', () => {
    describe('When the rectangle is inside allowed rectangle', () => {
      test('Should return the unmodified rectangle, since it is allowed', () => {
        const allowed: vec2[] = [
          [0, 8],
          [16, 8],
          [16, -12],
          [0, -12],
        ].map(toVec2);

        const rect: vec2[] = [
          [5, 5],
          [7, 5],
          [7, 7],
          [5, 7],
        ].map(toVec2);

        expect(
          getMaxAllowedRect(rect, allowed),
        ).toEqual(rect);
      });
    });

    describe('When the rectangle has one corner outside of allowed rectangle', () => {
      test('Should return the unmodified rectangle, since it is allowed', () => {
        const allowed: vec2[] = [
          [0, 8],
          [16, 8],
          [16, -12],
          [0, -12],
        ].map(toVec2);

        // This diagonal square has one corner outside of the bounds.
        const rect: vec2[] = createDiagonalSquare(5, 5, 3);

        expect(
          getMaxAllowedRect(rect, allowed),
        ).toEqual(rect);
      });
    });

    describe('When the rectangle is outside of the allowed bounds as a whole', () => {
      test('Should return null', () => {
        const allowed: vec2[] = [
          [0, 8],
          [16, 8],
          [16, -12],
          [0, -12],
        ].map(toVec2);

        const rect: vec2[] = [
          [40, 80],
          [40, 88],
          [35, 88],
          [35, 80],
        ].map(toVec2);

        expect(
          getMaxAllowedRect(rect, allowed),
        ).toEqual(null);
      });
    });

    describe('When it has at least one rectangle corner inside the allowed rectangle', () => {
      test('Should return the shaped rectangle', () => {
        const allowed: vec2[] = [
          [0, 8],
          [16, 8],
          [16, -12],
          [0, -12],
        ].map(toVec2);

        const rect: vec2[] = [
          [2, 6],
          [-10, 6],
          [-10, 10],
          [2, 10],
        ].map(toVec2);

        expect(
          getMaxAllowedRect(rect, allowed),
        ).toEqual([
          [2, 6],
          [0, 6],
          [1.1102230246251565e-16, 8],
          [2, 8],
        ].map(toVec2));
      });
    });

    describe('When it has at no rectangle corner inside the allowed rectangle', () => {
      describe('And the custom anchor is not provided', () => {
        test('Should use the closest corner create to the shaped rectangle', () => {
          const allowed: vec2[] = [
            [0, 8],
            [16, 8],
            [16, -12],
            [0, -12],
          ].map(toVec2);

          const rect: vec2[] = createDiagonalSquare(-2, 10, 40);

          expect(
            getMaxAllowedRect(rect, allowed),
          ).toEqual([
            [-2, 10],
            [6, 18],
            [24, -1.7763568394002505e-15],
            [16, -8],
          ].map(toVec2));
        });
      });

      describe('And the custom anchor is provided', () => {
        test('Should use the anchor to create to the shaped rectangle', () => {
          const allowed: vec2[] = [
            [0, 8],
            [16, 8],
            [16, -12],
            [0, -12],
          ].map(toVec2);

          const rect: vec2[] = createDiagonalSquare(-2, 10, 40);

          expect(
            getMaxAllowedRect(rect, allowed, toVec2([6, 18])),
          ).toEqual([
            [-2, 10],
            [6, 18],
            [24, -1.7763568394002505e-15],
            [16, -8],
          ].map(toVec2));
        });
      });
    });
  });

  describe('getNextPoint', () => {
    describe('When the rectangle has no coordinates', () => {
      test('Should throw error', () => {
        expect(() => {
          getNextPoint([], toVec2([1, 1]));
        }).toThrow('Provided coordinates must have length.');
      });
    });

    describe('When the rectangle has coordinates', () => {
      test('Should be able to get the previous point in a rectangle', () => {
        const rect: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        expect(
          getNextPoint(rect, toVec2([0, 0])),
        ).toEqual(toVec2([0, 8]));

        expect(
          getNextPoint(rect, toVec2([0, 8])),
        ).toEqual(toVec2([16, 8]));
      });
    });
  });

  describe('getPrevPoint', () => {
    describe('When the rectangle has no coordinates', () => {
      test('Should throw error', () => {
        expect(() => {
          getPrevPoint([], toVec2([1, 1]));
        }).toThrow('Provided coordinates must have length.');
      });
    });

    describe('When the rectangle has coordinates', () => {
      test('Should be able to get the previous point in a rectangle', () => {
        const rect: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        expect(
          getPrevPoint(rect, toVec2([0, 0])),
        ).toEqual(toVec2([16, 0]));

        expect(
          getPrevPoint(rect, toVec2([0, 8])),
        ).toEqual(toVec2([0, 0]));
      });
    });
  });

  describe('getRelativeAngle', () => {
    test('Should be able to get relative angle from a given point', () => {
      const center: vec2 = [2, 2];

      const nPoint: vec2 = toVec2([2, 10]);
      expect(getRelativeAngle(nPoint, center)).toBe(0);

      const nnePoint: vec2 = toVec2([7.656854152679443, 7.656854152679443]);
      expect(getRelativeAngle(nnePoint, center)).toBe(Math.PI / 4);

      const swPoint: vec2 = toVec2([-6, 2]);
      expect(getRelativeAngle(swPoint, center)).toBe(-Math.PI / 2);
    });
  });

  describe('getRotatePoint', () => {
    describe('When angle is not provided', () => {
      test('Should be able to get the rotate point', () => {
        const coords: vec2[] = [
          [-6, 2],
          [0, 8],
          [10, 0],
          [16, 6],
        ].map(toVec2);

        expect(
          getRotatePoint(coords, 2.5),
        ).toEqual(toVec2([-42.39308547973633, 36.547698974609375]));
      });
    });

    describe('When angle is provided', () => {
      test('Should be able to get the same rotate point', () => {
        const coords: vec2[] = [
          [-6, 2],
          [0, 8],
          [10, 0],
          [16, 6],
        ].map(toVec2);

        expect(
          getRotatePoint(coords, 2.5, -0.8960553845713439),
        ).toEqual(toVec2([-42.39308547973633, 36.547698974609375]));
      });
    });
  });

  describe('getScaleRatio', () => {
    test('Should be able to get the correct scale ratio', () => {
      const width: number = 8;
      const height: number = 10;
      const center: vec2 = toVec2([3, 3]);
      const angle: number = Math.PI / 2;

      // Scaling to make both axes smaller.
      const start1: vec2 = toVec2([0, 5]);
      const point1: vec2 = toVec2([1, 3]);
      expect(
        getScaleRatio({
          width, height, center, angle,
          start: start1, point: point1,
        }),
      ).toEqual([0.75, 0.9]);

      // Scaling to make both axes bigger.
      const start2: vec2 = toVec2([0, 4]);
      const point2: vec2 = toVec2([-1, 10]);
      expect(
        getScaleRatio({
          width, height, center, angle,
          start: start2, point: point2,
        }),
      ).toEqual([1.75, 1.1]);
    });
  });


  describe('getScaledRect', () => {
    describe('When the scale anchor is at the corner', () => {
      test('Should be able to rotate the coordinates accordingly', () => {
        const coords: vec2[] = [
          [1, 8],
          [4, 8],
          [4, 1],
          [1, 1],
        ].map(toVec2);

        const output: vec2[] = getScaledRect({
          coords,
          // Anchor is at the first coordinate.
          anchor: coords[0],
          angle: Math.PI / 4,
          scaleX: 5,
          scaleY: 4.5,
        });

        getScaledRect({
          coords,
          // Anchor is at the first coordinate.
          anchor: coords[0],
          angle: Math.PI / 4,
          scaleX: 5,
          scaleY: 4.5,
        });

        expect(output).toEqual([
          // Since the anchor is the first coordinate,
          // it doesn't change.
          [1, 8],
          [15.25, 7.249999523162842],
          [17, -26],
          [2.7500007152557373, -25.25],
        ].map(toVec2));
      });
    });

    describe('When the scale anchor is at other point', () => {
      test('Should be able to rotate the coordinates accordingly', () => {
        const coords: vec2[] = [
          [1, 8],
          [4, 8],
          [4, 1],
          [1, 1],
        ].map(toVec2);

        const output: vec2[] = getScaledRect({
          coords,
          // Anchor is at the center.
          anchor: vec2.lerp(vec2.create(), coords[0], coords[2], 0.5),
          angle: Math.PI / 2,
          scaleX: 5,
          scaleY: 4.5,
        });

        expect(output).toEqual([
          // All coordinates change since it grows from center.
          [-4.25, 22],
          [9.25, 22],
          [9.25, -13],
          [-4.25, -13],
        ].map(toVec2));
      });
    });
  });

  describe('getSortedRect', () => {
    describe('When rect and original rect does not align in any corner', () => {
      test('Should throw error', () => {
        const rect: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const originalRect: vec2[] = [
          [1, 8],
          [20, 8],
          [20, -2],
          [0, -2],
        ].map(toVec2);

        expect(() => {
          getSortedRect(rect, originalRect);
        }).toThrow('Unable to find the correct sorted points.');
      });
    });

    describe('When rect and the original rect has the same angle', () => {
      test('Should return an identical rect with the source', () => {
        const rect: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const originalRect: vec2[] = [
          [0, 8],
          [20, 8],
          [20, -2],
          [0, -2],
        ].map(toVec2);

        expect(
          getSortedRect(rect, originalRect),
        ).toEqual(rect);
      });
    });

    describe('When rect is 90 degrees in rotation compared to the original rect', () => {
      test('Should return the correct sorted rect', () => {
        const rect: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const originalRect: vec2[] = [
          [16, 8],
          [16, -2],
          [0, -2],
          [0, 8],
        ].map(toVec2);

        expect(
          getSortedRect(rect, originalRect),
        ).toEqual([
          [16, 8],
          [16, 0],
          // This is technically 0...
          // but rounding isn't really an option since
          // it's for accuracy.
          [0, 8.881784197001252e-16],
          [0, 8],
        ].map(toVec2));
      });
    });

    describe('When rect is 180 degrees in rotation compared to the original rect', () => {
      test('Should return the correct sorted rect', () => {
        const rect: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const originalRect: vec2[] = [
          [16, 0],
          [0, 0],
          [0, 8],
          [16, 8],
        ].map(toVec2);

        expect(
          getSortedRect(rect, originalRect),
        ).toEqual([
          [16, 0],
          [0, 0],
          [8.881784197001252e-16, 8],
          [16, 8],
        ].map(toVec2));
      });
    });

    describe('When rect is -90 degrees in rotation compared to the original rect', () => {
      test('Should return the correct sorted rect', () => {
        const rect: vec2[] = [
          [0, 8],
          [16, 8],
          [16, 0],
          [0, 0],
        ].map(toVec2);

        const originalRect: vec2[] = [
          [0, 0],
          [0, 8],
          [16, 8],
          [16, 0],
        ].map(toVec2);

        expect(
          getSortedRect(rect, originalRect),
        ).toEqual([
          [0, 0],
          [0, 8],
          [16, 8],
          [16, 0],
        ].map(toVec2));
      });
    });
  });

  describe('isPointInsideRect', () => {
    test('Should be able to return if point is inside or out', () => {
      const rect1: vec2[] = [
        [0, 8],
        [16, 8],
        [16, 0],
        [0, 0],
      ].map(toVec2);

      expect(
        isPointInsideRect(rect1, toVec2([5, 5])),
      ).toBe(true);

      expect(
        isPointInsideRect(rect1, toVec2([-2, -2])),
      ).toBe(false);
    });
  });

  describe('radToDeg', () => {
    test('Should convert radians to degrees', () => {
      expect(radToDeg(0)).toBe(0);
      expect(radToDeg(-2.54)).toBeCloseTo(-145.53);
      expect(radToDeg(1.5708)).toBeCloseTo(90);
    });
  });

  describe('toCoordinate', () => {
    test('Should convert vec2 to coordinate (array)', () => {
      const vec: vec2 = vec2.fromValues(1, 2);
      expect(toCoordinate(vec)).toBeInstanceOf(Array);
    });
  });

  describe('toVec2', () => {
    test('Should convert coordinate to vec2', () => {
      const coord: Coordinate = [1, 2];
      expect(toVec2(coord)).toBeInstanceOf(Float32Array);
    });
  });
});
