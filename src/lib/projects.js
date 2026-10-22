// Unified project access — local first, cloud optional.
//
// The editor never requires an account. Every project is stored in the
// browser (localStorage) so the app works instantly, offline, with no
// server. When a user signs in, the same projects are mirrored to Supabase
// so they follow them across devices. The local id stays stable and is used
// in the URL; the cloud row is matched through the `local_id` column.

import { supabase } from './supabase'
import {
  listLocalProjects,
  getLocalProject,
  createLocalProject,
  saveLocalProject,
  deleteLocalProject,
  isLocalId,
  LOCAL_ID_PREFIX,
} from './localStore'

export { isLocalId, LOCAL_ID_PREFIX }

export async function getSession() {
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session ?? null
  } catch {
    return null
  }
}

export async function currentUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function isSignedIn() {
  return !!(await currentUser())
}

function cloudRowToProject(row) {
  return {
    id: row.id,
    name: row.name,
    document: row.document,
    status: row.status,
    slug: row.slug,
    owner_id: row.owner_id,
    source: 'cloud',
    local_id: row.local_id || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/**
 * All projects visible to the current user: local ones always, cloud ones
 * when signed in. A cloud row that mirrors a local project is merged into
 * the local entry rather than listed twice.
 */
export async function listProjects() {
  const local = listLocalProjects()
  const user = await currentUser()
  if (!user) return local

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error || !data) return local

    const cloud = data.map(cloudRowToProject)
    const localIds = new Set(local.map((p) => p.id))
    const merged = [...local]

    for (const row of cloud) {
      const mirrored = row.local_id && localIds.has(row.local_id)
      if (mirrored) {
        // Same project in two places — keep the newer copy.
        const index = merged.findIndex((p) => p.id === row.local_id)
        if (index !== -1) {
          const localRow = merged[index]
          const cloudNewer = String(row.updated_at) > String(localRow.updated_at)
          merged[index] = cloudNewer
            ? { ...localRow, document: row.document, name: row.name, updated_at: row.updated_at, status: row.status, slug: row.slug, source: 'cloud' }
            : { ...localRow, status: row.status, slug: row.slug, cloudId: row.id }
        }
        continue
      }
      merged.push(row)
    }

    return merged.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
  } catch (error) {
    console.error('Could not load cloud projects:', error)
    return local
  }
}

export async function getProject(id) {
  if (isLocalId(id)) {
    const local = getLocalProject(id)
    if (!local) return null
    return local
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return cloudRowToProject(data)
}

export async function createProject(name, document) {
  const local = createLocalProject(name, document)
  const user = await currentUser()
  if (!user) return local

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        name,
        document,
        status: 'draft',
        local_id: local.id,
      })
      .select()
      .single()
    if (error) throw error
    return { ...local, cloudId: data.id, source: 'cloud' }
  } catch (error) {
    console.error('Could not mirror project to the cloud:', error)
    return local
  }
}

export async function saveProject(id, document, name) {
  const saved = saveLocalProject(id, document, name)
  const user = await currentUser()
  if (!user) return saved

  try {
    if (isLocalId(id)) {
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('local_id', id)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('projects')
          .update({ name: name || document.name, document, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase.from('projects').insert({
          owner_id: user.id,
          name: name || document.name,
          document,
          status: 'draft',
          local_id: id,
        })
      }
    } else {
      await supabase
        .from('projects')
        .update({ name: name || document.name, document, updated_at: new Date().toISOString() })
        .eq('id', id)
    }
  } catch (error) {
    console.error('Could not sync project to the cloud:', error)
  }

  return saved
}

export async function deleteProject(id) {
  if (isLocalId(id)) deleteLocalProject(id)
  const user = await currentUser()
  if (!user) return
  try {
    if (isLocalId(id)) {
      await supabase.from('projects').delete().eq('local_id', id)
    } else {
      await supabase.from('projects').delete().eq('id', id)
    }
  } catch (error) {
    console.error('Could not delete the cloud project:', error)
  }
}

export async function duplicateProject(project) {
  const document = structuredClone(project.document)
  document.name = `${project.name} (Copy)`
  return createProject(document.name, document)
}
