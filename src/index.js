const plugin = require('tailwindcss/plugin')
const { getThemeAsCustomVars, resolveThemeConfig } = require('./utils')

const defaultOptions = {
  themes: [],
}

const themeSwap = (options = defaultOptions) => ({ addBase, addUtilities }) => {
  const { themes } = options

  themes.forEach(themeConfig => {
    const { theme, mediaQuery, selectors = [] } = themeConfig
    const styles = {};

    if (selectors.length > 0) {
      styles[selectors.join(', ')] = getThemeAsCustomVars(theme);
    }

    if (mediaQuery) {
      styles[mediaQuery] = {
        ':root': getThemeAsCustomVars(theme),
      };
    }

    addBase(styles);
    addUtilities(styles);
  })
}

module.exports = plugin.withOptions(
  themeSwap,
  (options = defaultOptions) => {
    const baseTheme = options
      .themes
      .find(theme => theme.name === 'base')

    return {
      theme: {
        extend: baseTheme && baseTheme.theme
          ? resolveThemeConfig(baseTheme.theme)
          : {}
      }
    }
  }
)
