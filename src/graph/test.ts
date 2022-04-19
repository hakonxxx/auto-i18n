import { getDependencyGraphObj } from './index.js'
import { repoDir } from '../utils/dir.js'
import path from 'path'

getDependencyGraphObj(path.resolve(repoDir, './src/index.ts'))
