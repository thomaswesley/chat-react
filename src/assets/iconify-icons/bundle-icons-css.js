import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Corrigindo __filename e __dirname no contexto ESM:
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Importações da Iconify
import {
  cleanupSVG,
  importDirectory,
  isEmptyColor,
  parseColors,
  runSVGO
} from '@iconify/tools'
import {
  getIcons,
  getIconsCSS,
  stringToIcon
} from '@iconify/utils'

// Fontes de ícones
const sources = {
  json: [
    // Arquivo JSON completo
    (await import('@iconify/json/json/ri.json')).default,

    // Ícones específicos
    {
      filename: (await import('@iconify/json/json/line-md.json')).default,
      icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
    }
  ],
  icons: [
    'bx-basket',
    'bi-airplane-engines',
    'tabler-anchor',
    'uit-adobe-alt',
    'twemoji-auto-rickshaw'
  ],
  svg: [
    {
      dir: join(__dirname, 'svg'),
      monotone: false,
      prefix: 'custom'
    }
  ]
}

// Caminho do arquivo final CSS
const target = join(__dirname, 'generated-icons.css')

;(async function () {
  const dir = dirname(target)
  await fs.mkdir(dir, { recursive: true }).catch(() => {})

  const allIcons = []

  // Ícones individuais convertidos em JSON
  if (sources.icons) {
    const sourcesJSON = sources.json ?? (sources.json = [])
    const organizedList = organizeIconsList(sources.icons)

    for (const prefix in organizedList) {
      const mod = await import(`@iconify/json/json/${prefix}.json`, {
        assert: { type: 'json' }
      })

      sourcesJSON.push({
        filename: mod.default,
        icons: organizedList[prefix]
      })
    }
  }

  // Agrupar JSONs
  if (sources.json) {
    for (let i = 0; i < sources.json.length; i++) {
      const item = sources.json[i]

      let content
      if (typeof item === 'string') {
        content = item
      } else if (item.filename?.icons) {
        content = item.filename
      } else {
        content = JSON.parse(await fs.readFile(item.filename, 'utf8'))
      }

      if (typeof item !== 'string' && item.icons?.length) {
        const filtered = getIcons(content, item.icons)
        if (!filtered) throw new Error(`Ícones não encontrados em ${item.filename}`)
        allIcons.push(filtered)
      } else {
        allIcons.push(content)
      }
    }
  }

  // SVGs personalizados
  if (sources.svg) {
    for (const source of sources.svg) {
      const iconSet = await importDirectory(source.dir, {
        prefix: source.prefix
      })

      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') return
        const svg = iconSet.toSVG(name)
        if (!svg) return iconSet.remove(name)

        try {
          await cleanupSVG(svg)
          if (source.monotone) {
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => {
                return !color || isEmptyColor(color) ? colorStr : 'currentColor'
              }
            })
          }
          await runSVGO(svg)
        } catch (err) {
          console.error(`Erro no ícone ${name} de ${source.dir}:`, err)
          iconSet.remove(name)
        }

        iconSet.fromSVG(name, svg)
      })

      allIcons.push(iconSet.export())
    }
  }

  // Gerar e salvar CSS
  const cssContent = allIcons
    .map(iconSet =>
      getIconsCSS(iconSet, Object.keys(iconSet.icons), {
        iconSelector: '.{prefix}-{name}'
      })
    )
    .join('\n')

  await fs.writeFile(target, cssContent, 'utf8')
  console.log(`✅ CSS salvo em: ${target}`)
})().catch(err => {
  console.error('❌ Erro:', err)
})

// Utilitário: agrupar ícones por prefixo
function organizeIconsList(icons) {
  const sorted = Object.create(null)
  icons.forEach(icon => {
    const item = stringToIcon(icon)
    if (!item) return
    const prefix = item.prefix
    const prefixList = sorted[prefix] ?? (sorted[prefix] = [])
    const name = item.name
    if (!prefixList.includes(name)) prefixList.push(name)
  })
  return sorted
}
