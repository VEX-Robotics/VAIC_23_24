/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
/* eslint-disable no-prototype-builtins */
// To parse this data:
//
//   import { Convert, DataResponse } from "./file";
//
//   const dataResponse = Convert.toDataResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface DataResponse {
  command?: string;
  valid?: boolean;
  cameraOffset?: Offset;
  color?: Color;
  depth?: Color;
  detections?: Detection[];
  position?: Position;
  stats?: Stats;
  gpsOffset?: Offset;
}

export interface Offset {
  x?: number;
  y?: number;
  z?: number;
  unit?: string;
  headingOffset?: number;
  elevationOffset?: number;
}

export interface Color {
  image?: Image;
}

export interface Image {
  valid?: boolean;
  width?: number;
  height?: number;
  data?: string;
}

export interface Detection {
  class?: number;
  prob?: number;
  depth?: number;
  screenLocation?: ScreenLocation;
  mapLocation?: MapLocation;
}

export interface MapLocation {
  x?: number[];
  y?: number[];
  z?: number[];
}

export interface ScreenLocation {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Position {
  status?: number;
  x?: number;
  y?: number;
  z?: number;
  azimuth?: number;
  elevation?: number;
  rotation?: number;
  connected?: boolean;
}

export interface Stats {
  fps?: number;
  inferTime?: number;
  videoWidth?: number;
  videoHeight?: number;
  runTime?: number;
  gpsConnected?: boolean;
  cpuTempurature?: number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toDataResponse(json: string): DataResponse {
    return cast(JSON.parse(json.replace(/\bNaN\b/g, "-1")), r("DataResponse")); // if depth field is NaN set it to -1
  }

  public static dataResponseToJson(value: DataResponse): string {
    return JSON.stringify(uncast(value, r("DataResponse")), null, 2);
  }

  public static toOffset(json: string): Offset {
    return cast(JSON.parse(json), r("Offset"));
  }

  public static offsetToJson(value: Offset): string {
    return JSON.stringify(uncast(value, r("Offset")), null, 2);
  }

  public static toColor(json: string): Color {
    return cast(JSON.parse(json), r("Color"));
  }

  public static colorToJson(value: Color): string {
    return JSON.stringify(uncast(value, r("Color")), null, 2);
  }

  public static toImage(json: string): Image {
    return cast(JSON.parse(json), r("Image"));
  }

  public static imageToJson(value: Image): string {
    return JSON.stringify(uncast(value, r("Image")), null, 2);
  }

  public static toDetection(json: string): Detection {
    return cast(JSON.parse(json), r("Detection"));
  }

  public static detectionToJson(value: Detection): string {
    return JSON.stringify(uncast(value, r("Detection")), null, 2);
  }

  public static toMapLocation(json: string): MapLocation {
    return cast(JSON.parse(json), r("MapLocation"));
  }

  public static mapLocationToJson(value: MapLocation): string {
    return JSON.stringify(uncast(value, r("MapLocation")), null, 2);
  }

  public static toScreenLocation(json: string): ScreenLocation {
    return cast(JSON.parse(json), r("ScreenLocation"));
  }

  public static screenLocationToJson(value: ScreenLocation): string {
    return JSON.stringify(uncast(value, r("ScreenLocation")), null, 2);
  }

  public static toPosition(json: string): Position {
    return cast(JSON.parse(json), r("Position"));
  }

  public static positionToJson(value: Position): string {
    return JSON.stringify(uncast(value, r("Position")), null, 2);
  }

  public static toStats(json: string): Stats {
    return cast(JSON.parse(json), r("Stats"));
  }

  public static statsToJson(value: Stats): string {
    return JSON.stringify(uncast(value, r("Stats")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
      val
    )}`
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(", ")}]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = "",
  parent: any = ""
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue(l(ref || "object"), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = val[key];
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty("props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  DataResponse: o(
    [
      { json: "Command", js: "command", typ: u(undefined, "") },
      { json: "Valid", js: "valid", typ: u(undefined, true) },
      {
        json: "CameraOffset",
        js: "cameraOffset",
        typ: u(undefined, r("Offset")),
      },
      { json: "Color", js: "color", typ: u(undefined, r("Color")) },
      { json: "Depth", js: "depth", typ: u(undefined, r("Color")) },
      {
        json: "Detections",
        js: "detections",
        typ: u(undefined, a(r("Detection"))),
      },
      { json: "Position", js: "position", typ: u(undefined, r("Position")) },
      { json: "Stats", js: "stats", typ: u(undefined, r("Stats")) },
      { json: "GpsOffset", js: "gpsOffset", typ: u(undefined, r("Offset")) },
    ],
    false
  ),
  Offset: o(
    [
      { json: "x", js: "x", typ: u(undefined, 3.14) },
      { json: "y", js: "y", typ: u(undefined, 3.14) },
      { json: "z", js: "z", typ: u(undefined, 3.14) },
      { json: "unit", js: "unit", typ: u(undefined, "") },
      { json: "heading_offset", js: "headingOffset", typ: u(undefined, 0) },
      { json: "elevation_offset", js: "elevationOffset", typ: u(undefined, 0) },
    ],
    false
  ),
  Color: o(
    [{ json: "Image", js: "image", typ: u(undefined, r("Image")) }],
    false
  ),
  Image: o(
    [
      { json: "Valid", js: "valid", typ: u(undefined, true) },
      { json: "Width", js: "width", typ: u(undefined, 0) },
      { json: "Height", js: "height", typ: u(undefined, 0) },
      { json: "Data", js: "data", typ: u(undefined, "") },
    ],
    false
  ),
  Detection: o(
    [
      { json: "class", js: "class", typ: u(undefined, 0) },
      { json: "prob", js: "prob", typ: u(undefined, 3.14) },
      { json: "depth", js: "depth", typ: u(undefined, 3.14, NaN) },
      {
        json: "screenLocation",
        js: "screenLocation",
        typ: u(undefined, r("ScreenLocation")),
      },
      {
        json: "mapLocation",
        js: "mapLocation",
        typ: u(undefined, r("MapLocation")),
      },
    ],
    false
  ),
  MapLocation: o(
    [
      { json: "x", js: "x", typ: u(undefined, a(3.14)) },
      { json: "y", js: "y", typ: u(undefined, a(3.14)) },
      { json: "z", js: "z", typ: u(undefined, a(3.14)) },
    ],
    false
  ),
  ScreenLocation: o(
    [
      { json: "x", js: "x", typ: u(undefined, 0) },
      { json: "y", js: "y", typ: u(undefined, 0) },
      { json: "width", js: "width", typ: u(undefined, 0) },
      { json: "height", js: "height", typ: u(undefined, 0) },
    ],
    false
  ),
  Position: o(
    [
      { json: "Status", js: "status", typ: u(undefined, 0) },
      { json: "X", js: "x", typ: u(undefined, 0) },
      { json: "Y", js: "y", typ: u(undefined, 0) },
      { json: "Z", js: "z", typ: u(undefined, 0) },
      { json: "Azimuth", js: "azimuth", typ: u(undefined, 0) },
      { json: "Elevation", js: "elevation", typ: u(undefined, 0) },
      { json: "Rotation", js: "rotation", typ: u(undefined, 0) },
      { json: "Connected", js: "connected", typ: u(undefined, true) },
    ],
    false
  ),
  Stats: o(
    [
      { json: "FPS", js: "fps", typ: u(undefined, 3.14) },
      { json: "InferTime", js: "inferTime", typ: u(undefined, 0) },
      { json: "VideoWidth", js: "videoWidth", typ: u(undefined, 0) },
      { json: "VideoHeight", js: "videoHeight", typ: u(undefined, 0) },
      { json: "RunTime", js: "runTime", typ: u(undefined, 0) },
      { json: "GPSConnected", js: "gpsConnected", typ: u(undefined, true) },
      { json: "CPUTempurature", js: "cpuTempurature", typ: u(undefined, 0) },
    ],
    false
  ),
};
