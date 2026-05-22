export interface HistoryEntry {
  id: number
  input: string
  output: React.ReactNode
}

export interface Command {
  description: string
  handler: (args: string[], fs: FileSystem) => React.ReactNode
}

export interface FileSystemNode {
  type: 'file' | 'dir'
  content?: React.ReactNode
  children?: Record<string, FileSystemNode>
}

export type FileSystem = Record<string, FileSystemNode>
