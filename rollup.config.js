import path from 'path'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import nodeGlobals from 'rollup-plugin-node-globals'

const outputDir = 'dist/'
const config = {
  input: `src/index.ts`,
  output: [
    {
      name: 'auto-i18n',
      file: path.join(outputDir, 'auto-i18n.js'),
      format: 'umd',
      sourcemap: false,
      plugins: [terser()],
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({ useTsconfigDeclarationDir: true }),
    nodeGlobals({
      process: true,
      global: false,
      buffer: false,
      filename: false,
      dirname: false,
      baseDir: false,
    }),
  ],
}
export default config
