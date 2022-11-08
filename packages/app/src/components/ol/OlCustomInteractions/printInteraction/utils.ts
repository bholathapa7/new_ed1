/* eslint-disable max-lines */
import { mat2d, vec2 } from 'gl-matrix';
import { Coordinate } from 'ol/coordinate';

const HALF: number = 0.5;
const MIN_RATIO: number = 0.01;
const ROTATE_MARGIN_Y: number = 20;
const HALF_ROTATION_DEGREE: number = 180;

/**
 * Converts radians to degree.
 *
 * @param angle - angle in radians.
 */
export const radToDeg: (angle: number) => number = (
  angle,
) => angle * HALF_ROTATION_DEGREE / Math.PI;

/**
 * Converts coordinate to vec2.
 *
 * @param coord - coordinate.
 */
export const toVec2: (coord: Coordinate) => vec2 = (
  coord,
) => vec2.fromValues.apply(null, coord);

/**
 * Converts vec2 to coordinate.
 *
 * @param vec - vec2.
 */
export const toCoordinate: (vec: vec2) => Coordinate = (
  vec,
) => ([vec[0], vec[1]]);

/**
 * Given points, find the farthest coordinate that falls into the line.
 *
 * @param points
 * @param l1 - first point of the line.
 * @param l2 - second point of the line.
 */
export const getFarthestPointFromLine: (points: vec2[], l1: vec2, l2: vec2) => vec2 = (
  points, l1, l2,
) => points.reduce((point: vec2, current: vec2) => {
  const closestPoint: vec2 = getClosestPointFromLine(current, l1, l2);

  // Keep the point that is still the farthest among all.
  const prevDist: number = vec2.dist(l1, point);
  const dist: number = vec2.dist(l1, closestPoint);

  return dist > prevDist ? closestPoint : point;
}, l1);

/**
 * Given points of rectangle, get the closest rectangle corner
 * to the given point.
 *
 * @param point - the point used as reference.
 * @param rect - the rectangle to test.
 */
export const getClosestPointFromRect: (point: vec2, rect: vec2[]) => vec2 = (
  point, rect,
) => rect.reduce((p, current) => {
  const prevDist: number = vec2.dist(point, p);
  const dist: number = vec2.dist(point, current);

  return dist < prevDist ? current : p;
}, rect[0]);

/**
 *
 * Get the sorted rectangle points with the northwest point at its start.
 *
 * @param rect - The unsorted rectangle points.
 * @param originalRect - The original rectangle points before transformation.
 */
export const getSortedRect: (rect: vec2[], originalRect: vec2[]) => vec2[] = (
  rect, originalRect,
) => {
  const [start, next, mirroredStart, prev]: vec2[] = rect;
  const [originalNw, originalNe, originalSe, originalSw]: vec2[] = originalRect;

  // No need to proceed if it's indeed the correct order.
  if (vec2.equals(start, originalNw)) {
    return rect;
  }

  let nw: vec2 | undefined;
  let ne: vec2 | undefined;
  let sw: vec2 | undefined;

  // Depending on the position of the current start point with the original rectangle position,
  // define which should be the starting point and its adjacent points.
  if (vec2.dist(start, originalNw) === vec2.dist(originalNw, originalSw)) {
    nw = next;
    ne = mirroredStart;
    sw = start;
  } else if (vec2.dist(start, originalNw) === vec2.dist(originalNw, originalNe)) {
    nw = prev;
    ne = start;
    sw = mirroredStart;
  } else if (vec2.dist(start, originalNw) === vec2.dist(originalNw, originalSe)) {
    nw = mirroredStart;
    ne = prev;
    sw = next;
  }

  // Chances are, somehow the rect is not actually derived
  // from the original rect, i.e. it doesn't share any common corners
  // It might not happen, but if it does it needs to be looked into.
  if (!nw || !ne || !sw) {
    throw new Error('Unable to find the correct sorted points.');
  }

  const center: vec2 = vec2.lerp(vec2.create(), start, mirroredStart, HALF);

  return [
    nw,
    ne,
    vec2.rotate(vec2.create(), nw, center, Math.PI),
    sw,
  ];
};

/**
 * Given a rectangle and another rectangle that acts as the allowed rectangle,
 * find the maximum possible rectangle from its intersection.
 * The original rectangle is returned upon the inability to find the maximum rectangle.
 *
 * @param rect
 * @param allowedRect
 */
export const getMaxAllowedRect: (rect: vec2[], allowedRect: vec2[], customAnchor?: vec2) => vec2[] | null = (
  rect, allowedRect, customAnchor,
) => {
  const insideRect: vec2[] = getInsidePoints(rect, allowedRect);

  // At most three of the inside rect points is allowed without modification.
  if (insideRect.length === rect.length || insideRect.length + 1 === rect.length) {
    return rect;
  }

  // Get the corners of the allowed rect against the current rect,
  // and all intersecting points to build the allowed polygon.
  const insideAllowedRect: vec2[] = getInsidePoints(allowedRect, rect);
  const intPoints: vec2[] = getIntersectingBoundLines(rect, allowedRect);
  const allowedPolygon: vec2[] = insideAllowedRect.concat(intPoints);

  // When the rectangle is outside of the bounds as a whole,
  // it is not possible to "guess" where the user would want the rect to be,
  // therefore return null, failing to create the maximum allowed rectangle.
  if (allowedPolygon.length === 0) {
    return null;
  }

  let anchor: vec2 | undefined;

  // Prioritize choosing the anchor from the corners that are already inside,
  // otherwise pick one from the outside corners.
  if (insideRect.length === 0) {
    // To find the closest outside corners,
    // the idea is to compare all outside corners with a reference,
    // either it's the custom anchor or the center of the allowed boundaries.
    // This would ensure the generated rect can cover the most of the allowed boundaries.
    const closestAllowedPoint: vec2 = customAnchor !== undefined
      ? customAnchor : vec2.lerp(vec2.create(), allowedRect[0], allowedRect[2], HALF);

    anchor = getClosestPointFromRect(closestAllowedPoint, rect);
  } else {
    anchor = insideRect[0];
  }

  // To create a rectangle, it needs to have at least three points,
  // which is the previous and the next point of the anchor from a rectangle.
  const prevAnchor: vec2 = getPrevPoint(rect, anchor);
  const nextAnchor: vec2 = getNextPoint(rect, anchor);

  // Get the maximum distance of the allowed polygon points and the two axes from the anchor.
  const prevMaxPoint: vec2 = getFarthestPointFromLine(allowedPolygon, anchor, prevAnchor);
  const nextMaxPoint: vec2 = getFarthestPointFromLine(allowedPolygon, anchor, nextAnchor);

  // The last point in the rectangle is just the point across the anchor,
  // which can be done by rotating it once the center is found.
  const center: vec2 = vec2.lerp(vec2.create(), prevMaxPoint, nextMaxPoint, HALF);
  const mirroredAnchor: vec2 = vec2.rotate(vec2.create(), anchor, center, Math.PI);

  return [anchor, nextMaxPoint, mirroredAnchor, prevMaxPoint];
};

/**
 * Given the cyclic order of the points in a rectangle,
 * find the point next to the provided point.
 *
 * @param rect
 * @param point
 */
export const getPrevPoint: (rect: vec2[], point: vec2) => vec2 = (
  rect, point,
) => {
  if (rect.length === 0) {
    throw new Error('Provided coordinates must have length.');
  }

  let prevPoint: vec2 = vec2.create();
  for (let i: number = 0; i < rect.length; i++) {
    const current: vec2 = rect[i];

    if (vec2.equals(point, current)) {
      prevPoint = rect[i - 1] ?? rect[rect.length - 1];
      break;
    }
  }

  return prevPoint;
};

/**
 * Given the cyclic order of the points in a rectangle,
 * find the point previous to the provided point.
 *
 * @param rect
 * @param point
 */
export const getNextPoint: (rect: vec2[], point: vec2) => vec2 = (
  rect, point,
) => {
  if (rect.length === 0) {
    throw new Error('Provided coordinates must have length.');
  }

  let nextPoint: vec2 = [0, 0];
  for (let i: number = 0; i < rect.length; i++) {
    const current: vec2 = rect[i];

    if (vec2.equals(point, current)) {
      nextPoint = rect[i + 1] ?? rect[0];
      break;
    }
  }

  return nextPoint;
};

/**
 * Given coordinates, scale along both x and y axis with the angle taken into account.
 */
export const getScaledRect: (
  params: { coords: vec2[]; anchor: vec2; angle: number; scaleX: number; scaleY: number },
) => vec2[] = (
  { coords, anchor, angle, scaleX, scaleY },
) => {
  // The correct order to scale is:
  // - Translate the points according to the center of the rect.
  // - Rotate them according to the curent rotation
  // - Only then, scale them according to the ratio.
  // - Reverse the rotate and translate operation to put the points back to the actual place.
  const translateMat: mat2d = mat2d.fromTranslation(mat2d.create(), anchor);
  const rotateMat: mat2d = mat2d.rotate(mat2d.create(), translateMat, -angle);
  const scaleMat: mat2d = mat2d.scale(mat2d.create(), rotateMat, vec2.fromValues(scaleX, scaleY));
  const unrotateMat: mat2d = mat2d.rotate(mat2d.create(), scaleMat, angle);
  const untranslateMat: mat2d = mat2d.translate(mat2d.create(), unrotateMat, vec2.fromValues(-anchor[0], -anchor[1]));

  // To scale the rectangle, transform all points using the above matrix.
  return coords.map((coord) => vec2.transformMat2d(vec2.create(), coord, untranslateMat));
};

/**
 * Get the intersection between two lines.
 * When there is no intersection, returns null instead.
 *
 * Source: http://paulbourke.net/geometry/pointlineplane/
 *
 * @param p1 - first point of the first line
 * @param p2 - second point of the first line
 * @param q1 - first point of the second line
 * @param q2 - second point of the second line.
 */
export const getLineIntersection: (p1: vec2, p2: vec2, q1: vec2, q2: vec2) => vec2 | null = (
  p1, p2, q1, q2,
) => {
  // Do not proceed for imaginary lines (zero length).
  if (vec2.dist(p1, p2) === 0 || vec2.dist(q1, q2) === 0) {
    return null;
  }

  const dq: vec2 = vec2.sub(vec2.create(), q2, q1);
  const dp: vec2 = vec2.sub(vec2.create(), p2, p1);
  const denominator: number = dq[1] * dp[0] - dq[0] * dp[1];

  // Do not proceed if the lines are parallel (no intersection).
  if (denominator === 0) {
    return null;
  }

  const pq: vec2 = vec2.sub(vec2.create(), p1, q1);
  const ua: number = (pq[1] * dq[0] - pq[0] * dq[1]) / denominator;
  const ub: number = (pq[1] * dp[0] - pq[0] * dp[1]) / denominator;

  // Also do not proceed if the intersection is along the segment.
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null;
  }

  return vec2.add(vec2.create(), p1, vec2.scale(vec2.create(), dp, ua));
};

/**
 * Given a line and a point, get the closest point along the line
 * to the given point.
 *
 * Source: https://stackoverflow.com/a/6853926
 *
 * @param p - the reference point.
 * @param l1 - first point of the line.
 * @param l2 - second point of the line.
 */
export const getClosestPointFromLine: (p: vec2, l1: vec2, l2: vec2) => vec2 = (
  p, l1, l2,
) => {
  const pl1: vec2 = vec2.sub(vec2.create(), p, l1);
  const l1l2: vec2 = vec2.sub(vec2.create(), l2, l1);

  const dot: number = vec2.dot(pl1, l1l2);
  const lengthSquared: number = vec2.sqrDist(l1, l2);

  // Lines that do not have length
  // should set the params to any of the line coordinate.
  const param: number = lengthSquared !== 0 ? dot / lengthSquared : -1;

  if (param < 0) {
    return l1;
  }

  if (param > 1) {
    return l2;
  }

  return vec2.add(
    vec2.create(),
    l1,
    vec2.scale(vec2.create(), l1l2, param),
  );
};

/**
 * Given two rectangles with four sides,
 * find the intersection points of each lines of both rects.
 *
 * @param rect1 - the rectangle that is used as the base.
 * @param rect2 - the overlapping rectangle.
 */
export const getIntersectingBoundLines: (rect1: vec2[], rect2: vec2[]) => vec2[] = (
  rect1, rect2,
) => {
  // Lines from both rects are aligned starting from north clockwise.
  const [rect1Nw, rect1Ne, rect1Se, rect1Sw]: vec2[] = rect1;
  const rect1Lines: vec2[][] = [
    [rect1Nw, rect1Ne],
    [rect1Ne, rect1Se],
    [rect1Se, rect1Sw],
    [rect1Sw, rect1Nw],
  ];

  const [rect2Nw, rect2Ne, rect2Se, rect2Sw]: vec2[] = rect2;
  const rect2Lines: vec2[][] = [
    [rect2Nw, rect2Ne],
    [rect2Ne, rect2Se],
    [rect2Se, rect2Sw],
    [rect2Sw, rect2Nw],
  ];

  const intPoints: vec2[] = [];

  for (const rect1Line of rect1Lines) {
    for (const rect2Line of rect2Lines) {
      const intPoint: vec2 | null = getLineIntersection(
        rect2Line[0], rect2Line[1],
        rect1Line[0], rect1Line[1],
      );

      if (intPoint) {
        intPoints.push(intPoint);
      }
    }
  }

  return intPoints;
};

/**
 * Find whether a point is inside a rectangle.
 *
 * Source: https://stackoverflow.com/a/37865332
 *
 * @param rect - the rectangle points.
 * @param p - the point to test.
 */
export const isPointInsideRect: (rect: vec2[], p: vec2) => boolean = (
  rect, p,
) => {
  const [nw, , se, sw]: vec2[] = rect;

  const swnw: vec2 = vec2.sub(vec2.create(), nw, sw);
  const swse: vec2 = vec2.sub(vec2.create(), se, sw);
  const swp: vec2 = vec2.sub(vec2.create(), p, sw);
  const dotSwpSwnw: number = vec2.dot(swp, swnw);
  const dotSwnwSwnw: number = vec2.dot(swnw, swnw);
  const dotSwpSwse: number = vec2.dot(swp, swse);
  const dotSwseSwse: number = vec2.dot(swse, swse);

  return 0 <= dotSwpSwnw && dotSwpSwnw <= dotSwnwSwnw && 0 <= dotSwpSwse && dotSwpSwse <= dotSwseSwse;
};

/**
 * Given two rectangles, find out whether the points
 * of the overlapping rectangle is inside the base rectangle
 *
 * @param rect1 - the base rectangle.
 * @param rect2 - the overlapping rectangle.
 */
export const getInsidePoints: (rect1: vec2[], rect2: vec2[]) => vec2[] = (
  rect1, rect2,
) => rect1.filter((rect1Point) => isPointInsideRect(rect2, rect1Point));

/**
 * Find the displacement of the point towards the width and height of a rectangle
 * to get the scale x and y ratio.
 */
export const getScaleRatio: (
  params: { start: vec2; point: vec2; angle: number; center: vec2; width: number; height: number },
) => [number, number] = (
  { start, point, angle, center, width, height },
) => {
  const rotatedStart: vec2 = vec2.rotate(vec2.create(), start, center, angle);
  const scaleDirectionX: number = rotatedStart[0] > center[0] ? 1 : -1;
  const scaleDirectionY: number = rotatedStart[1] > center[1] ? 1 : -1;

  // The point of reference when resizing should take the rotation into account,
  // therefore rotating it back in order to compare with the starting coordinate.
  const rotatedMousePosition: vec2 = vec2.rotate(vec2.create(), point, start, angle);

  // The ratio of the scale is defined by how far
  // user drags the mouse from their starting point (one of the rect corners).
  const deltaX: number = (rotatedMousePosition[0] - start[0]) * scaleDirectionX;
  const deltaY: number = (rotatedMousePosition[1] - start[1]) * scaleDirectionY;

  return [
    Math.max((width + deltaX) / width, MIN_RATIO),
    Math.max((height + deltaY) / height, MIN_RATIO),
  ];
};

/**
 * Given a coordinate, find the angle relative to
 * the north point of the given center.
 *
 * @param coord - the coordinate to test.
 * @param center - the center point of reference.
 */
export const getRelativeAngle: (coord: vec2, center: vec2) => number = (
  coord, center,
) => {
  // The reference point of the angle should always be at the north,
  // which is when the rectangle is at 0 rad.
  // This would allow consistent angle calculation.
  // The length of the 0 rad vector does not matter because
  // it's just a straight line to compare with the reference point.
  const reference: number[] = [0, Number.MAX_SAFE_INTEGER];
  const point: vec2 = vec2.sub(vec2.create(), coord, center);

  return Math.atan2(
    (point[0] * reference[1]) - (point[1] * reference[0]),
    (point[0] * reference[0]) + (point[1] * reference[1]),
  );
};

/**
 * Given the coordinates, find the rotate point coordinate,
 * which is on the north of the rectangle displaced by a defined margin towards the north.
 * It should always align with the current angle of the rectangle.
 * Coordinate has to take the resolution level into account.
 *
 * @param rect - the rectangle coordinates.
 * @param resolution - the map's current resolution level.
 * @param initialAngle - if provided, an angle will be used instead of calculating manually.
 */
export const getRotatePoint: (coords: vec2[], resolution: number, initialAngle?: number) => vec2 = (
  coords, resolution, initialAngle,
) => {
  let angle: number = 0;
  const [nw, ne, se]: vec2[] = coords;

  if (initialAngle !== undefined) {
    angle = initialAngle;
  } else {
    // Get the relative angle by finding out the center top position
    // of the current rectangle.
    const center: vec2 = vec2.lerp(vec2.create(), nw, se, HALF);
    const centerTop: vec2 = vec2.lerp(vec2.create(), nw, ne, HALF);

    angle = getRelativeAngle(
      [centerTop[0], centerTop[1]],
      [center[0], center[1]],
    );
  }

  // To put the rotate point in the middle, the width needs to be calculated.
  // The correct width would be between these two corners, not the width from the extent.
  const width: number = vec2.dist(nw, ne);
  const translatedRotatePoint: vec2 = vec2.add(vec2.create(), nw, vec2.fromValues((width / 2), ROTATE_MARGIN_Y * resolution));

  return vec2.rotate(vec2.create(), translatedRotatePoint, nw, -angle);
};

/**
 * Creates coordinates of a diagonal (45deg) square.
 *
 * @param x - x start coordinate.
 * @param y - y start coordinate.
 * @param size - the size of the square.
 */
export const createDiagonalSquare: (x: number, y: number, size: number) => vec2[] = (
  x, y, size,
) => {
  const diagonal: number = size * Math.sqrt(2);

  return [
    [x, y],
    [x + diagonal, y + diagonal],
    [x + (2 * diagonal), y],
    [x + diagonal, y - diagonal],
  ].map(toVec2);
};
