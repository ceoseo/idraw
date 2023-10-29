import { PointSize } from './point';
import type { SVGPathCommand } from './svg-path';

export interface ElementSize {
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
}

export type ElementClipPath = Pick<ElementPathDetail, 'commands' | 'originX' | 'originY' | 'originW' | 'originH'>;

export interface TransformMatrix {
  method: 'matrix';
  args: [number, number, number, number, number];
}

export interface ElementAssetsItem {
  type: 'svg' | 'image';
  value: string;
}

export interface ElementAssets {
  [assetId: string]: ElementAssetsItem;
}

export interface TransformTranslate {
  method: 'translate';
  args: [number, number];
}

export interface TransformRotate {
  method: 'rotate';
  args: [number];
}

export interface TransformScale {
  method: 'scale';
  args: [number, number];
}

export type TransformAction = TransformMatrix | TransformTranslate | TransformRotate | TransformScale;

export interface GradientStop {
  offset: number;
  color: string;
}

export interface LinearGradientColor {
  type: 'linearGradient';
  start: PointSize;
  end: PointSize;
  stops: Array<GradientStop>;
  angle?: number;
  transform?: TransformAction[];
}

type GadialCircle = PointSize & {
  radius: number;
};

export interface RadialGradientColor {
  type: 'radialGradient';
  inner: GadialCircle;
  outer: GadialCircle;
  stops: Array<GradientStop>;
  angle?: number;
  transform?: TransformAction[];
}

export interface ElementBaseDetail {
  boxSizing?: 'content-box' | 'border-box' | 'center-line'; // default center-line
  borderWidth?: number | [number, number, number, number]; // [top, right, bottom, left]
  borderColor?: string;
  borderRadius?: number | [number, number, number, number]; // [top-left, top-right, bottom-left, bottom-right]
  borderDash?: number[];
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  color?: string;
  background?: string | LinearGradientColor | RadialGradientColor;
  opacity?: number;
  clipPath?: ElementClipPath;
}

// interface ElementRectDetail extends ElementBaseDetail {
//   // color?: string;
//   // background?: string;
// }

interface ElementRectDetail extends ElementBaseDetail {}

interface ElemenTextDetail extends ElementBaseDetail {
  text: string;
  color: string;
  fontSize: number;
  lineHeight?: number;
  fontWeight?: 'bold' | string | number;
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
  verticalAlign?: 'middle' | 'top' | 'bottom';
  textShadowColor?: string;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textShadowBlur?: number;
}

interface ElementCircleDetail extends ElementBaseDetail {
  radius: number;
  background?: string;
}

interface ElementHTMLDetail extends ElementBaseDetail {
  html: string;
  width?: number;
  height?: number;
}

interface ElementImageDetail extends ElementBaseDetail {
  src: string;
}

interface ElementSVGDetail extends ElementBaseDetail {
  svg: string;
}

interface ElementGroupDetail extends ElementBaseDetail {
  children: Element<ElementType>[];
  overflow?: 'hidden';
  assets?: ElementAssets;
}

interface ElementPathDetail extends ElementBaseDetail {
  // path: string;
  commands: SVGPathCommand[];
  originX: number;
  originY: number;
  originW: number;
  originH: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLineCap?: 'butt' | 'round' | 'square';
}

interface ElementDetailMap {
  rect: ElementRectDetail;
  circle: ElementCircleDetail;
  text: ElemenTextDetail;
  image: ElementImageDetail;
  html: ElementHTMLDetail;
  svg: ElementSVGDetail;
  group: ElementGroupDetail;
  path: ElementPathDetail;
}

// export type ElementType = 'text' | 'rect' | 'circle' | 'image' | 'svg' | 'html' | 'group';
export type ElementType = keyof ElementDetailMap;

export interface ElementOperations {
  lock?: boolean;
  invisible?: boolean;
  disableScale?: boolean;
  disableRotate?: boolean;
  limitRatio?: boolean;
  lastModified?: number;
}

export interface Element<T extends ElementType = ElementType, E extends Record<string, any> = Record<string, any>> extends ElementSize {
  uuid: string;
  name?: string;
  type: T;
  detail: ElementDetailMap[T];
  operations?: ElementOperations;
  extends?: E;
}

export type Elements = Element<ElementType>[];
