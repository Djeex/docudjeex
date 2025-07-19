export interface CLIOptions {
  name: string
  description: string
  setup: DocsOptions
}

export interface DocsOptions {
  dev?: boolean
  defaults?: {
    // Module name
    name?: string
    // Module description
    description?: string
    // Docs directory
    dir?: string
    // Website URL
    url?: string
    // GitHub repository
    github?: string
    // GitHub branch
    branch?: string
  }
}
