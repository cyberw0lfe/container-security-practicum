import { execSync, exec } from 'child_process'
import { ExecOutput } from '../types'

export const executeCommand = (command: string) => {
  try {
    const stdout = execSync(command, {
      maxBuffer: 1024 * 1024 * 10,
      stdio: 'pipe',
    }).toString('utf-8')
    return { error: null, stderr: null, stdout }
  } catch (error) {
    return {
      error: error.message,
      stderr: error.stderr ? error.stderr.toString('utf-8') : null,
      stdout: error.stdout ? error.stdout.toString('utf-8') : null,
    }
  }
}

export const executeCommandAsync = async (
  command: string,
): Promise<ExecOutput> => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      // @ts-ignore
      { maxBuffer: 1024 * 1024 * 10, stdio: 'pipe' },
      (error, stdout, stderr) => {
        if (error) {
          resolve({
            error: error.message,
            stderr: stderr ? stderr.toString() : null,
            stdout: stdout ? stdout.toString() : null,
          })
        } else {
          resolve({
            error: null,
            stderr: stderr ? stderr.toString('utf-8') : null,
            stdout: stdout.toString('utf-8'),
          })
        }
      },
    )
  })
}
