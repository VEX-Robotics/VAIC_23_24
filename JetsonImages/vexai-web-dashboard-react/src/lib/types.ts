export enum Element {
  GreenTriball = 0,
  RedTriball = 1,
  BlueTriball = 2,
}

export enum Direction {
  X = 0,
  Y = 1,
}

export interface Theme {
  id: string;
  componentBackground: string;
  font: string;
  control: string;
  controlHover: string;
}
