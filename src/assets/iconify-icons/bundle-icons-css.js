/**
 * This is an advanced example for creating icon bundles for Iconify SVG Framework.
 * Adapted for ES modules
 */

import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import Iconify tools
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'

// Get directory name for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url))

// Helper function to resolve JSON files from @iconify/json
async function resolveIconifyJSON(path) {
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  return require.resolve(path)
}

const sources = {
  json: [
    // Iconify JSON file
    await resolveIconifyJSON('@iconify/json/json/ri.json'),

    // Custom file with only few icons
    {
      filename: await resolveIconifyJSON('@iconify/json/json/line-md.json'),
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
      dir: join(__dirname, 'src/assets/iconify-icons/svg'),
      monotone: false,
      prefix: 'custom'
    }
  ]
}

// File to save bundle to
const target = join(__dirname, 'src/assets/iconify-icons/icons.css')

// Main function
async function generateIconBundle() {
  try {
    // Create directory for output if missing
    await fs.mkdir(dirname(target), { recursive: true })

    const allIcons = []

    /**
     * Convert sources.icons to sources.json
     */
    if (sources.icons) {
      const sourcesJSON = sources.json || (sources.json = [])
      const organizedList = organizeIconsList(sources.icons)

      for (const prefix in organizedList) {
        const filename = await resolveIconifyJSON(`@iconify/json/json/${prefix}.json`)
        sourcesJSON.push({
          filename,
          icons: organizedList[prefix]
        })
      }
    }

    /**
     * Bundle JSON files
     */
    if (sources.json) {
      for (const item of sources.json) {
        const filename = typeof item === 'string' ? item : item.filename
        const content = JSON.parse(await fs.readFile(filename, 'utf8'))

        if (typeof item !== 'string' && item.icons?.length) {
          const filteredContent = getIcons(content, item.icons)
          if (!filteredContent) throw new Error(`Cannot find required icons in ${filename}`)
          allIcons.push(filteredContent)
        } else {
          allIcons.push(content)
        }
      }
    }

    /**
     * Bundle custom SVG icons
     */
    if (sources.svg) {
      for (const source of sources.svg) {
        const iconSet = await importDirectory(source.dir, {
          prefix: source.prefix
        })

        await iconSet.forEach(async (name, type) => {
          if (type !== 'icon') return

          const svg = iconSet.toSVG(name)
          if (!svg) {
            iconSet.remove(name)
            return
          }

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
            iconSet.fromSVG(name, svg)
          } catch (err) {
            console.error(`Error parsing ${name} from ${source.dir}:`, err)
            iconSet.remove(name)
          }
        })

        allIcons.push(iconSet.export())
      }
    }

    // Generate and save CSS
    const cssContent = allIcons
      .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
      .join('\n')

    await fs.writeFile(target, cssContent, 'utf8')
    console.log(`Saved CSS to ${target}!`)
  } catch (err) {
    console.error('Error generating icon bundle:', err)
    process.exit(1)
  }
}

/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons) {
  return icons.reduce((sorted, icon) => {
    const item = stringToIcon(icon)
    if (item) {
      const { prefix, name } = item
      sorted[prefix] = sorted[prefix] || []
      if (!sorted[prefix].includes(name)) sorted[prefix].push(name)
    }
    return sorted
  }, {})
}

// Execute
generateIconBundle()