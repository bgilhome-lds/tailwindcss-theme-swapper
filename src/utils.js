const Color = require('color')
const colorConfigKeys = [
  'colors',
  'backgroundColor',
  'textColor',
  'borderColor',
]

function kebabCase (string) {
  return string
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/\s+/g, '-')
  .toLowerCase()
}

function tailwindVariableHelper (name) {
  return function ({ opacityVariable, opacityValue } = {}) {
    if (opacityValue !== undefined) {
      return `rgb(var(--${name}) / ${opacityValue})`
    }
    if (opacityVariable !== undefined) {
      return `rgb(var(--${name}) / var(${opacityVariable}, 1))`
    }
    return `rgb(var(--${name}))`
  }
}

function flatten (
  obj,
  transformKeyCallback = key => key.join('.'),
  transformValueCallback = (keys, value) => value,
  previousKeys = [],
  flattened = {}
) {
  return Object
    .entries(obj)
    .reduce((acc, [key, value]) => {
      const keyPath = [...previousKeys, key]

      if (typeof value === 'object') {
        flatten(value, transformKeyCallback, transformValueCallback, keyPath, acc)
      } else {
        flattened[transformKeyCallback(keyPath)] = transformValueCallback(keyPath, value)
      }
      return acc
    }, flattened)
}

const getTailwindKeyName = keys =>
  kebabCase(keys.pop().toLowerCase());

function hasAlpha (color) {
  return (
    color.startsWith('rgba(') ||
    color.startsWith('hsla(') ||
    (color.startsWith('#') && color.length === 9) ||
    (color.startsWith('#') && color.length === 5)
  )
}

function toRgba (color) {
  try {
    const [ r, g, b, a ] = Color(color).rgb().array()
    return [ r, g, b, a === undefined && hasAlpha(color) ? 1 : a ]
  } catch {
    return null
  }
}

function defaultCustomPropValueTransformer (keys, value) {
  return value
}

function defaultConfigValueTransformer (keys, value) {
  if (colorConfigKeys.includes(keys[0])) {
    if (!hasAlpha(value) && toRgba(value)) {
      return tailwindVariableHelper(getTailwindKeyName(keys))
    }
  }

  return `var(--${getTailwindKeyName(keys)}, ${value})`
}


function getThemeAsCustomVars (
  tokenValues,
  transformer = defaultCustomPropValueTransformer
) {
  return flatten(
    tokenValues,
    keys => `--${getTailwindKeyName(keys)}`,
    transformer
  )
}


function resolveThemeConfig (
  tokenValue,
  previousKeys = [],
  valueTransformer = defaultConfigValueTransformer
) {
  return Object
    .entries(tokenValue)
    .reduce((acc, [key, value]) => {
      const keyPath = [ ...previousKeys, key ]
      return {
        ...acc,
        [key]: typeof value === "object"
          ? resolveThemeConfig(value, keyPath)
          : valueTransformer(keyPath, value)
      }
    }, {})
}

module.exports.defaultConfigValueTransformer = defaultConfigValueTransformer
module.exports.defaultCustomPropValueTransformer = defaultCustomPropValueTransformer
module.exports.flatten = flatten
module.exports.getTailwindKeyName = getTailwindKeyName
module.exports.getThemeAsCustomVars = getThemeAsCustomVars
module.exports.resolveThemeConfig = resolveThemeConfig
module.exports.tailwindVariableHelper = tailwindVariableHelper
module.exports.toRgba = toRgba
