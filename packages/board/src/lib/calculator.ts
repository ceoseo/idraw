import type {
  Data,
  PointSize,
  Point,
  Element,
  ElementType,
  ViewCalculator,
  ViewCalculatorOptions,
  ViewScaleInfo,
  ElementSize,
  ViewSizeInfo,
  ViewContext2D
} from '@idraw/types';
import { rotateElementVertexes } from '@idraw/util';

export class Calculator implements ViewCalculator {
  private _opts: ViewCalculatorOptions;

  constructor(opts: ViewCalculatorOptions) {
    this._opts = opts;
  }

  private _getBoardSize(): { width: number; height: number } {
    return {
      width: this._opts.viewContent.boardContext.canvas.width,
      height: this._opts.viewContent.boardContext.canvas.height
    };
  }

  viewScale(num: number, prevScaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo {
    const scale = num;
    let offsetLeft = 0;
    let offsetRight = 0;
    let offsetTop = 0;
    let offsetBottom = 0;
    const { width, height, contextWidth, contextHeight } = viewSizeInfo;

    if (contextWidth * scale < width) {
      offsetLeft = offsetRight = (width - contextWidth * scale) / 2;
    } else if (contextWidth * scale > width) {
      if (prevScaleInfo.offsetLeft < 0) {
        offsetLeft = (prevScaleInfo.offsetLeft / prevScaleInfo.scale) * scale;
        offsetRight = 0 - (contextWidth * scale - width - Math.abs(offsetLeft));
      }
    }

    if (contextHeight * scale < height) {
      offsetTop = offsetBottom = (height - contextHeight * scale) / 2;
    } else if (contextHeight * scale > height) {
      if (prevScaleInfo.offsetTop < 0) {
        offsetTop = (prevScaleInfo.offsetTop / prevScaleInfo.scale) * scale;
        offsetBottom = 0 - (contextHeight * scale - height - Math.abs(offsetTop));
      }
    }

    return {
      scale,
      offsetTop,
      offsetLeft,
      offsetRight,
      offsetBottom
    };
  }

  viewScroll(opts: { moveX?: number; moveY?: number }, scaleInfo: ViewScaleInfo, viewSizeInfo: ViewSizeInfo): ViewScaleInfo {
    const scale = scaleInfo.scale;
    const { moveX, moveY } = opts;
    let offsetLeft = scaleInfo.offsetLeft;
    let offsetRight = scaleInfo.offsetRight;
    let offsetTop = scaleInfo.offsetTop;
    let offsetBottom = scaleInfo.offsetBottom;
    const { width, height, contextWidth, contextHeight } = viewSizeInfo;
    if (moveX !== undefined && (moveX > 0 || moveX <= 0)) {
      if (contextWidth * scale < width) {
        offsetLeft = offsetRight = (width - contextWidth * scale) / 2;
      } else if (contextWidth * scale > width) {
        if (offsetLeft + moveX >= 0) {
          offsetLeft = 0;
          offsetRight = width - contextWidth * scale;
        } else if (offsetLeft + moveX < width - contextWidth * scale) {
          offsetLeft = width - contextWidth * scale;
          offsetRight = 0;
        } else {
          offsetLeft += moveX;
          offsetRight = width - contextWidth * scale - offsetLeft;
        }
      } else {
        offsetLeft = offsetRight = 0;
      }
    }

    if (moveY !== undefined && (moveY > 0 || moveY <= 0)) {
      if (contextHeight * scale < height) {
        offsetTop = offsetBottom = (height - contextHeight * scale) / 2;
      } else if (contextHeight * scale > height) {
        if (offsetTop + moveY >= 0) {
          offsetTop = 0;
          offsetBottom = height - contextHeight * scale;
        } else if (offsetTop + moveY < height - contextHeight * scale) {
          offsetTop = height - contextHeight * scale;
          offsetBottom = 0;
        } else {
          offsetTop += moveY;
          offsetBottom = height - contextHeight * scale - offsetTop;
        }
      } else {
        offsetTop = offsetBottom = 0;
      }
    }

    return {
      scale,
      offsetTop,
      offsetLeft,
      offsetRight,
      offsetBottom
    };
  }

  elementSize(size: ElementSize, scaleInfo: ViewScaleInfo): ElementSize {
    const { x, y, w, h, angle } = size;
    const { scale, offsetTop, offsetLeft } = scaleInfo;
    return {
      x: x * scale + offsetLeft,
      y: y * scale + offsetTop,
      w: w * scale,
      h: h * scale,
      angle
    };
  }

  isElementInView(elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean {
    // TODO
    const { width, height } = this._getBoardSize();
    const { scale = 1, offsetTop = 0, offsetLeft = 0 } = scaleInfo;

    const { angle = 0 } = elem;
    const { x, y, w, h } = this.elementSize(elem, scaleInfo);
    const vertexes = rotateElementVertexes({ x, y, w, h, angle });

    // Virtual View Point
    const vvpStart: PointSize = {
      x: Math.min(vertexes[0].x, vertexes[1].x, vertexes[2].x, vertexes[3].x),
      y: Math.min(vertexes[0].y, vertexes[1].y, vertexes[2].y, vertexes[3].y)
    };
    const vvpEnd: PointSize = {
      x: Math.max(vertexes[0].x, vertexes[1].x, vertexes[2].x, vertexes[3].x),
      y: Math.max(vertexes[0].y, vertexes[1].y, vertexes[2].y, vertexes[3].y)
    };

    // Virtual Element Point
    const vep0: PointSize = { x: elem.x * scale, y: elem.y * scale };
    const vep1: PointSize = { x: (elem.x + elem.w) * scale, y: elem.y * scale };
    const vep2: PointSize = { x: (elem.x + elem.w) * scale, y: (elem.y + elem.h) * scale };
    const vep3: PointSize = { x: elem.x * scale, y: (elem.y + elem.h) * scale };

    const isPointInRect = (p: PointSize) => {
      return p.x >= vvpStart.x && p.x <= vvpEnd.x && p.y >= vvpStart.y && p.y <= vvpEnd.y;
    };
    if (isPointInRect(vep0) || isPointInRect(vep1) || isPointInRect(vep2) || isPointInRect(vep3)) {
      return true;
    }
    return false;
  }

  isPointInElement(ctx: ViewContext2D, p: Point, elem: Element<ElementType>, scaleInfo: ViewScaleInfo): boolean {
    const { angle = 0 } = elem;
    const { x, y, w, h } = this.elementSize(elem, scaleInfo);
    const vertexes = rotateElementVertexes({ x, y, w, h, angle });
    if (vertexes.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(vertexes[0].x, vertexes[0].y);
      for (let i = 1; i < vertexes.length; i++) {
        ctx.lineTo(vertexes[i].x, vertexes[i].y);
      }
      ctx.closePath();
    }
    if (ctx.isPointInPath(p.x, p.y)) {
      return true;
    }
    return false;
  }

  getPointElement(ctx: ViewContext2D, p: Point, data: Data, scaleInfo: ViewScaleInfo): { index: number; element: null | Element<ElementType> } {
    const result: { index: number; element: null | Element<ElementType> } = {
      index: -1,
      element: null
    };
    for (let i = 0; i < data.elements.length; i++) {
      const elem = data.elements[i];
      if (this.isPointInElement(ctx, p, elem, scaleInfo)) {
        result.index = i;
        result.element = elem;
        break;
      }
    }
    return result;
  }

  // rotateElementSize(elemSize: ElementSize): PointSize[] {
  //   // const { x, y, w, h, angle = 0 } = elemSize;
  //   // const pointSizes: PointSize[] = [];
  //   return [];
  // }

  // pointToViewPoint(p: Point): Point {
  //   // TODO
  //   return {};
  // }
}
