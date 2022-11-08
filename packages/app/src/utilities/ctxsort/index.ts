type MouseOrTouchEvent = MouseEvent | TouchEvent;
type MouseOrTouchEventListener = (
  target: HTMLElement | Document,
  listener: (e: MouseOrTouchEvent) => void,
  options?: boolean | AddEventListenerOptions | void,
) => void;

interface MouseOrTouchEventLocation {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  // Alias of clientX/Y, in MouseEvent
  x?: number;
  y?: number;
  // MouseEvent-Only Props
  layerX?: number;
  layerY?: number;
  movementX?: number;
  movementY?: number;
  offsetX?: number;
  offsetY?: number;
  // TouchEvent-Only Props
  radiusX?: number;
  radiusY?: number;
}

const getFirstMouseOrTouchLocation: (e: MouseOrTouchEvent) => MouseOrTouchEventLocation = (e) => e instanceof MouseEvent ? e : e.targetTouches[0];

function attachMouseAndTouchEventListenerCreator(mouseType: string, touchType: string): MouseOrTouchEventListener {
  return (target, cb, options = false) => {
    target.addEventListener(mouseType, cb, options);
    target.addEventListener(touchType, cb, options);
  };
}

function detachMouseAndTouchEventListenerCreator(mouseType: string, touchType: string): MouseOrTouchEventListener {
  return (target, cb, options = false) => {
    target.removeEventListener(mouseType, cb, options);
    target.removeEventListener(touchType, cb, options);
  };
}

const addMouseAndTouchStartEventListener: MouseOrTouchEventListener = attachMouseAndTouchEventListenerCreator('mousedown', 'touchstart');
const addMouseAndTouchMoveEventListener: MouseOrTouchEventListener = attachMouseAndTouchEventListenerCreator('mousemove', 'touchmove');
const addMouseAndTouchEndEventListener: MouseOrTouchEventListener = attachMouseAndTouchEventListenerCreator('mouseup', 'touchend');
const removeMouseAndTouchStartEventListener: MouseOrTouchEventListener = detachMouseAndTouchEventListenerCreator('mousedown', 'touchstart');
const removeMouseAndTouchMoveEventListener: MouseOrTouchEventListener = detachMouseAndTouchEventListenerCreator('mousemove', 'touchmove');
const removeMouseAndTouchEndEventListener: MouseOrTouchEventListener = detachMouseAndTouchEventListenerCreator('mouseup', 'touchend');

/* eslint-disable max-lines */
const exhaustiveCheck: (x: never) => never = (x) => {
  throw new Error(`Unexpected object : ${x}`);
};
/**
 * @enum CtxSortOwnerRelation
 *
 * @default 'sibling'
 * @member {string} sibling - Owner is sibling of ctxsortParent. find ctxsortParent from **parentElement**.
 * @example
 * `<main>
 *    <div data-ctxsort="ListHeader"></div>
 *    <section data-ctxsort-parent="ListItem"></section>
 *  </main>`
 * @member {string} parent - Owner is Parent. find ctxsortParent from **owner element**.
 * @example
 * `<header data-ctxsort="ListHeader"></header>
 *  <section>
 *    <ul data-ctxsort-parent="listItem">list items...</ul>
 *  </section>`
 */
export enum CtxSortOwnerRelation {
  SIBLING = 'sibling',
  PARENT = 'parent',
}
/**
 * @enum CtxSortDetectionMode
 *
 * @default 'column'
 * @member {string} overlap - validates X/Y both of coordinate.
 * @member {string} column - validates Y coords only. (X is center of selected target element).
 */
export enum CtxSortDetectionMode {
  OVERLAP = 'overlap',
  COLUMN = 'column',
}
/**
 * @enum CtxSortCollisionMode
 *
 * @default 'self'
 * @member {string} self - shouldInsertToNext / shadow attachment works to self.
 * @member {string} parent - shouldInsertToNext / shadow attachment works to ctxsort-parent.
 */
export enum CtxSortCollisionMode {
  SELF = 'self',
  PARENT = 'parent',
}
/**
 * @enum CtxSortSelectedFrom
 *
 * @member {string} owner - collision from owner.
 * @member {string} self - collision from self(target).
 */
export enum CtxSortSelectedFrom {
  OWNER = 'owner',
  SELF = 'self',
}
/**
 * @enum CtxSortInteractionMode
 *
 * @default 'manual'
 * @member {string} manual - No DOM insertion invokes.
 * @member {string} dom_change - insert target beside of nearestTarget.
 * @member {string} dom_change_with_parent - insert parentElement beside of nearestTarget.
 */
export enum CtxSortInteractionMode {
  MANUAL = 'manual',
  DOM_CHANGE = 'dom_change',
  DOM_CHANGE_WITH_PARENT = 'dom_change_with_parent',
}
/**
 * interface CtxSortEvent
 *
 * @member {Event} e - Browser-native event object
 * @member {string} key - data-ctxsort-key.
 * @member {string | null} nearestKey - data-ctxsort-key.
 * @member {CtxSortSelectedFrom} selectedFrom - see typedef.
 * @member {boolean} shouldInsertToNext - indicates "where should it store?". between next or prev.
 * @member {HTMLElement} $currentTarget - Current target element from DOM.
 * @member {HTMLElement} $lastVisited - Last visited DOM element. should contain data-ctxsort-key.
 */
export interface CtxSortEvent {
  e: Event;
  key: string;
  nearestKey: string | null;
  selectedFrom: CtxSortSelectedFrom;
  shouldInsertToNext: boolean;
  $currentTarget: HTMLElement;
  $lastVisited?: HTMLElement | null;
  isInvalidTarget?: boolean;
  nextSiblingKey?: string;
}
/**
 * interface CtxSortOptions
 *
 * @member {string} target - Required. data-ctxsort.
 * @member {string} scroller - Optional. Scrollable Element or Selector.
 * @member {number} scrollOffset - Optional. provides offset of scroll  trigger on drag.
 * @member {string} owner - Optional. data-ctxsort. describe parent scope of target.
 * @member {CtxSortOwnerRelation} ownerRelation - see typedef.
 * @member {string} portalId - id of portal.
 * @member {CtxSortDetectionMode} detectionMode - see typedef.
 * @member {CtxSortInteractionMode} interactionMode - see typedef.
 * @member {CtxSortCollisionMode} collisionMode - see typedef.
 * @member {number} delay - delays initial invocation of drag start. generally use when target element has click event.
 * @member {(e: CtxSortEvent) => void} onSortStart - Triggers when target element has initially detected.
 * @member {(e: CtxSortEvent) => void} onSortMove - Triggers when nearestKey has changed.
 * @member {(e: CtxSortEvent) => void} onSortEnd - Trigger with mouseup event.
 * @member {string} psuedoOwnerClassName - classname of css:after box-shadow styles.
 * @member {string} psuedoParentClassName - classname of css:after box-shadow styles.
 * @member {string} shadowTopStyle - box-shadow styles of target element.
 * @member {string} shadowBottomStyle - box-shadow styles of target element.
 *
 * @example
 * const defaultOptions: CtxSortOptions = {
 *  target: '',
 *  scroller: '',
 *  scrollOffset: 200,
 *  owner: '',
 *  ownerRelation: 'sibling',
 *  portalId: 'ctxsort-portal',
 *  detectionMode: 'column',
 *  interactionMode: 'manual',
 *  collisionMode: 'self',
 *  delay: 200,
 *  onSortStart: () => undefined,
 *  onSortChange: () => undefined,
 *  onSortEnd: () => undefined,
 *  psuedoOwnerClassName: 'ctxsort-owner-active',
 *  psuedoParentClassName: 'ctxsort-parent-active',
 *  shadowTopStyle: '0px 2.5px 0px 0px #afbcd1 inset',
 *  shadowBottomStyle: '0px 2.5px 0px 0px #afbcd1',
 * };
 */
export type CtxSortOptions = CtxSortDefaultOptions & CtxSortEventOptions & CtxSortStyleOptions;

export interface CtxSortDefaultOptions {
  target: string;
  scroller?: string;
  scrollOffset?: number;
  owner?: string;
  ownerRelation?: CtxSortOwnerRelation;
  portalId?: string;
  detectionMode?: CtxSortDetectionMode;
  interactionMode?: CtxSortInteractionMode;
  collisionMode?: CtxSortCollisionMode;
  delay: number;
}

export interface CtxSortEventOptions {
  onSortStart?(e: CtxSortEvent): void;
  onSortChange?(e: CtxSortEvent): void;
  onSortEnd?(e: CtxSortEvent): void;
}

export interface CtxSortStyleOptions {
  psuedoOwnerClassName?: string;
  psuedoParentClassName?: string;
  shadowTopStyle?: string;
  shadowBottomStyle?: string;
}

export interface CtxSortContext {
  destroy(): void;
  clean(): void;
}

interface PosXY {
  x: number;
  y: number;
}

// global variables / functions (should share across all CtxSort instances)
// eslint-disable-next-line: @typescript-eslint/strict-boolean-expressions
const IS_MACOS_SAFARI: boolean = !window.TouchEvent;
const scrollerTargets: Array<string> = [];
let isTouchScrollInteractionActive: boolean = true;
let isContextMenuActivated: boolean = false;

function wasSameScrollerAttached(scroller?: string): boolean {
  if (scroller === undefined) return false;

  return scrollerTargets.includes(scroller);
}

export function CtxSort(options: CtxSortOptions): CtxSortContext {
  const defaultOptions: CtxSortOptions = {
    target: '',
    scroller: '',
    scrollOffset: 200,
    owner: '',
    ownerRelation: CtxSortOwnerRelation.SIBLING,
    portalId: 'ctxsort-portal',
    detectionMode: CtxSortDetectionMode.COLUMN,
    interactionMode: CtxSortInteractionMode.MANUAL,
    collisionMode: CtxSortCollisionMode.SELF,
    delay: 200,
    onSortStart: () => undefined,
    onSortChange: () => undefined,
    onSortEnd: () => undefined,
    // props for styling
    psuedoOwnerClassName: 'ctxsort-owner-active',
    psuedoParentClassName: 'ctxsort-parent-active',
    shadowTopStyle: '0px 2.5px 0px 0px #afbcd1 inset',
    shadowBottomStyle: '0px 2.5px 0px 0px #afbcd1',
  };

  const _options: CtxSortOptions = { ...defaultOptions, ...options };

  const detectionMode: CtxSortDetectionMode | undefined = _options.detectionMode;
  const interactionMode: CtxSortInteractionMode | undefined = _options.interactionMode;
  const collisionMode: CtxSortCollisionMode | undefined = _options.collisionMode;
  const initialSortDelay: number = _options.delay;

  const scrollOffset: number | undefined = _options.scrollOffset;

  const targetData: string = _options.target;
  const ownerData: string | undefined = _options.owner;

  const targetSelector: string = `[data-ctxsort="${targetData}"]`;
  const parentSelector: string = `[data-ctxsort-parent="${targetData}"]`;

  const ownerRelation: CtxSortOwnerRelation | undefined = _options.ownerRelation;

  const invokeSortStart: ((e: CtxSortEvent) => void) | undefined = _options.onSortStart;
  const invokeSortChange: ((e: CtxSortEvent) => void) | undefined = _options.onSortChange;
  const invokeSortEnd: ((e: CtxSortEvent) => void) | undefined = _options.onSortEnd;

  const portalId: string | undefined = _options.portalId;
  const $portal: HTMLElement | void = createOrGetPortal();

  const psuedoOwnerClassName: string | undefined = _options.psuedoOwnerClassName;
  const psuedoParentClassName: string | undefined = _options.psuedoParentClassName;

  const shadowTop: string | undefined = _options.shadowTopStyle;
  const shadowBottom: string | undefined = _options.shadowBottomStyle;

  const _wasSameScrollerAttached: boolean = wasSameScrollerAttached(_options.scroller);

  let initialSortTimeout: number | null = null;

  let $scroller: HTMLElement | null = null;
  let shouldAttachToPortal: boolean = false;

  let scrollInterval: number | null = null;
  let scrollAcceleration: number = 0;

  let $currentTarget: HTMLElement | null = null;
  let $lastVisitedParent: HTMLElement | null = null;
  let currentTargetRect: DOMRect | null = null;
  let targetOffset: PosXY = { x: 0, y: 0 };

  let nearestKey: string | null = null;
  let selectedFrom: CtxSortSelectedFrom = CtxSortSelectedFrom.SELF;
  let shouldInsertToNext: boolean = false;

  let $lastVisited: HTMLElement | null = null;
  let $collisionTarget: HTMLElement | null = null;
  let $prevVisited: HTMLElement | null = null;

  let memorizedScrollerScrollTop: number = 0;
  let memorizedScrollerClientY: number = 0;
  let lastPointerPosition: PosXY = { x: 0, y: 0 };

  if (_options.scroller) scrollerTargets.push(_options.scroller);

  // typeof scroll
  function initScroller(): void {
    if ($scroller) return;
    if (_options.scroller !== undefined && _options.scroller.slice().search(/^[#.]/g) !== -1) {
      $scroller = document.querySelector(_options.scroller);
      if ($scroller) $scroller.style.touchAction = 'none';
    }
  }

  function createOrGetPortal(): HTMLElement | void {
    if (portalId === undefined) return;
    const portal: HTMLElement | null = document.getElementById(portalId);
    if (portal) return portal;

    const newPortal: HTMLElement | null = document.createElement('div');
    newPortal.id = portalId;
    newPortal.style.cssText = `
      position: fixed;
      width: auto;
      height: auto;
      left: 0;
      top: 0;
      z-index: 1000;
    `;

    document.body.appendChild(newPortal);

    return newPortal;
  }

  function removeBoxShadow(): void {
    if ($lastVisited && psuedoParentClassName && psuedoOwnerClassName) {
      $lastVisited.classList.remove(psuedoParentClassName, psuedoOwnerClassName);
    }
    if ($collisionTarget) $collisionTarget.style.boxShadow = 'none';
  }

  function clearScrollInterval(): void {
    if (scrollInterval) clearInterval(scrollInterval);
    scrollInterval = null;
  }

  function clean(): void {
    clearScrollInterval();

    if (initialSortTimeout) window.clearTimeout(initialSortTimeout);
    initialSortTimeout = null;

    shouldAttachToPortal = false;
    isTouchScrollInteractionActive = true;
    isContextMenuActivated = false;

    scrollInterval = null;
    scrollAcceleration = 0;

    $currentTarget = null;
    currentTargetRect = null;
    targetOffset = { x: 0, y: 0 };

    nearestKey = null;
    selectedFrom = CtxSortSelectedFrom.SELF;
    shouldInsertToNext = false;

    $lastVisited = null;
    $collisionTarget = null;
    $prevVisited = null;
    if ($portal && $portal.children.length > 0) $portal.removeChild($portal.children[0]);

    if (document.body.style.userSelect === 'none') {
      document.getSelection()?.removeAllRanges();
      document.body.style.userSelect = 'auto';
      // MacOS Safari Only
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (IS_MACOS_SAFARI) document.body.style.webkitUserSelect = 'auto';
    }
  }

  function destroy(): void {
    document.body.style.userSelect = 'auto';
    if (IS_MACOS_SAFARI) document.body.style.webkitUserSelect = 'auto';
    removeMouseAndTouchStartEventListener(document, handleSortablePointerDown);
    removeMouseAndTouchMoveEventListener(document, handleSortableMove);
    removeMouseAndTouchEndEventListener(document, handleSortablePointerUp);

    removeMouseAndTouchMoveEventListener(document, handleAutoscrollOnDrag);

    removeMouseAndTouchStartEventListener(document, handleScrollerTouchStart);
    removeMouseAndTouchMoveEventListener(document, handleScrollerTouchMove);
  }

  const handleScrollerTouchStart: (e: TouchEvent) => void = (e) => {
    if (e instanceof MouseEvent || !isTouchScrollInteractionActive || $currentTarget) return;
    if (!$scroller) {
      initScroller();

      return;
    }
    const p: MouseOrTouchEventLocation = getFirstMouseOrTouchLocation(e);
    memorizedScrollerScrollTop = $scroller.scrollTop;
    memorizedScrollerClientY = p.clientY;
  };

  const handleScrollerTouchMove: (e: TouchEvent) => void = (e) => {
    if (e instanceof MouseEvent || !isTouchScrollInteractionActive || $currentTarget) return;
    if (!$scroller) {
      initScroller();

      return;
    }
    const p: MouseOrTouchEventLocation = getFirstMouseOrTouchLocation(e);
    lastPointerPosition = { x: p.clientX, y: p.clientY };
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (
      !_wasSameScrollerAttached &&
      _options.scroller !== undefined &&
      e.target &&
      e.target === $scroller ||
      (e.target as HTMLElement).closest((_options.scroller) as string)
    ) {
      // order is very important!!!!do not change order of codes below.
      const lastScrollTop: number = $scroller.scrollTop;
      $scroller.scroll({ left: $scroller.scrollLeft, top: memorizedScrollerScrollTop + (memorizedScrollerClientY - p.clientY) });
      const currentScrollTop: number = $scroller.scrollTop;

      if (lastScrollTop === currentScrollTop) {
        memorizedScrollerScrollTop = currentScrollTop;
        memorizedScrollerClientY = p.clientY;
      }
    }
  };

  function isTouchPositionChanged(currentPos: PosXY, lastPos: PosXY): boolean {
    return currentPos.x !== lastPos.x || currentPos.y !== lastPos.y;
  }

  function preventContextMenuWhenSortable(e: MouseOrTouchEvent): void {
    document.oncontextmenu = (event) => {
      const $target: HTMLElement = e.target as HTMLElement;
      if (portalId !== undefined) {
        if (
          $target.closest(targetSelector) ||
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-non-null-assertion
            _options.scroller !== undefined ? $target.closest(_options.scroller!) : null ||
            $target.closest(portalId)
        ) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
      }
    };
  }

  function setPortalPosition(e: MouseOrTouchEvent): void {
    if (!currentTargetRect || !$portal) return;

    const p: MouseOrTouchEventLocation = getFirstMouseOrTouchLocation(e);
    $portal.style.transform = `translate3d(${p.clientX - targetOffset.x}px, ${p.clientY - targetOffset.y}px, 0px)`;
  }

  const handleSortablePointerDown: (e: MouseOrTouchEvent) => void = (e) => {
    const p: MouseOrTouchEventLocation = getFirstMouseOrTouchLocation(e);
    lastPointerPosition = { x: p.clientX, y: p.clientY };
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!IS_MACOS_SAFARI) preventContextMenuWhenSortable(e);
    if (e instanceof MouseEvent) document.oncontextmenu = () => isContextMenuActivated = true;

    initialSortTimeout = window.setTimeout(() => {
      if (
        !e.target ||
        !$portal ||
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        !IS_MACOS_SAFARI && isTouchPositionChanged({ x: p.clientX, y: p.clientY }, lastPointerPosition) ||
        isContextMenuActivated
      ) {
        return;
      }
      isTouchScrollInteractionActive = false;

      const $target: HTMLElement = e.target as HTMLElement;
      const hasTarget: boolean = $target.dataset.ctxsort === targetData;

      $currentTarget = hasTarget ? $target : $target.closest(targetSelector);

      if (!$currentTarget || !$currentTarget.dataset.ctxsortKey) return;

      currentTargetRect = $currentTarget.getBoundingClientRect();

      targetOffset.x = p.clientX - currentTargetRect.left;
      targetOffset.y = p.clientY - currentTargetRect.top;

      shouldAttachToPortal = true;

      initScroller();

      if (shouldAttachToPortal) {
        if ($portal.children.length > 0) $portal.removeChild($portal.children[0]);
        $portal.appendChild($currentTarget.cloneNode(true));
        shouldAttachToPortal = false;
      }
      setPortalPosition(e);

      invokeSortStart?.({
        e,
        key: $currentTarget.dataset.ctxsortKey,
        nearestKey,
        selectedFrom,
        shouldInsertToNext,
        $currentTarget,
        $lastVisited,
      });
    }, initialSortDelay);
  };

  const handleSortableMove: (e: MouseOrTouchEvent) => void = (e) => {
    if (
      !$currentTarget ||
      !$currentTarget.dataset.ctxsortKey ||
      !currentTargetRect ||
      !$portal ||
      !psuedoParentClassName ||
      !psuedoOwnerClassName ||
      !shadowBottom ||
      !shadowTop
    ) return;

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    const p: MouseOrTouchEventLocation = getFirstMouseOrTouchLocation(e);
    const posX: number = detectionMode === CtxSortDetectionMode.COLUMN ? (currentTargetRect.left + currentTargetRect.right) / 2 : p.clientX;

    setPortalPosition(e);
    // should be HTMLElement, not Element.
    const $nearestTarget: HTMLElement | null = document.elementsFromPoint(posX, p.clientY)
      .find((el: HTMLElement) =>
        // ContextSort 본체 또는 부모 컨텍스트 엘리먼트 필터
        (
          $currentTarget !== null &&
          (el.dataset.ctxsort === targetData && el.dataset.ctxsortKey !== $currentTarget.dataset.ctxsortKey) ||
          (el.dataset.ctxsort === ownerData) ||
          (collisionMode === CtxSortCollisionMode.PARENT ? (el.dataset.ctxsortParent === targetData) : false)
        )
      ) as HTMLElement;

    if (
      // nearestTarget can be falsy.
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      !$nearestTarget ||
      (!$nearestTarget.dataset.ctxsort && !$nearestTarget.dataset.ctxsortParent && !$nearestTarget.dataset.ctxsortKey)
    ) return;

    const isParentElem: boolean = $nearestTarget.dataset.ctxsortParent === targetData;
    const isOwnerElem: boolean = $nearestTarget.dataset.ctxsort === ownerData;

    removeBoxShadow();

    let $toBeLastVisited: HTMLElement | null | undefined = $nearestTarget;

    if (isOwnerElem) {
      /*
       * @memo ownerRelation is not necessary when you're using react
       * @
       */
      switch (ownerRelation) {
        case CtxSortOwnerRelation.SIBLING:
          if ($nearestTarget.parentElement) {
            $lastVisitedParent = $nearestTarget.parentElement.querySelector(parentSelector);
          }
          break;
        case CtxSortOwnerRelation.PARENT:
          $lastVisitedParent = $nearestTarget.querySelector(parentSelector) as HTMLElement;
          break;
        case undefined:
          $lastVisitedParent = $nearestTarget.querySelector(parentSelector) as HTMLElement;
          break;
        default:
          exhaustiveCheck(ownerRelation);
      }
      $toBeLastVisited = $nearestTarget;
      $toBeLastVisited.classList.add(psuedoOwnerClassName);
      selectedFrom = CtxSortSelectedFrom.OWNER;
    } else {
      if (!isParentElem) selectedFrom = CtxSortSelectedFrom.SELF;
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    $lastVisited = $toBeLastVisited ? $toBeLastVisited : $lastVisited;
    if (!$lastVisited) return;
    switch (collisionMode) {
      case CtxSortCollisionMode.SELF:
        $collisionTarget = $lastVisited;
        break;
      case CtxSortCollisionMode.PARENT:
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        $collisionTarget = $lastVisited.closest(parentSelector) || $lastVisited;
        break;
      case undefined:
        $collisionTarget = $lastVisited;
        break;
      default:
        $collisionTarget = $lastVisited;
        exhaustiveCheck(collisionMode);
    }
    // prevent self collision when collisionMode === 'parent'
    if (collisionMode === CtxSortCollisionMode.PARENT) {
      // find ctxsort target from `ctxsort-parent` element and compare with $currentTarget.
      if ($collisionTarget.querySelector(targetSelector) === $currentTarget) return;
    }

    const collisionRect: DOMRect = $collisionTarget.getBoundingClientRect();
    shouldInsertToNext = ((collisionRect.top + collisionRect.bottom) / 2 < p.clientY) && selectedFrom !== 'owner';

    if (selectedFrom === CtxSortSelectedFrom.SELF) {
      $collisionTarget.style.boxShadow = shouldInsertToNext ? shadowBottom : shadowTop;
    }
    if ($lastVisited.dataset.ctxsortKey) nearestKey = $lastVisited.dataset.ctxsortKey;
    if (selectedFrom === CtxSortSelectedFrom.OWNER && $nearestTarget.dataset.ctxsortKey) {
      nearestKey = $nearestTarget.dataset.ctxsortKey;
    }
    if ($prevVisited !== $lastVisited) {
      invokeSortChange?.({
        e,
        key: $currentTarget.dataset.ctxsortKey,
        nearestKey,
        selectedFrom,
        shouldInsertToNext,
        $currentTarget,
        $lastVisited,
      });
    }
    $prevVisited = $lastVisited;
  };

  const handleSortablePointerUp: (e: MouseOrTouchEvent) => void = (e) => {
    if (initialSortTimeout) window.clearTimeout(initialSortTimeout);
    initialSortTimeout = null;
    if (!$currentTarget || !$currentTarget.dataset.ctxsortKey) {
      clean();

      return;
    }
    if ($portal && $portal.children.length > 0) $portal.removeChild($portal.children[0]);

    removeBoxShadow();

    const isInvalidTarget = !$lastVisited || $lastVisited?.dataset.ctxsortKey === $currentTarget.dataset.ctxsortKey;
    const nextSiblingKey = ($lastVisited?.nextElementSibling as HTMLElement)?.dataset?.ctxsortKey;

    invokeSortEnd?.({
      e,
      key: $currentTarget.dataset.ctxsortKey,
      nearestKey,
      selectedFrom,
      shouldInsertToNext,
      $currentTarget,
      $lastVisited,
      isInvalidTarget,
      nextSiblingKey,
    });

    if ($lastVisited) {
      switch (interactionMode) {
        case CtxSortInteractionMode.MANUAL:
          break;
        case CtxSortInteractionMode.DOM_CHANGE:
          if (selectedFrom === CtxSortSelectedFrom.OWNER) {
            $lastVisited.prepend($currentTarget);
          } else {
            if (shouldInsertToNext) $lastVisited.parentElement?.insertBefore($currentTarget, $lastVisited.nextSibling);
            else $lastVisited.parentElement?.insertBefore($currentTarget, $lastVisited);
          }
          break;
        case CtxSortInteractionMode.DOM_CHANGE_WITH_PARENT:
          const $lastVisitedGrandParent: HTMLElement | null | undefined = $lastVisitedParent?.parentElement;
          const $nearestIndicator: HTMLElement | null | undefined = $lastVisitedParent?.querySelector('[data-ctxsort="RootIndicator"]');
          const $currentTargetParent: HTMLElement | null | undefined = $currentTarget.parentElement;
          if (
            !$lastVisitedParent ||
            !$lastVisitedGrandParent ||
            !$nearestIndicator ||
            !$currentTargetParent
          ) {
            break;
          }
          if ($lastVisitedGrandParent !== $currentTargetParent) {
            if (selectedFrom === CtxSortSelectedFrom.OWNER) {
              $lastVisitedParent.insertBefore($currentTargetParent, $nearestIndicator.nextSibling);
            } else {
              if (shouldInsertToNext) $lastVisitedGrandParent.insertBefore($currentTargetParent, $lastVisitedParent.nextSibling);
              else $lastVisitedGrandParent.insertBefore($currentTargetParent, $lastVisitedParent);
            }
          }
          break;
        case undefined:
          break;
        default:
          exhaustiveCheck(interactionMode);
      }
    }
    clean();
  };

  const handleAutoscrollOnDrag: (e: MouseOrTouchEvent) => void = (e) => {
    if (!$scroller || !scrollOffset) {
      clearScrollInterval();

      return;
    }

    const p: MouseOrTouchEventLocation = getFirstMouseOrTouchLocation(e);
    const scrollerRect: DOMRect = $scroller.getBoundingClientRect();
    const shouldScrollToTop: boolean = scrollerRect.top > (p.clientY - scrollOffset);
    const shouldScrollToBottom: boolean = (p.clientY + scrollOffset) > scrollerRect.bottom;
    const throttleOffset: number = 50;


    if ($currentTarget) {
      if (shouldScrollToTop || shouldScrollToBottom) {
        scrollAcceleration = 1 +
        (shouldScrollToTop ?
          Math.abs(p.clientY - scrollerRect.top - scrollOffset) :
          Math.abs(scrollerRect.bottom - p.clientY - scrollOffset)
        ) / throttleOffset;

        if (scrollInterval) return;
        scrollInterval = window.setInterval(() => {
          // if (!$scroller) return;
          if (shouldScrollToTop) {
            $scroller?.scroll($scroller?.scrollLeft, $scroller?.scrollTop - scrollAcceleration);
          } else {
            $scroller?.scroll($scroller?.scrollLeft, $scroller?.scrollTop + scrollAcceleration);
          }
        }, 1);
      } else {
        clearScrollInterval();
      }
    } else {
      if (scrollInterval) {
        clearScrollInterval();
      }
    }
  };

  addMouseAndTouchStartEventListener(document, handleSortablePointerDown);
  addMouseAndTouchMoveEventListener(document, handleSortableMove);
  addMouseAndTouchEndEventListener(document, handleSortablePointerUp);

  addMouseAndTouchMoveEventListener(document, handleAutoscrollOnDrag);

  addMouseAndTouchStartEventListener(document, handleScrollerTouchStart);
  addMouseAndTouchMoveEventListener(document, handleScrollerTouchMove);

  return {
    clean,
    destroy,
  };
}
