type ToUpperCase = {
  a: "A";
  b: "B";
  c: "C";
  d: "D";
  e: "E";
  f: "F";
  g: "G";
  h: "H";
  i: "I";
  j: "J";
  k: "K";
  l: "L";
  m: "M";
  n: "N";
  o: "O";
  p: "P";
  q: "Q";
  r: "R";
  s: "S";
  t: "T";
  u: "U";
  v: "V";
  w: "W";
  x: "X";
  y: "Y";
  z: "Z";
};

export type UpperFirst<S extends string> =
  S extends `${infer L extends keyof ToUpperCase}${infer Rest}`
    ? `${ToUpperCase[L]}${Rest}`
    : S;
