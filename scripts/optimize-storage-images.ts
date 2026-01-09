/**
 * Script per identificare e aiutare a ottimizzare le immagini troppo grandi
 * 
 * Questo script:
 * 1. Identifica le immagini > 1 MB nel bucket
 * 2. Mostra quali dovrebbero essere compresse
 * 3. Fornisce istruzioni per la compressione manuale
 * 
 * Per immagini da comprimere, usa: https://squoosh.app (gratuito, client-side)
 * 
 * Esecuzione: npx tsx scripts/optimize-storage-images.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const BUCKET_NAME = 'article-media'
const MAX_RECOMMENDED_SIZE_MB = 1 // Immagini oltre questa soglia dovrebbero essere ottimizzate

interface ImageToOptimize {
  path: string
  sizeMB: number
  mimetype: string
  publicUrl: string
  usedIn?: string[]
}

async function getUsedImages(): Promise<Map<string, string[]>> {
  console.log('📋 Recupero riferimenti immagini negli articoli...')
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('title, slug, cover, content')
  
  if (error) {
    console.error('❌ Errore:', error)
    return new Map()
  }

  const imageUsage = new Map<string, string[]>()
  
  for (const article of articles || []) {
    const addUsage = (url: string | undefined) => {
      if (!url || !url.includes(BUCKET_NAME)) return
      const path = url.split(`${BUCKET_NAME}/`)[1]
      if (path) {
        const existing = imageUsage.get(path) || []
        existing.push(article.title || article.slug)
        imageUsage.set(path, existing)
      }
    }

    // Cover
    if (article.cover) {
      const covers = Array.isArray(article.cover) ? article.cover : [article.cover]
      covers.forEach((c: any) => addUsage(c?.content?.url))
    }
    
    // Content
    if (article.content) {
      const contents = Array.isArray(article.content) ? article.content : [article.content]
      contents.forEach((c: any) => addUsage(c?.content?.url))
    }
  }
  
  return imageUsage
}

async function getLargeImages(): Promise<ImageToOptimize[]> {
  console.log('📦 Scansione immagini nel bucket...')
  
  const largeImages: ImageToOptimize[] = []
  
  // Lista cartelle principali
  const { data: folders } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 1000 })
  
  for (const folder of folders || []) {
    if (folder.id === null) {
      // È una cartella
      const { data: files } = await supabase.storage.from(BUCKET_NAME).list(folder.name, { limit: 1000 })
      
      for (const file of files || []) {
        if (file.metadata?.mimetype?.startsWith('image/')) {
          const sizeMB = (file.metadata.size || 0) / 1024 / 1024
          if (sizeMB > MAX_RECOMMENDED_SIZE_MB) {
            const path = `${folder.name}/${file.name}`
            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
            
            largeImages.push({
              path,
              sizeMB,
              mimetype: file.metadata.mimetype,
              publicUrl: urlData.publicUrl
            })
          }
        }
      }
    } else if (folder.metadata?.mimetype?.startsWith('image/')) {
      const sizeMB = (folder.metadata.size || 0) / 1024 / 1024
      if (sizeMB > MAX_RECOMMENDED_SIZE_MB) {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(folder.name)
        
        largeImages.push({
          path: folder.name,
          sizeMB,
          mimetype: folder.metadata.mimetype,
          publicUrl: urlData.publicUrl
        })
      }
    }
  }
  
  return largeImages.sort((a, b) => b.sizeMB - a.sizeMB)
}

async function main() {
  console.log('🔍 ANALISI IMMAGINI DA OTTIMIZZARE')
  console.log('===================================\n')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Mancano le variabili d\'ambiente')
    process.exit(1)
  }

  const imageUsage = await getUsedImages()
  const largeImages = await getLargeImages()
  
  // Aggiunge info su dove sono usate
  for (const img of largeImages) {
    img.usedIn = imageUsage.get(img.path) || []
  }
  
  // Separa in IN USO e ORFANE
  const usedImages = largeImages.filter(img => img.usedIn!.length > 0)
  const orphanImages = largeImages.filter(img => img.usedIn!.length === 0)

  console.log('\n' + '='.repeat(60))
  console.log('🚨 IMMAGINI IN USO DA OTTIMIZZARE (PRIORITÀ ALTA)')
  console.log('='.repeat(60))
  
  if (usedImages.length === 0) {
    console.log('✅ Nessuna immagine grande in uso!')
  } else {
    let totalUsed = 0
    for (const img of usedImages) {
      console.log(`\n📄 ${img.path}`)
      console.log(`   Dimensione: ${img.sizeMB.toFixed(2)} MB`)
      console.log(`   Formato: ${img.mimetype}`)
      console.log(`   Usata in: ${img.usedIn!.join(', ')}`)
      console.log(`   URL: ${img.publicUrl}`)
      totalUsed += img.sizeMB
    }
    console.log(`\n📊 Totale immagini in uso da ottimizzare: ${usedImages.length} (${totalUsed.toFixed(2)} MB)`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('⚠️  IMMAGINI ORFANE (POSSONO ESSERE ELIMINATE)')
  console.log('='.repeat(60))
  
  if (orphanImages.length === 0) {
    console.log('✅ Nessuna immagine orfana!')
  } else {
    let totalOrphan = 0
    for (const img of orphanImages) {
      console.log(`   ${img.path} (${img.sizeMB.toFixed(2)} MB)`)
      totalOrphan += img.sizeMB
    }
    console.log(`\n📊 Totale immagini orfane: ${orphanImages.length} (${totalOrphan.toFixed(2)} MB)`)
    console.log('   → Esegui cleanup-orphan-storage.ts per eliminarle')
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 ISTRUZIONI PER OTTIMIZZARE LE IMMAGINI IN USO')
  console.log('='.repeat(60))
  console.log(`
1. Vai su https://squoosh.app (gratuito, funziona nel browser)

2. Per ogni immagine grande IN USO:
   a. Scarica l'immagine originale (click sul link sopra)
   b. Caricala su Squoosh
   c. Converti in WebP con qualità 80-85%
   d. Ridimensiona se > 2000px di larghezza
   e. Scarica la versione ottimizzata

3. Carica le nuove immagini su Supabase:
   - Dashboard → Storage → article-media
   - Carica nella stessa cartella con NUOVO NOME
   - Aggiorna i riferimenti nel database (articoli)

4. Una volta aggiornati i riferimenti, elimina le vecchie immagini

💡 SUGGERIMENTI:
   - PNG 34 MB → WebP ~500 KB (riduzione 98%!)
   - Qualità 80% è indistinguibile per il web
   - Larghezza max consigliata: 1920px
`)

  // Stima risparmio potenziale
  const potentialSavings = usedImages.reduce((acc, img) => {
    // Stima: PNG → WebP = 95% riduzione, altri = 70% riduzione
    const reduction = img.mimetype.includes('png') ? 0.95 : 0.70
    return acc + (img.sizeMB * reduction)
  }, 0)

  console.log('📊 STIMA RISPARMIO POTENZIALE:')
  console.log(`   Se ottimizzi le immagini in uso: ~${potentialSavings.toFixed(0)} MB risparmiati`)
  console.log(`   Riduzione egress mensile stimata: ~70-90%`)
}

main().catch(console.error)
