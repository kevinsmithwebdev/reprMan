#!/usr/bin/env node
/**
 * One-shot scaffolder: writes a `tsconfig.json` + `project.json` for each
 * client nx lib. Vite consumes lib source directly via path aliases, so libs
 * have no `build` target — only `lint`. Tests are run from the consuming app.
 */
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

const LIBS = [
  { name: 'components', dir: 'libs/components' },
  { name: 'modals', dir: 'libs/modals' },
  { name: 'state', dir: 'libs/state' },
  { name: 'cognito-auth', dir: 'libs/cognito-auth' },
  { name: 'localization', dir: 'libs/localization' },
  { name: 'reprs-api', dir: 'libs/reprs-api' },
  { name: 'utilities', dir: 'libs/utilities' },
  { name: 'constants', dir: 'libs/constants' },
  { name: 'types', dir: 'libs/types' },
  { name: 'theme', dir: 'libs/theme' },
]

const tsconfigContents =
  JSON.stringify(
    {
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        types: ['vite/client', 'vitest/globals', 'node'],
      },
      include: ['src/**/*'],
    },
    null,
    2
  ) + '\n'

const projectJson = (name) =>
  JSON.stringify(
    {
      name,
      $schema: '../../node_modules/nx/schemas/project-schema.json',
      projectType: 'library',
      sourceRoot: `libs/${name}/src`,
      targets: {
        lint: {
          executor: 'nx:run-commands',
          options: {
            command: 'npx eslint "src/**/*.{js,jsx,ts,tsx}" --max-warnings=0',
            cwd: `libs/${name}`,
          },
        },
      },
      tags: ['scope:client'],
    },
    null,
    2
  ) + '\n'

const ensure = (path, contents) => {
  if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents)
}

for (const { name, dir } of LIBS) {
  ensure(join(dir, 'tsconfig.json'), tsconfigContents)
  ensure(join(dir, 'project.json'), projectJson(name))
  console.log(`scaffolded ${name}`)
}
