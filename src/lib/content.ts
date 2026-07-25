import type { LearningWorld, TraceLesson, TraceStroke } from "@/types/learning";

const stroke = (id: string, label: string, points: Array<[number, number]>): TraceStroke => ({
  id,
  label,
  points: points.map(([x, y]) => ({ x, y })),
});

const letter = (
  id: string,
  glyph: string,
  sound: string,
  example: string,
  strokes: TraceStroke[],
): TraceLesson => ({
  id,
  title: `${glyph} is for ${example}`,
  shortTitle: glyph,
  kind: "letter",
  sound,
  example,
  prompt: `Trace ${glyph}. Start at the glowing dot.`,
  glyph,
  strokes,
  reward: "sticker",
});

const numberLesson = (value: number, strokes: TraceStroke[]): TraceLesson => ({
  id: `number-${value}`,
  title: `Write ${value}`,
  shortTitle: `${value}`,
  kind: "number",
  example: `${value} sea treasures`,
  prompt: `Trace ${value}, then count with me.`,
  glyph: `${value}`,
  strokes,
  reward: "puzzle",
});

const translateStroke = (source: TraceStroke, dx: number, dy: number, scale = 1): TraceStroke => ({
  ...source,
  points: source.points.map((point) => ({ x: point.x * scale + dx, y: point.y * scale + dy })),
});

const digitMap: Record<string, TraceStroke[]> = {
  "0": [stroke("oval", "Round and close", [[172, 82], [105, 125], [112, 235], [180, 278], [245, 232], [238, 126], [172, 82]])],
  "1": [stroke("top", "Little slant", [[160, 126], [198, 82]]), stroke("down", "Straight down", [[198, 82], [198, 270]]), stroke("base", "Feet", [[154, 270], [238, 270]])],
  "2": [stroke("curve", "Curve and slide", [[118, 135], [168, 76], [248, 105], [230, 170], [120, 268], [252, 268]])],
  "3": [stroke("top", "Top bump", [[120, 95], [230, 95], [178, 168], [238, 170]]), stroke("bottom", "Bottom bump", [[238, 170], [250, 252], [150, 274], [108, 235]])],
  "4": [stroke("down", "Down", [[224, 80], [116, 214], [258, 214]]), stroke("stem", "Tall line", [[224, 80], [224, 270]])],
  "5": [stroke("top", "Across and down", [[245, 88], [135, 88], [122, 168]]), stroke("belly", "Round belly", [[122, 168], [230, 154], [250, 244], [152, 270], [112, 224]])],
  "6": [stroke("six", "Curve and loop", [[238, 105], [170, 75], [112, 150], [126, 248], [218, 266], [250, 198], [192, 160], [126, 198]])],
  "7": [stroke("seven", "Across and slide", [[112, 92], [252, 92], [170, 270]])],
  "8": [stroke("top-loop", "Top loop", [[180, 170], [118, 126], [168, 72], [230, 118], [180, 170]]), stroke("bottom-loop", "Bottom loop", [[180, 170], [250, 224], [188, 282], [112, 226], [180, 170]])],
  "9": [stroke("nine", "Loop and down", [[220, 170], [190, 95], [115, 120], [132, 205], [214, 210], [248, 138], [210, 270]])],
};

const numberTraceLesson = (value: number): TraceLesson => {
  const digits = String(value).split("");
  const scale = digits.length === 1 ? 1 : 0.72;
  const spacing = 122;
  const startX = digits.length === 1 ? 0 : 32;
  const strokes = digits.flatMap((digit, index) =>
    digitMap[digit].map((item) => translateStroke(item, startX + index * spacing, 22, scale)),
  );

  return numberLesson(value, strokes.map((item, index) => ({ ...item, id: `${item.id}-${index}` })));
};

const shapeLesson = (id: string, glyph: string, title: string, strokes: TraceStroke[]): TraceLesson => ({
  id: `shape-${id}`,
  title,
  shortTitle: glyph,
  kind: "shape",
  prompt: `Trace the ${title.toLowerCase()}.`,
  glyph,
  strokes,
  reward: "decoration",
});

const motorLesson = (id: string, title: string, glyph: string, strokes: TraceStroke[]): TraceLesson => ({
  id: `motor-${id}`,
  title,
  shortTitle: glyph,
  kind: "motor",
  prompt: `Follow the path with a calm hand.`,
  glyph,
  strokes,
  reward: "pet",
});

const letterExamples: Record<string, string> = {
  A: "Apple",
  B: "Berry",
  C: "Cloud",
  D: "Drum",
  E: "Egg",
  F: "Fish",
  G: "Garden",
  H: "Hat",
  I: "Igloo",
  J: "Jam",
  K: "Kite",
  L: "Leaf",
  M: "Moon",
  N: "Nest",
  O: "Orange",
  P: "Pond",
  Q: "Quilt",
  R: "Rainbow",
  S: "Sun",
  T: "Tree",
  U: "Umbrella",
  V: "Van",
  W: "Wave",
  X: "X-ray",
  Y: "Yarn",
  Z: "Zip",
};

const letterSound = (char: string) => `/${char.toLowerCase()}/`;

const uppercaseStrokeTemplates: Record<string, TraceStroke[]> = {
  A: [stroke("left", "Slide down", [[125, 260], [178, 80]]), stroke("right", "Slide down", [[178, 80], [232, 260]]), stroke("middle", "Bridge across", [[148, 188], [211, 188]])],
  B: [stroke("stem", "Tall line", [[132, 75], [132, 262]]), stroke("top-belly", "Top bump", [[132, 80], [220, 82], [218, 166], [132, 166]]), stroke("bottom-belly", "Bottom bump", [[132, 166], [232, 170], [226, 260], [132, 260]])],
  C: [stroke("curve", "Open curve", [[236, 116], [184, 70], [104, 122], [114, 232], [218, 262]])],
  D: [stroke("stem", "Tall line", [[126, 80], [126, 264]]), stroke("curve", "Big curve", [[126, 80], [246, 92], [254, 238], [126, 264]])],
  E: [stroke("stem", "Tall line", [[128, 82], [128, 262]]), stroke("top", "Top arm", [[128, 82], [244, 82]]), stroke("middle", "Middle arm", [[128, 172], [220, 172]]), stroke("bottom", "Bottom arm", [[128, 262], [244, 262]])],
  F: [stroke("stem", "Tall line", [[128, 82], [128, 262]]), stroke("top", "Top arm", [[128, 82], [244, 82]]), stroke("middle", "Middle arm", [[128, 172], [220, 172]])],
  G: [stroke("curve", "Around", [[238, 122], [180, 70], [100, 120], [112, 230], [212, 260], [250, 202], [196, 202]])],
  H: [stroke("left", "Tall line", [[126, 82], [126, 262]]), stroke("right", "Tall line", [[236, 82], [236, 262]]), stroke("bridge", "Bridge", [[126, 172], [236, 172]])],
  I: [stroke("top", "Top", [[136, 82], [224, 82]]), stroke("down", "Down", [[180, 82], [180, 262]]), stroke("bottom", "Bottom", [[136, 262], [224, 262]])],
  J: [stroke("hook", "Down and hook", [[226, 82], [226, 218], [190, 268], [122, 232]])],
  K: [stroke("stem", "Tall line", [[128, 82], [128, 262]]), stroke("upper", "Kick up", [[238, 82], [128, 172]]), stroke("lower", "Kick down", [[128, 172], [244, 262]])],
  L: [stroke("line", "Down and across", [[130, 82], [130, 262], [244, 262]])],
  M: [stroke("mountains", "Mountain lines", [[102, 262], [102, 82], [180, 172], [258, 82], [258, 262]])],
  N: [stroke("slant", "Down, slide, down", [[118, 262], [118, 82], [244, 262], [244, 82]])],
  O: [stroke("oval", "Round and close", [[180, 70], [94, 150], [126, 252], [232, 252], [266, 150], [180, 70]])],
  P: [stroke("stem", "Tall line", [[126, 82], [126, 262]]), stroke("bump", "Round top", [[126, 82], [236, 92], [222, 178], [126, 174]])],
  Q: [stroke("oval", "Round and close", [[180, 70], [94, 150], [126, 252], [232, 252], [266, 150], [180, 70]]), stroke("tail", "Little tail", [[214, 222], [260, 270]])],
  R: [stroke("stem", "Tall line", [[126, 82], [126, 262]]), stroke("bump", "Round top", [[126, 82], [236, 92], [222, 176], [126, 174]]), stroke("leg", "Kick out", [[152, 176], [246, 262]])],
  S: [stroke("snake", "S curve", [[224, 98], [154, 70], [104, 123], [150, 172], [222, 174], [254, 232], [168, 270], [102, 238]])],
  T: [stroke("top", "Top line", [[104, 82], [256, 82]]), stroke("down", "Down", [[180, 82], [180, 262]])],
  U: [stroke("u", "Down and around", [[112, 82], [112, 218], [180, 270], [248, 218], [248, 82]])],
  V: [stroke("v", "Down and up", [[110, 82], [180, 262], [250, 82]])],
  W: [stroke("w", "Zig and zag", [[84, 82], [122, 262], [180, 150], [238, 262], [276, 82]])],
  X: [stroke("first", "Slide", [[112, 82], [248, 262]]), stroke("second", "Slide", [[248, 82], [112, 262]])],
  Y: [stroke("fork", "Fork", [[108, 82], [180, 172], [252, 82]]), stroke("stem", "Down", [[180, 172], [180, 262]])],
  Z: [stroke("zig", "Across, slide, across", [[104, 82], [252, 82], [108, 262], [256, 262]])],
};

const lowerStrokeTemplates: Record<string, TraceStroke[]> = {
  a: [stroke("circle", "Around", [[205, 190], [190, 140], [140, 140], [118, 190], [145, 240], [198, 226], [205, 190]]), stroke("tail", "Down tail", [[205, 145], [205, 255]])],
  b: [stroke("stem", "Tall line", [[126, 78], [126, 260]]), stroke("belly", "Round belly", [[126, 170], [196, 130], [246, 184], [208, 254], [126, 230]])],
  c: [stroke("curve", "Open curve", [[226, 140], [180, 98], [112, 145], [122, 226], [205, 244]])],
  d: [stroke("circle", "Around", [[205, 190], [190, 140], [140, 140], [118, 190], [145, 240], [198, 226], [205, 190]]), stroke("stem", "Tall line", [[205, 78], [205, 255]])],
  e: [stroke("loop", "Loop across", [[118, 182], [230, 182], [204, 118], [126, 142], [132, 232], [224, 234]])],
  f: [stroke("hook", "Hook and down", [[220, 86], [166, 74], [154, 140], [154, 268]]), stroke("cross", "Cross", [[108, 150], [210, 150]])],
  g: [stroke("circle", "Around", [[205, 190], [190, 140], [140, 140], [118, 190], [145, 240], [198, 226], [205, 190]]), stroke("tail", "Loop tail", [[205, 145], [205, 280], [150, 300], [130, 260]])],
  h: [stroke("stem", "Tall line", [[126, 78], [126, 260]]), stroke("hump", "Hump", [[126, 174], [178, 122], [230, 174], [230, 260]])],
  i: [stroke("down", "Down", [[180, 132], [180, 260]]), stroke("dot", "Dot", [[180, 88], [180, 88]])],
  j: [stroke("hook", "Down and hook", [[204, 132], [204, 270], [152, 302], [122, 260]]), stroke("dot", "Dot", [[204, 88], [204, 88]])],
  k: [stroke("stem", "Tall line", [[126, 78], [126, 260]]), stroke("kick", "Kick", [[230, 134], [126, 202], [236, 260]])],
  l: [stroke("line", "Tall line", [[180, 78], [180, 260]])],
  m: [stroke("m", "Two humps", [[106, 260], [106, 142], [154, 122], [180, 190], [226, 122], [254, 190], [254, 260]])],
  n: [stroke("n", "One hump", [[126, 260], [126, 142], [184, 122], [230, 190], [230, 260]])],
  o: [stroke("oval", "Round and close", [[180, 118], [112, 170], [132, 248], [224, 248], [248, 170], [180, 118]])],
  p: [stroke("stem", "Down below", [[126, 132], [126, 306]]), stroke("belly", "Round belly", [[126, 150], [198, 124], [246, 182], [206, 246], [126, 226]])],
  q: [stroke("circle", "Around", [[205, 190], [190, 140], [140, 140], [118, 190], [145, 240], [198, 226], [205, 190]]), stroke("tail", "Down tail", [[205, 145], [205, 306]])],
  r: [stroke("r", "Down and shoulder", [[126, 260], [126, 142], [178, 124], [220, 150]])],
  s: [stroke("snake", "Small S", [[224, 132], [154, 110], [112, 150], [164, 188], [222, 196], [200, 250], [124, 238]])],
  t: [stroke("down", "Down", [[176, 88], [176, 252], [220, 260]]), stroke("cross", "Cross", [[124, 144], [224, 144]])],
  u: [stroke("u", "Down and up", [[118, 142], [118, 226], [172, 260], [226, 226], [226, 142]])],
  v: [stroke("v", "Down and up", [[116, 142], [180, 260], [244, 142]])],
  w: [stroke("w", "Little zig-zag", [[88, 142], [126, 260], [180, 184], [234, 260], [272, 142]])],
  x: [stroke("first", "Slide", [[122, 142], [238, 260]]), stroke("second", "Slide", [[238, 142], [122, 260]])],
  y: [stroke("y", "Down and tail", [[114, 142], [178, 246], [242, 142], [176, 300], [126, 270]])],
  z: [stroke("zig", "Across, slide, across", [[118, 142], [238, 142], [120, 260], [240, 260]])],
};

const alphabetLessons = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((char) =>
    letter(`upper-${char.toLowerCase()}`, char, letterSound(char), letterExamples[char], uppercaseStrokeTemplates[char]),
  );
  const lowercase = "abcdefghijklmnopqrstuvwxyz".split("").map((char) =>
    letter(`lower-${char}`, char, letterSound(char), letterExamples[char.toUpperCase()], lowerStrokeTemplates[char]),
  );
  return [...uppercase, ...lowercase];
};

export const worlds: LearningWorld[] = [
  {
    id: "alphabet",
    title: "Alphabet Forest",
    subtitle: "Letters, sounds, and cozy word paths",
    color: "#46C867",
    accent: "#FFE66D",
    icon: "A",
    mapPath: "M20 170 C80 70 160 230 230 95 S360 85 420 180",
    lessons: alphabetLessons(),
  },
  {
    id: "numbers",
    title: "Number Ocean",
    subtitle: "Count shells and trace bubbly numbers",
    color: "#23A8F2",
    accent: "#7BE7FF",
    icon: "3",
    mapPath: "M18 155 C70 210 112 64 174 145 S270 230 330 118 S400 135 430 190",
    lessons: Array.from({ length: 21 }, (_, value) => numberTraceLesson(value)),
  },
  {
    id: "shapes",
    title: "Shape Galaxy",
    subtitle: "Draw friendly constellations and patterns",
    color: "#7B61FF",
    accent: "#FF8BE3",
    icon: "☆",
    mapPath: "M36 202 L106 96 L176 196 L260 82 L345 200 L424 110",
    lessons: [
      shapeLesson("circle", "○", "Circle", [stroke("circle", "Round circle", [[180, 70], [95, 150], [128, 250], [230, 250], [268, 150], [180, 70]])]),
      shapeLesson("triangle", "△", "Triangle", [stroke("left", "Up", [[105, 260], [180, 80]]), stroke("right", "Down", [[180, 80], [255, 260]]), stroke("base", "Across", [[255, 260], [105, 260]])]),
      shapeLesson("square", "□", "Square", [stroke("box", "Four sides", [[105, 90], [255, 90], [255, 250], [105, 250], [105, 90]])]),
      shapeLesson("rectangle", "▭", "Rectangle", [stroke("box", "Four sides", [[80, 112], [280, 112], [280, 230], [80, 230], [80, 112]])]),
      shapeLesson("heart", "♡", "Heart", [stroke("heart", "Bump, bump, point", [[180, 260], [92, 178], [122, 88], [180, 140], [238, 88], [268, 178], [180, 260]])]),
      shapeLesson("diamond", "◇", "Diamond", [stroke("diamond", "Four points", [[180, 72], [270, 170], [180, 268], [90, 170], [180, 72]])]),
      shapeLesson("oval", "⬭", "Oval", [stroke("oval", "Long circle", [[180, 96], [82, 150], [110, 242], [250, 242], [278, 150], [180, 96]])]),
      shapeLesson("star", "☆", "Star", [stroke("star", "Pointy star", [[180, 70], [208, 145], [290, 145], [224, 194], [250, 270], [180, 224], [110, 270], [136, 194], [70, 145], [152, 145], [180, 70]])]),
    ],
  },
  {
    id: "colors",
    title: "Rainbow Colors",
    subtitle: "Color words and bright tracing trails",
    color: "#FF5B7F",
    accent: "#FFC857",
    icon: "☀",
    mapPath: "M20 190 C90 60 160 60 230 190 C300 60 365 60 430 190",
    lessons: [
      letter("color-red", "R", "/r/", "Red", [stroke("stem", "Tall line", [[125, 80], [125, 270]]), stroke("round", "Round top", [[125, 80], [226, 86], [218, 166], [125, 166]]), stroke("leg", "Kick out", [[150, 166], [236, 270]])]),
      letter("color-blue", "B", "/b/", "Blue", [stroke("stem", "Tall line", [[132, 75], [132, 262]]), stroke("top", "Top bump", [[132, 80], [220, 82], [218, 166], [132, 166]]), stroke("bottom", "Bottom bump", [[132, 166], [232, 170], [226, 260], [132, 260]])]),
      letter("color-green", "G", "/g/", "Green", [stroke("curve", "Around", [[238, 122], [180, 70], [100, 120], [112, 230], [212, 260], [250, 202], [196, 202]])]),
    ],
  },
  {
    id: "motor",
    title: "Fine Motor Playground",
    subtitle: "Lines, loops, waves, spirals, and zig-zags",
    color: "#FF9F1C",
    accent: "#2EC4B6",
    icon: "↝",
    mapPath: "M20 150 L82 98 L145 204 L205 88 L272 212 L342 96 L430 164",
    lessons: [
      motorLesson("straight", "Straight Lines", "|", [stroke("line", "Down the slide", [[180, 70], [180, 280]])]),
      motorLesson("waves", "Ocean Waves", "∿", [stroke("wave", "Up and down", [[70, 180], [115, 120], [160, 180], [205, 240], [250, 180], [295, 120]])]),
      motorLesson("spiral", "Spiral Shell", "@", [stroke("spiral", "Curl around", [[180, 180], [202, 168], [202, 202], [168, 214], [136, 186], [152, 126], [222, 118], [270, 178], [238, 258], [134, 266], [84, 180]])]),
      motorLesson("zigzag", "Mountain Zig-Zags", "W", [stroke("zigzag", "Point to point", [[70, 90], [125, 270], [180, 90], [235, 270], [290, 90]])]),
      motorLesson("loops", "Loop-de-Loops", "∞", [stroke("loops", "Loop around", [[90, 180], [132, 112], [210, 248], [270, 180], [210, 112], [132, 248], [90, 180]])]),
    ],
  },
];

export const allLessons = worlds.flatMap((world) => world.lessons);
