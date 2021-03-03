const project_folder = './docs';
const source_folder = './src';

const path = {
  build: {
    html: project_folder + '/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
    fonts: project_folder + '/fonts/',
    libs: project_folder + '/libs/',
  },
  src: {
    html: source_folder + '/main.html',
    css: source_folder + '/scss/style.scss',
    js: source_folder + '/js/script.js',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts: source_folder + '/fonts/*.ttf',
    libs: source_folder + '/libs/*.{js,css}',
  },
  watch: {
    html: [source_folder + '/**/*.html', '!' + source_folder + '/index.html'],
    css: source_folder + '/**/*.scss',
    js: source_folder + '/**/*.js',
    ts: source_folder + '/**/*.ts',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
  },
};

const { src, dest, watch, parallel, series } = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  rename = require('gulp-rename'),
  imagemin = require('gulp-imagemin'),
  svgSprite = require('gulp-svg-sprite'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter'),
  webpackStream = require('webpack-stream'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin'),
  TerserWebpackPlugin = require('terser-webpack-plugin'),
  HTMLWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const webpack = {
  filename(ext) {
    return isDev ? `[name].${ext}` : `[name].[hash].${ext}`;
  },

  optimization() {
    const config = {
      splitChunks: {
        chunks: 'all',
      },
    };

    if (isProd) {
      config.minimizer = [new OptimizeCssAssetWebpackPlugin(), new TerserWebpackPlugin()];
    }

    return config;
  },

  babelOptions(preset) {
    const opts = {
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-proposal-class-properties'],
    };

    if (preset) {
      opts.presets.push(preset);
    }

    return opts;
  },
};

webpack.config = {
  watch: isDev,

  output: {
    filename: webpack.filename('js'),
  },

  resolve: {
    //чтобы не писать расширения для файлов -- import test from './test'; .js/.json
    extensions: ['.js', '.json', '.ts'],
  },

  mode: isDev ? 'development' : 'production',

  entry: {
    main: ['@babel/polyfill', './src/index.js'],
  },

  devtool: isDev ? 'source-map' : '',

  optimization: webpack.optimization(),

  plugins: [
    new HTMLWebpackPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new MiniCssExtractPlugin({
      filename: webpack.filename('css'),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true,
            },
          },
          'css-loader',
        ],
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: webpack.babelOptions(),
        },
      },

      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: webpack.babelOptions('@babel/preset-typescript'),
        },
      },
    ],
  },
};

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: './' + project_folder + '/',
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(
      rename({
        basename: 'index',
      })
    )
    .pipe(dest('./src'))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true,
      })
    )
    .pipe(dest('./src/scss'))
    .pipe(browsersync.stream());
}

function js() {
  return src('./src/index.js').pipe(webpackStream(webpack.config)).pipe(dest(project_folder)).pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

function fonts(params) {
  src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
  return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function watchFiles(params) {
  watch(path.watch.html, html);
  watch([path.watch.css], css);
  watch([path.watch.js, path.watch.ts], js);
  watch([path.watch.img], images);
}

function clean(params) {
  return del(project_folder);
}

function copyLibs() {
  return src(path.src.libs).pipe(dest(path.build.libs)).pipe(browsersync.stream());
}

const build = series(clean, parallel(js, css, html, fonts, images, copyLibs));

// * tasks

function otf2ttfTask() {
  return src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({ formats: ['ttf'] }))
    .pipe(dest(source_folder + '/fonts/'));
}

function svgSpriteTask() {
  return gulp
    .src([source_folder + '/iconsprite/*.svg'])
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../icons/icons.svg', //sprite file name
            example: true,
          },
        },
      })
    )
    .pipe(dest(path.build.img));
}

exports.otf2ttfTask = otf2ttfTask;
exports.svgSpriteTask = svgSpriteTask;
exports.build = build;
exports.default = parallel(build, watchFiles, browserSync);
