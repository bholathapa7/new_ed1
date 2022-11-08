
/* eslint-disable no-magic-numbers */
import Color from 'color';

const COLOR_THEME_PRIMARY = '--color-theme-primary';
const COLOR_THEME_PRIMARY_LIGHTER = '--color-theme-primary-lighter';
const COLOR_THEME_PRIMARY_LIGHTEST = '--color-theme-primary-lightest';
const COLOR_THEME_SECONDARY = '--color-theme-secondary';

/**
 * TODO: This is a new palette that is based on the new design system,
 * https://www.figma.com/file/d6TZHGT31nTbph9rulhD3F/Done_Angelswing?node-id=3252%3A0
 * For new projects, it is better to use the colors from the Figma.
 */
const dsPalette = {
  typePrimary: new Color('#4D4C4C'),
  typeSecondary: new Color('#585757'),
  typeTertiary: new Color('#908F8F'),
  typeDisabled: new Color('#C7C7C7'),

  // To avoid 'Parse Error: cannot parse color from string',
  // hex code of the color itself should be used instead of variables
  // Replacing `palette.darkBlue` #1F4782
  themePrimary: new Color('#1F4782'),

  // Replacing `palette.lightNavyBlue` #2B4877
  themePrimaryLighter: new Color('#2B4877'),

  // Replacing `palette.mainColor` #299DD2
  themePrimaryLightest: new Color('#299DD2'),

  // Replacing #A2B2CA
  themeSecondary: new Color('#a2b2ca'),

  errorStatus: new Color('#E03A3A'),

  grey20: new Color('#E9E9E9'),
  grey40: new Color('#D2D2D2'),
  grey60: new Color('#BCBCBC'),
  grey130: new Color('#6E6D6D'),
  grey10: new Color('#F4F4F4'),

  line: new Color('#C7C7C7'),
  title: new Color('#4D4C4C'),
  iconHover: new Color('#E9E9E9'),
  iconClick: new Color('#D2D2D2'),

  categoryHover: new Color('#DEDDDD'),
  categorySelect: new Color('#DDE3EC'),
};

export const updatePrimaryColor: (color: string | undefined) => void = (color) => {
  const rootStyle: CSSStyleDeclaration = getComputedStyle(document.documentElement);
  const themePrimary: string = rootStyle.getPropertyValue(COLOR_THEME_PRIMARY).trim();
  const colorInstance: Color = new Color(color ?? themePrimary);
  const colorLighterInstance: Color = colorInstance.lighten(0.1);
  const colorLightestInstance: Color = colorInstance.lighten(0.25);
  const colorSecondaryInstance: Color = colorInstance.desaturate(0.3);

  document.documentElement.style.setProperty(COLOR_THEME_PRIMARY, colorInstance.toString());
  document.documentElement.style.setProperty(COLOR_THEME_PRIMARY_LIGHTER, colorLighterInstance.toString());
  document.documentElement.style.setProperty(COLOR_THEME_PRIMARY_LIGHTEST, colorLightestInstance.toString());
  document.documentElement.style.setProperty(COLOR_THEME_SECONDARY, colorSecondaryInstance.toString());

  dsPalette.themePrimary = colorInstance;
  dsPalette.themePrimaryLighter = colorLighterInstance;
  dsPalette.themePrimaryLightest = colorLightestInstance;
  dsPalette.themeSecondary = colorSecondaryInstance;
};

export default dsPalette;
