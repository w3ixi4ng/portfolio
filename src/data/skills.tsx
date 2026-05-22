import type { IconType } from 'react-icons'
import {
  SiPython, SiJavascript, SiTypescript, SiPhp, SiHtml5, SiCss,
  SiFastapi, SiFlask, SiReact, SiVuedotjs, SiNodedotjs, SiTailwindcss, SiBootstrap, SiPandas,
  SiDocker, SiKubernetes, SiRabbitmq, SiGit, SiFirebase, SiVercel, SiGooglecloud,
} from 'react-icons/si'
import { FaJava, FaDatabase } from 'react-icons/fa'
import { TbBrandAws, TbBrandAzure } from 'react-icons/tb'

export interface SkillEntry { icon: IconType; name: string }
export interface SkillSection { label: string; skills: SkillEntry[] }

export const skillSections: SkillSection[] = [
  {
    label: 'Languages',
    skills: [
      { icon: SiPython,     name: 'Python'     },
      { icon: FaJava,       name: 'Java'        },
      { icon: SiJavascript, name: 'JavaScript'  },
      { icon: SiTypescript, name: 'TypeScript'  },
      { icon: SiPhp,        name: 'PHP'         },
      { icon: SiHtml5,      name: 'HTML'        },
      { icon: SiCss,        name: 'CSS'         },
      { icon: FaDatabase,   name: 'SQL'         },
    ],
  },
  {
    label: 'Frameworks',
    skills: [
      { icon: SiFastapi,     name: 'FastAPI'      },
      { icon: SiFlask,       name: 'Flask'        },
      { icon: SiReact,       name: 'React.js'     },
      { icon: SiVuedotjs,    name: 'Vue.js'       },
      { icon: SiNodedotjs,   name: 'Node.js'      },
      { icon: SiTailwindcss, name: 'Tailwind CSS' },
      { icon: SiBootstrap,   name: 'Bootstrap'    },
      { icon: SiPandas,      name: 'Pandas'       },
    ],
  },
  {
    label: 'Tools',
    skills: [
      { icon: SiDocker,     name: 'Docker'     },
      { icon: SiKubernetes, name: 'Kubernetes' },
      { icon: SiRabbitmq,   name: 'RabbitMQ'   },
      { icon: SiGit,        name: 'Git'        },
    ],
  },
  {
    label: 'Cloud',
    skills: [
      { icon: TbBrandAws,    name: 'AWS'          },
      { icon: TbBrandAzure,  name: 'Azure'        },
      { icon: SiFirebase,    name: 'Firebase'     },
      { icon: SiVercel,      name: 'Vercel'       },
      { icon: SiGooglecloud, name: 'Google Cloud' },
    ],
  },
]
