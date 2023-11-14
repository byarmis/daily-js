import * as dotenv from 'dotenv';
dotenv.config();

import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

import { readFileSync } from 'fs';
const packageLock = JSON.parse(
  readFileSync('package-lock.json', { encoding: 'utf8' })
);
// This works fine after node 16.15, but does not work previous to that with the recent versions of rollup
//import packageLock from './package-lock.json' assert { type: 'json' };
const version = packageLock.version;

const mode = process.env.NODE_ENV || 'production';
const devCallMachineUrl =
  process.env.DEV_CALL_MACHINE_URL ||
  'https://khk-local.wss.daily.co:8000/static/call-machine-object-bundle.js';
const sentryDSN =
  'https://f10f1c81e5d44a4098416c0867a8b740@o77906.ingest.sentry.io/168844';

function makeConfig({ legacyFileName = false } = {}) {
  return {
    input: 'src/module.js',
    output: [
      {
        file: legacyFileName ? 'dist/daily-iframe-esm.js' : 'dist/daily-esm.js',
        format: 'es',
      },
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: false,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(mode),
        __dailyJsVersion__: JSON.stringify(version),
        __devCallMachineUrl__: JSON.stringify(devCallMachineUrl),
        __sentryDSN__: JSON.stringify(sentryDSN),
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'runtime',
        presets: [
          ['@babel/preset-env', { exclude: ['transform-regenerator'] }],
        ],
        plugins: [
          '@babel/plugin-transform-runtime',
          '@babel/plugin-proposal-class-properties',
        ],
      }),
      commonJS({
        include: 'node_modules/**',
        namedExports: {
          'node_modules/lodash/lodash.js': ['orderBy', 'filter'],
        },
      }),
      mode === 'production' && terser(), // minify in production
    ],
  };
}

export default [makeConfig({ legacyFileName: true }), makeConfig()];
