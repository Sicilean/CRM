import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles'
import { ArchetypeRadarPDF, PersonalityBarsPDF, ToneSpectrumPDF } from './visualizations'

interface BrandIdentityProps {
  strategy: any
}

export const BrandIdentity: React.FC<BrandIdentityProps> = ({ strategy }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. Brand Identity & Archetype</Text>
      
      {/* Archetype Analysis con visualizzazione */}
      {strategy.archetype_scores && (
        <ArchetypeRadarPDF scores={strategy.archetype_scores} />
      )}
      
      {/* Archetype primario e secondario */}
      {(strategy.archetype_primary || strategy.archetype_secondary) && (
        <View style={styles.highlight}>
          <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Archetype Selection</Text>
          
          {strategy.archetype_primary && (
            <View style={styles.subsection}>
              <Text style={[styles.label, { fontSize: 10, color: '#007bff' }]}>Archetype Primario</Text>
              <Text style={[styles.value, { fontSize: 9 }]}>{strategy.archetype_primary}</Text>
            </View>
          )}
          
          {strategy.archetype_secondary && (
            <View style={styles.subsection}>
              <Text style={[styles.label, { fontSize: 10, color: '#6B7280' }]}>Archetype Secondario</Text>
              <Text style={[styles.value, { fontSize: 9 }]}>{strategy.archetype_secondary}</Text>
            </View>
          )}
          
          {strategy.archetype_mix_percentage && (
            <View style={styles.subsection}>
              <Text style={[styles.label, { fontSize: 10 }]}>Mix Percentage</Text>
              <Text style={[styles.value, { fontSize: 9 }]}>{strategy.archetype_mix_percentage}%</Text>
            </View>
          )}
        </View>
      )}
      
      {/* Personality Profile con visualizzazione */}
      {strategy.personality_sincerity !== null && (
        <PersonalityBarsPDF 
          axes={{
            sincerity: strategy.personality_sincerity,
            excitement: strategy.personality_excitement,
            competence: strategy.personality_competence,
            sophistication: strategy.personality_sophistication,
            ruggedness: strategy.personality_ruggedness
          }}
          adjectives={strategy.personality_adjectives}
        />
      )}
      
      {/* Tone of Voice con visualizzazione */}
      {strategy.tone_formal_informal !== null && (
        <ToneSpectrumPDF 
          tone={{
            formal_informal: strategy.tone_formal_informal,
            serious_playful: strategy.tone_serious_playful,
            respectful_irreverent: strategy.tone_respectful_irreverent,
            enthusiastic_matter_of_fact: strategy.tone_enthusiastic_matter_of_fact
          }}
          characteristics={strategy.tone_characteristics}
        />
      )}
      
      {/* Dettagli aggiuntivi del tone */}
      {(strategy.pronoun_usage || strategy.sentence_length || strategy.emoji_usage !== undefined) && (
        <View style={styles.highlight}>
          <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Tone Guidelines</Text>
          
          {strategy.pronoun_usage && (
            <View style={styles.subsection}>
              <Text style={[styles.label, { fontSize: 9 }]}>Pronome da Usare</Text>
              <Text style={[styles.value, { fontSize: 8 }]}>{strategy.pronoun_usage}</Text>
            </View>
          )}
          
          {strategy.sentence_length && (
            <View style={styles.subsection}>
              <Text style={[styles.label, { fontSize: 9 }]}>Lunghezza Frasi</Text>
              <Text style={[styles.value, { fontSize: 8 }]}>{strategy.sentence_length}</Text>
            </View>
          )}
          
          {strategy.emoji_usage !== undefined && (
            <View style={styles.subsection}>
              <Text style={[styles.label, { fontSize: 9 }]}>Uso Emoji</Text>
              <Text style={[styles.value, { fontSize: 8 }]}>
                {strategy.emoji_usage ? 'Sì' : 'No'}
              </Text>
            </View>
          )}
          
          {strategy.grammar_notes && (
            <View style={styles.subsection}>
              <Text style={[styles.label, { fontSize: 9 }]}>Note Grammaticali</Text>
              <Text style={[styles.value, { fontSize: 8 }]}>{strategy.grammar_notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}