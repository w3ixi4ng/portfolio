import { profile } from '../data/profile'

interface Props {
  cwd: string
  dim?: boolean
}

export function Prompt({ cwd, dim = false }: Props) {
  const cwdLabel = cwd === '~' ? '~' : cwd
  return (
    <span className={`pl${dim ? ' pl-dim' : ''}`}>
      <span className="pl-seg pl-user">{profile.username}</span>
      <span className="pl-arr pl-arr1">▶</span>
      <span className="pl-seg pl-host">{profile.promptHost}</span>
      <span className="pl-arr pl-arr2">▶</span>
      <span className="pl-seg pl-cwd">{cwdLabel}</span>
      <span className="pl-arr pl-arr3">▶</span>
    </span>
  )
}
