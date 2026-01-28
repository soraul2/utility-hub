export type TextToMdMode = "local" | "ai";

export type Persona =
  | "STANDARD"
  | "SMART"
  | "DRY"
  | "ACADEMIC"
  | "CASUAL"
  | "TECHNICAL"
  | "CREATIVE"
  | "MINIMAL"
  | "DETAILED"
  | "BUSINESS";

export interface TextToMdOptions {
  autoHeading: boolean;
  autoList: boolean;
}
