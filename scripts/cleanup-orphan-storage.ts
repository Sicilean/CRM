/**
 * Script per eliminare i file orfani dal bucket article-media di Supabase
 * 
 * IMPORTANTE: Prima di eseguire, verifica che i file siano effettivamente orfani!
 * 
 * Esecuzione:
 * 1. npx tsx scripts/cleanup-orphan-storage.ts --dry-run   (per vedere cosa verrà eliminato)
 * 2. npx tsx scripts/cleanup-orphan-storage.ts             (per eliminare effettivamente)
 */

import { createClient } from '@supabase/supabase-js'

// Configurazione
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY! // Serve la service key per eliminare

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const BUCKET_NAME = 'article-media'
const DRY_RUN = process.argv.includes('--dry-run')

interface StorageFile {
  name: string
  size_mb: number
  mimetype: string
}

async function getUsedFilePaths(): Promise<Set<string>> {
  console.log('📋 Recupero file usati negli articoli...')
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('cover, content')
  
  if (error) {
    console.error('❌ Errore recupero articoli:', error)
    return new Set()
  }

  const usedPaths = new Set<string>()
  
  for (const article of articles || []) {
    // Estrai URL dalle cover
    if (article.cover) {
      const covers = Array.isArray(article.cover) ? article.cover : [article.cover]
      for (const cover of covers) {
        const url = cover?.content?.url
        if (url && url.includes(BUCKET_NAME)) {
          const path = url.split(`${BUCKET_NAME}/`)[1]
          if (path) usedPaths.add(path)
        }
      }
    }
    
    // Estrai URL dai content
    if (article.content) {
      const contents = Array.isArray(article.content) ? article.content : [article.content]
      for (const content of contents) {
        const url = content?.content?.url
        if (url && url.includes(BUCKET_NAME)) {
          const path = url.split(`${BUCKET_NAME}/`)[1]
          if (path) usedPaths.add(path)
        }
      }
    }
  }
  
  console.log(`✅ Trovati ${usedPaths.size} file in uso`)
  return usedPaths
}

async function getAllStorageFiles(): Promise<StorageFile[]> {
  console.log('📦 Recupero tutti i file dal bucket...')
  
  const { data: bucketData, error: bucketError } = await supabase
    .storage
    .from(BUCKET_NAME)
    .list('', { limit: 1000 })
  
  if (bucketError) {
    console.error('❌ Errore lista bucket:', bucketError)
    return []
  }

  const allFiles: StorageFile[] = []
  
  // Il bucket potrebbe avere sottocartelle (current-user, uuid, etc.)
  for (const item of bucketData || []) {
    if (item.id === null) {
      // È una cartella, lista il contenuto
      const { data: folderData } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list(item.name, { limit: 1000 })
      
      for (const file of folderData || []) {
        if (file.metadata) {
          allFiles.push({
            name: `${item.name}/${file.name}`,
            size_mb: (file.metadata.size || 0) / 1024 / 1024,
            mimetype: file.metadata.mimetype || 'unknown'
          })
        }
      }
    } else if (item.metadata) {
      allFiles.push({
        name: item.name,
        size_mb: (item.metadata.size || 0) / 1024 / 1024,
        mimetype: item.metadata.mimetype || 'unknown'
      })
    }
  }
  
  console.log(`✅ Trovati ${allFiles.length} file totali nel bucket`)
  return allFiles
}

async function deleteOrphanFiles(orphanFiles: StorageFile[]): Promise<void> {
  if (DRY_RUN) {
    console.log('\n🔍 MODALITÀ DRY-RUN - Nessun file verrà eliminato')
    console.log('File che verrebbero eliminati:\n')
    
    let totalSize = 0
    for (const file of orphanFiles) {
      console.log(`  📄 ${file.name} (${file.size_mb.toFixed(2)} MB)`)
      totalSize += file.size_mb
    }
    
    console.log(`\n📊 RIEPILOGO:`)
    console.log(`   File da eliminare: ${orphanFiles.length}`)
    console.log(`   Spazio da liberare: ${totalSize.toFixed(2)} MB`)
    console.log(`\n⚠️  Per eliminare effettivamente, esegui senza --dry-run`)
    return
  }

  console.log('\n🗑️  Eliminazione file orfani in corso...')
  
  let deleted = 0
  let failed = 0
  let freedSpace = 0

  for (const file of orphanFiles) {
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([file.name])
    
    if (error) {
      console.error(`  ❌ Errore eliminazione ${file.name}:`, error.message)
      failed++
    } else {
      console.log(`  ✅ Eliminato: ${file.name} (${file.size_mb.toFixed(2)} MB)`)
      deleted++
      freedSpace += file.size_mb
    }
  }

  console.log(`\n📊 RISULTATO:`)
  console.log(`   ✅ Eliminati: ${deleted} file`)
  console.log(`   ❌ Falliti: ${failed} file`)
  console.log(`   💾 Spazio liberato: ${freedSpace.toFixed(2)} MB`)
}

async function main() {
  console.log('🚀 CLEANUP FILE ORFANI - Supabase Storage')
  console.log('=========================================\n')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Mancano le variabili d\'ambiente:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  // 1. Recupera file usati
  const usedPaths = await getUsedFilePaths()
  
  // 2. Recupera tutti i file dal bucket
  const allFiles = await getAllStorageFiles()
  
  // 3. Identifica file orfani
  const orphanFiles = allFiles.filter(f => !usedPaths.has(f.name))
  
  console.log(`\n🔍 ANALISI:`)
  console.log(`   File totali: ${allFiles.length}`)
  console.log(`   File in uso: ${usedPaths.size}`)
  console.log(`   File orfani: ${orphanFiles.length}`)
  
  const orphanSize = orphanFiles.reduce((acc, f) => acc + f.size_mb, 0)
  console.log(`   Spazio orfano: ${orphanSize.toFixed(2)} MB`)

  if (orphanFiles.length === 0) {
    console.log('\n✅ Nessun file orfano trovato!')
    return
  }

  // 4. Elimina (o mostra in dry-run)
  await deleteOrphanFiles(orphanFiles)
}

main().catch(console.error)
