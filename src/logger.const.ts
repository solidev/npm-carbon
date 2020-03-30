import chalk from 'chalk';

export type Types = 'dev' | 'docs' | 'error' | 'info' | 'ok' | 'warn'

export const categories = {
  dev: chalk.magenta,
  docs: chalk.cyan,
  error: chalk.red,
  info: chalk.blue,
  ok: chalk.green,
  warn: chalk.yellow,
}

export const prefix = {
  dev: "==> [DEV]",
  docs: "==> [DOCS]",
  error: "==> [ERROR]",
  info: "==> [INFO]",
  ok: "==> [OK]",
  warn: "==> [WARN]",
}
