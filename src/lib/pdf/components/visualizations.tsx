import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { styles } from '../styles'

interface ArchetypeScores {
  innocent: number
  explorer: number
  sage: number
  hero: number
  outlaw: number
  magician: number
  regular: number
  lover: number
  jester: number
  caregiver: number
  creator: number
  ruler: number
}

interface PersonalityAxes {
  sincerity: number
  excitement: number
  competence: number
  sophistication: number
  ruggedness: number
}

interface ToneAxes {
  formal_informal: number
  serious_playful: number
  respectful_irreverent: number
  enthusiastic_matter_of_fact: number
}

// Componente per visualizzazione Archetype Radar (semplificata per PDF)
export const ArchetypeRadarPDF: React.FC<{ scores: ArchetypeScores }> = ({ scores }) => {
  const ARCHETYPES = [
    { key: 'innocent', label: 'Innocente', color: '#5EEAD4' },
    { key: 'explorer', label: 'Esploratore', color: '#10B981' },
    { key: 'sage', label: 'Saggio', color: '#3B82F6' },
    { key: 'hero', label: 'Eroe', color: '#EF4444' },
    { key: 'outlaw', label: 'Ribelle', color: '#8B5CF6' },
    { key: 'magician', label: 'Mago', color: '#F59E0B' },
    { key: 'regular', label: 'Uomo Comune', color: '#6B7280' },
    { key: 'lover', label: 'Amante', color: '#EC4899' },
    { key: 'jester', label: 'Giullare', color: '#F97316' },
    { key: 'caregiver', label: 'Angelo Custode', color: '#84CC16' },
    { key: 'creator', label: 'Creatore', color: '#8B5CF6' },
    { key: 'ruler', label: 'Sovrano', color: '#1F2937' }
  ]

  // Trova i top 3 archetipi
  const topArchetypes = ARCHETYPES
    .map(arch => ({ ...arch, score: scores[arch.key as keyof ArchetypeScores] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <View style={[styles.highlight, { padding: 15, marginVertical: 10 }]}>
      <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Archetype Analysis</Text>
      
      {/* Top 3 Archetypes con barre di progresso */}
      {topArchetypes.map((arch, index) => (
        <View key={arch.key} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
            <Text style={[styles.label, { color: arch.color, fontSize: 10 }]}>
              {index + 1}. {arch.label}
            </Text>
            <Text style={[styles.value, { fontSize: 9 }]}>{arch.score}/100</Text>
          </View>
          
          {/* Barra di progresso semplificata */}
          <View style={{
            height: 6,
            backgroundColor: '#E5E7EB',
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${arch.score}%`,
              backgroundColor: arch.color,
              borderRadius: 3
            }} />
          </View>
        </View>
      ))}
    </View>
  )
}

// Componente per Personality Bars (semplificata per PDF)
export const PersonalityBarsPDF: React.FC<{ axes: PersonalityAxes, adjectives?: string[] }> = ({ axes, adjectives = [] }) => {
  const PERSONALITY_CONFIG = {
    sincerity: { label: 'Sincerità', color: '#F472B6', desc: 'Onestà, autenticità, calore' },
    excitement: { label: 'Eccitazione', color: '#F59E0B', desc: 'Energia, innovazione, audacia' },
    competence: { label: 'Competenza', color: '#3B82F6', desc: 'Affidabilità, intelligenza, successo' },
    sophistication: { label: 'Sofisticatezza', color: '#8B5CF6', desc: 'Eleganza, raffinatezza, classe' },
    ruggedness: { label: 'Robustezza', color: '#10B981', desc: 'Forza, resistenza, tenacia' }
  }

  return (
    <View style={[styles.highlight, { padding: 15, marginVertical: 10 }]}>
      <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Personality Profile</Text>
      
      {Object.entries(axes).map(([key, value]) => {
        const config = PERSONALITY_CONFIG[key as keyof PersonalityAxes]
        return (
          <View key={key} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={[styles.label, { color: config.color, fontSize: 10 }]}>
                {config.label}
              </Text>
              <Text style={[styles.value, { fontSize: 9 }]}>{value}/10</Text>
            </View>
            
            {/* Barra di progresso */}
            <View style={{
              height: 6,
              backgroundColor: '#E5E7EB',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <View style={{
                height: '100%',
                width: `${(value / 10) * 100}%`,
                backgroundColor: config.color,
                borderRadius: 3
              }} />
            </View>
            
            <Text style={[styles.value, { fontSize: 8, color: '#6B7280', marginTop: 2 }]}>
              {config.desc}
            </Text>
          </View>
        )
      })}
      
      {adjectives.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={[styles.label, { fontSize: 9, marginBottom: 5 }]}>Aggettivi Chiave</Text>
          <Text style={[styles.value, { fontSize: 8 }]}>
            {adjectives.join(' • ')}
          </Text>
        </View>
      )}
    </View>
  )
}

// Componente per Tone Spectrum (semplificata per PDF)
export const ToneSpectrumPDF: React.FC<{ tone: ToneAxes, characteristics?: string[] }> = ({ tone, characteristics = [] }) => {
  const TONE_CONFIG = {
    formal_informal: { 
      label: 'Formale vs Informale', 
      left: 'Formale', 
      right: 'Informale',
      color: '#3B82F6'
    },
    serious_playful: { 
      label: 'Serio vs Giocoso', 
      left: 'Serio', 
      right: 'Giocoso',
      color: '#F59E0B'
    },
    respectful_irreverent: { 
      label: 'Rispettoso vs Irriverente', 
      left: 'Rispettoso', 
      right: 'Irriverente',
      color: '#EF4444'
    },
    enthusiastic_matter_of_fact: { 
      label: 'Entusiasta vs Matter-of-fact', 
      left: 'Entusiasta', 
      right: 'Matter-of-fact',
      color: '#10B981'
    }
  }

  return (
    <View style={[styles.highlight, { padding: 15, marginVertical: 10 }]}>
      <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Tone of Voice Spectrum</Text>
      
      {Object.entries(tone).map(([key, value]) => {
        const config = TONE_CONFIG[key as keyof ToneAxes]
        const percentage = (value / 10) * 100
        
        return (
          <View key={key} style={{ marginBottom: 12 }}>
            <Text style={[styles.label, { fontSize: 9, marginBottom: 5 }]}>
              {config.label}
            </Text>
            
            {/* Spettro con indicatore */}
            <View style={{
              height: 8,
              backgroundColor: '#E5E7EB',
              borderRadius: 4,
              position: 'relative',
              marginBottom: 3
            }}>
              <View style={{
                position: 'absolute',
                left: `${percentage}%`,
                top: -2,
                width: 12,
                height: 12,
                backgroundColor: config.color,
                borderRadius: 6,
                border: '2px solid white',
                transform: 'translateX(-50%)'
              }} />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.value, { fontSize: 7, color: '#6B7280' }]}>
                {config.left}
              </Text>
              <Text style={[styles.value, { fontSize: 7, color: '#6B7280' }]}>
                {config.right}
              </Text>
            </View>
          </View>
        )
      })}
      
      {characteristics.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={[styles.label, { fontSize: 9, marginBottom: 5 }]}>Caratteristiche Tone</Text>
          <Text style={[styles.value, { fontSize: 8 }]}>
            {characteristics.join(' • ')}
          </Text>
        </View>
      )}
    </View>
  )
}

// Componente per Competitor Matrix (semplificata per PDF)
export const CompetitorMatrixPDF: React.FC<{ competitors: any[] }> = ({ competitors }) => {
  if (!competitors || competitors.length === 0) {
    return (
      <View style={[styles.highlight, { padding: 15, marginVertical: 10 }]}>
        <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Competitor Analysis</Text>
        <Text style={styles.emptyValue}>Nessun competitor analizzato</Text>
      </View>
    )
  }

  return (
    <View style={[styles.highlight, { padding: 15, marginVertical: 10 }]}>
      <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Competitor Analysis</Text>
      
      {competitors.map((competitor, index) => (
        <View key={index} style={{ 
          marginBottom: 12, 
          padding: 8, 
          backgroundColor: '#F9FAFB',
          borderRadius: 4,
          border: '1px solid #E5E7EB'
        }}>
          <Text style={[styles.label, { fontSize: 10, marginBottom: 5 }]}>
            {competitor.persona_giuridica?.ragione_sociale || `Competitor ${index + 1}`}
          </Text>
          
          {competitor.persona_giuridica?.sito_web && (
            <Text style={[styles.value, { fontSize: 8, color: '#3B82F6', marginBottom: 3 }]}>
              🌐 {competitor.persona_giuridica.sito_web}
            </Text>
          )}
          
          {competitor.positioning_x !== null && competitor.positioning_y !== null && (
            <Text style={[styles.value, { fontSize: 8, marginBottom: 3 }]}>
              📍 Posizionamento: X={competitor.positioning_x}, Y={competitor.positioning_y}
            </Text>
          )}
          
          {competitor.strengths && (
            <Text style={[styles.value, { fontSize: 8, marginBottom: 2 }]}>
              ✅ <Text style={[styles.label, { fontSize: 8 }]}>Punti di forza: </Text>
              {competitor.strengths}
            </Text>
          )}
          
          {competitor.weaknesses && (
            <Text style={[styles.value, { fontSize: 8, marginBottom: 2 }]}>
              ❌ <Text style={[styles.label, { fontSize: 8 }]}>Punti deboli: </Text>
              {competitor.weaknesses}
            </Text>
          )}
          
          {competitor.visual_style_tags && competitor.visual_style_tags.length > 0 && (
            <Text style={[styles.value, { fontSize: 8, marginBottom: 2 }]}>
              🎨 <Text style={[styles.label, { fontSize: 8 }]}>Stile: </Text>
              {competitor.visual_style_tags.join(', ')}
            </Text>
          )}
        </View>
      ))}
    </View>
  )
}


