import { config } from "../util/config";
import { Theme } from "./types";

const Default: Theme = {
  id: "default",
  componentBackground: config.colors.grayPurple,
  font: config.colors.white,
  control: config.colors.purple,
  controlHover: config.colors.darkPurple,
};

const Red: Theme = {
  id: "red",
  componentBackground: config.colors.grayPurple,
  font: config.colors.white,
  control: config.colors.red,
  controlHover: config.colors.darkRed,
};

const Blue: Theme = {
  id: "blue",
  componentBackground: config.colors.grayPurple,
  font: config.colors.white,
  control: config.colors.blue,
  controlHover: config.colors.darkBlue,
};

export const themes = {
  default: Default,
  red: Red,
  blue: Blue,
};
