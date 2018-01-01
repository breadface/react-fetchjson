import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace'
import babel from 'rollup-plugin-babel'

export default {
  input: 'examples/entry.js',
  output: {
    file: 'examples/build/bundle.js',
    format: 'cjs'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    resolve({
      jsnext: true
    }),
    commonjs({
      include: 'node_modules/**',
      exclude: 'node_modules/process-es6/**',
      namedExports: {
        'node_modules/react/index.js': ['Children', 'Component', 'PropTypes', 'createElement'],
        'node_modules/react-dom/index.js': ['render']
      }
    }),
    babel({
      exclude: 'node_modules/**', // only transpile our source code
      runtimeHelpers: true
    })
  ]
};
//
