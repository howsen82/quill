# Development

This repo is a monorepo powered by [pnpm workspaces](https://pnpm.io/workspaces). It contains the following packages:

### quill

This is the Quill library. It's written in [TypeScript](https://www.typescriptlang.org/), and use [Webpack](https://webpack.js.org/) as the bundler.
It uses [Vitest](https://vitest.dev) for unit testing, and [Playwright](https://playwright.dev/) for E2E testing.

### website

It's Quill's website (hosted at [quilljs.com](https://quilljs.com/)). It's built with [Next.js](https://nextjs.org/).

## Setup

To prepare your local environment for development, ensure you have Node.js and [pnpm](https://pnpm.io/installation) installed. The repo uses pnpm, and doesn't support npm and Yarn.

Install the necessary dependencies with the command below:

```shell
pnpm install
```

Start the development environment using:

```shell
pnpm start
```

This command starts two services:

- Quill's webpack dev server
- Website's Next.js dev server

These servers dynamically build and serve the latest copy of the source code.

Access the running website at [localhost:9000](http://localhost:9000/). By default, the website will use your local Quill build, that includes all the examples in the website. This convenient setup allows for seamless development and ensures changes to Quill do not disrupt the website's content.

If you need to modify only the website's code, start the website with `pnpm --filter website start`. This makes the website use the latest CDN version.

## Testing

To run the unit tests in watch mode, run:

    pnpm --filter quill run test:unit

To execute the E2E tests, run:

    pnpm --filter quill run test:e2e

## Workflow

A standard development workflow involves:

1. `pnpm start` - to run development services
2. [localhost:9000/standalone/snow](http://localhost:9000/standalone/snow) - to interactively develop and test an isolated example
3. `pnpm --filter quill run test:unit` - to run unit tests
4. If everything is working, run the E2E tests