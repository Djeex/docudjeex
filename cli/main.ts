#!/usr/bin/env node

import * as dotenv from 'dotenv'
import { createCLI } from './cli'

dotenv.config()

const cli = createCLI({
  name: 'Docus',
  description: 'Docus Docs CLI',
  setup: {
    defaults: {},
  },
})

cli.runMain()
