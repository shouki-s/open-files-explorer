import * as path from 'node:path'
import glob from 'glob'
import Mocha from 'mocha'

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  })

  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((c, e) => {
    glob(
      '**/**.test.js',
      { cwd: testsRoot },
      (err: Error | null, files: string[]) => {
        if (err) {
          return e(err)
        }

        for (const f of files) {
          mocha.addFile(path.resolve(testsRoot, f))
        }

        try {
          mocha.run((failures: number) => {
            if (failures > 0) {
              e(new Error(`${failures} tests failed.`))
            } else {
              c()
            }
          })
        } catch (err) {
          console.error(err)
          e(err)
        }
      },
    )
  })
}
