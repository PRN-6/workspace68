import JSZip from 'jszip'
import { generateProjectFiles, downloadBlob } from './generateProject'

export async function exportProjectZip(project) {
  const files = generateProjectFiles(project)
  const zip = new JSZip()
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}

export async function downloadProject(project) {
  const name = (project.name || 'project').replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').toLowerCase() || 'website'
  const blob = await exportProjectZip(project)
  downloadBlob(blob, `${name}-source.zip`)
}

export { generateProjectFiles }