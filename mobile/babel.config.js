// mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Sem o plugin do reanimated (removemos a lib)
    // plugins: ['react-native-reanimated/plugin'],
  };
};
