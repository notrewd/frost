export type ProjectOpenedEvent = {
  name: string;
  path: string;
  data: string;
};

export type ThemeChangedEvent = {
  theme: "light" | "dark" | "system";
};
