import path from 'path'
import { fileURLToPath } from 'url'
import TerserPlugin from 'terser-webpack-plugin'

const isProd = process.argv.includes('--production')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'eval-cheap-module-source-map', // ОПТИМИЗАЦИЯ: Самый быстрый source map

  output: {
    filename: '[name].js',
    // ОПТИМИЗАЦИЯ: Отключаем pathinfo в dev для ускорения
    pathinfo: false,
  },

  // ОПТИМИЗАЦИЯ: Кеширование для быстрой пересборки
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    // ОПТИМИЗАЦИЯ: Более агрессивное кэширование
    buildDependencies: {
      config: [__filename],
    },
  },

  optimization: {
    // ОПТИМИЗАЦИЯ: Отключаем оптимизации в dev режиме
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
    // ОПТИМИЗАЦИЯ: Ускоряем dev сборку
    removeAvailableModules: isProd,
    removeEmptyChunks: isProd,
    splitChunks: false,
  },

  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: 'swc-loader',
          options: {
            // Конфигурация из .swcrc будет использована автоматически
            // ОПТИМИЗАЦИЯ: SWC в 5-10 раз быстрее ts-loader + babel-loader
            // Написан на Rust, поддерживает TS и JS из коробки
          },
        },
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src/scripts'),
    },
    // ОПТИМИЗАЦИЯ: Ускоряем резолвинг модулей
    symlinks: false,
  },

  // ОПТИМИЗАЦИЯ: Отключаем ненужные предупреждения и логи
  stats: {
    warnings: false,
    modules: false,
    entrypoints: false,
  },
  
  // ОПТИМИЗАЦИЯ: Отключаем performance hints в dev
  performance: {
    hints: isProd ? 'warning' : false,
  },
}
