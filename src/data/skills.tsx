import type { IconType } from 'react-icons'
import {
  SiPython, SiJavascript, SiTypescript, SiPhp, SiHtml5, SiCss,
  SiFastapi, SiFlask, SiReact, SiVuedotjs, SiNodedotjs, SiTailwindcss, SiBootstrap, SiPandas,
  SiDocker, SiKubernetes, SiRabbitmq, SiGit, SiFirebase, SiVercel, SiGooglecloud,
} from 'react-icons/si'
import { FaJava, FaDatabase } from 'react-icons/fa'
import { TbBrandAws, TbBrandAzure } from 'react-icons/tb'
import { skills } from './profile'

const SKILL_META: Record<string, { icon: IconType; color: string }> = {
  'Python':      { icon: SiPython,      color: '#3776AB' },
  'Java':        { icon: FaJava,        color: '#ED8B00' },
  'JavaScript':  { icon: SiJavascript,  color: '#F7DF1E' },
  'TypeScript':  { icon: SiTypescript,  color: '#3178C6' },
  'PHP':         { icon: SiPhp,         color: '#777BB4' },
  'HTML':        { icon: SiHtml5,       color: '#E34F26' },
  'CSS':         { icon: SiCss,         color: '#1572B6' },
  'SQL':         { icon: FaDatabase,    color: '#00758F' },
  'FastAPI':     { icon: SiFastapi,     color: '#009688' },
  'Flask':       { icon: SiFlask,       color: '#d0d0d0' },
  'React.js':    { icon: SiReact,       color: '#61DAFB' },
  'Vue.js':      { icon: SiVuedotjs,    color: '#4FC08D' },
  'Node.js':     { icon: SiNodedotjs,   color: '#339933' },
  'Tailwind CSS':{ icon: SiTailwindcss, color: '#06B6D4' },
  'Bootstrap':   { icon: SiBootstrap,   color: '#7952B3' },
  'Pandas':      { icon: SiPandas,      color: '#e70488' },
  'Docker':      { icon: SiDocker,      color: '#2496ED' },
  'Kubernetes':  { icon: SiKubernetes,  color: '#326CE5' },
  'RabbitMQ':    { icon: SiRabbitmq,    color: '#FF6600' },
  'Git':         { icon: SiGit,         color: '#F05032' },
  'AWS':         { icon: TbBrandAws,    color: '#FF9900' },
  'Azure':       { icon: TbBrandAzure,  color: '#0078D4' },
  'Firebase':    { icon: SiFirebase,    color: '#FFCA28' },
  'Vercel':      { icon: SiVercel,      color: '#e0e0e0' },
  'Google Cloud':{ icon: SiGooglecloud, color: '#4285F4' },
}

function resolve(names: string[]) {
  return names.flatMap(name => {
    const meta = SKILL_META[name]
    return meta ? [{ name, ...meta }] : []
  })
}

export interface SkillEntry { icon: IconType; name: string; color: string }
export interface SkillSection { label: string; skills: SkillEntry[] }

export const skillSections: SkillSection[] = [
  { label: 'Languages',   skills: resolve(skills.languages)  },
  { label: 'Frameworks',  skills: resolve(skills.frameworks) },
  { label: 'Tools',       skills: resolve(skills.tools)      },
  { label: 'Cloud',       skills: resolve(skills.cloud)      },
]
