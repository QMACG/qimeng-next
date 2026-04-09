import { exec } from 'child_process'
import { access, copyFile, mkdir, readdir } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)
const isWindows = os.platform() === 'win32'

const copyDirectory = async (src: string, dest: string): Promise<void> => {
  await mkdir(dest, { recursive: true })
  const entries = await readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}

const pathExists = async (target: string) => {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

const copyStandaloneAssets = async () => {
  const standaloneDir = '.next/standalone'
  if (!(await pathExists(standaloneDir))) {
    console.log('Standalone output not found. Skip standalone asset copy.')
    return
  }

  if (isWindows) {
    console.log('Detected Windows OS. Copying standalone assets with fs APIs.')
    await copyDirectory('public', '.next/standalone/public')
    await copyDirectory('.next/static', '.next/standalone/.next/static')
    console.log('Standalone assets copied successfully.')
    return
  }

  console.log('Detected non-Windows OS. Copying standalone assets with cp.')
  await execAsync('cp -r public .next/standalone/')
  await execAsync('cp -r .next/static .next/standalone/.next/')
  console.log('Standalone assets copied successfully.')
}

const copyFiles = async () => {
  try {
    const { stdout, stderr } = await execAsync('corepack pnpm build:sitemap')
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)

    await copyStandaloneAssets()
  } catch (error) {
    console.error('Postbuild failed:', error)
    process.exit(1)
  }
}

copyFiles()
