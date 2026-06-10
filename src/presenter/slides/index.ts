import { ComponentType } from "react";

export interface SlideDefinition {
  id: string;
  section: 1 | 2 | 3 | 4 | 5;
  accent: "cyan" | "pink" | "gold" | "green" | "mixed";
  component: ComponentType<{ active: boolean }>;
  studentEvent?: string;
}

import { section1Slides } from "./Section1Slides";
import { section2Slides } from "./Section2Slides";
import { section3Slides } from "./Section3Slides";
import { section4Slides } from "./Section4Slides";
import { section5Slides } from "./Section5Slides";

export const slides: SlideDefinition[] = [
  ...section1Slides,
  ...section2Slides,
  ...section3Slides,
  ...section4Slides,
  ...section5Slides,
];
