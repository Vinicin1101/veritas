import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
  // UMD build para CDN/browser
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/veritas-sdk.umd.js',
        format: 'umd',
        name: 'Veritas',
        sourcemap: true
      },
      {
        file: 'dist/veritas-sdk.umd.min.js',
        format: 'umd',
        name: 'Veritas',
        plugins: [terser()],
        sourcemap: true
      }
    ],
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
    ]
  },
  // ESM build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/veritas-sdk.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      production && terser()
    ]
  },
  // CommonJS build para Node.js
  {
    input: 'src/index.js',
    output: {
      file: 'dist/veritas-sdk.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      production && terser()
    ]
  }
];

