import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles'

interface CommunicationProps {
  strategy: any
}

export const Communication: React.FC<CommunicationProps> = ({ strategy }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>5. Communication Guidelines</Text>
      
      {/* Content Pillars */}
      {strategy.content_pillars && strategy.content_pillars.length > 0 && (
        <View style={styles.highlight}>
          <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Content Pillars</Text>
          <View style={styles.grid}>
            {strategy.content_pillars.map((pillar: any, index: number) => (
              <View key={index} style={styles.gridItem}>
                <View style={styles.card}>
                  <Text style={[styles.label, { fontSize: 10, color: '#007bff', marginBottom: 5 }]}>
                    {pillar.pillar_name}
                  </Text>
                  <Text style={[styles.value, { fontSize: 8, marginBottom: 3 }]}>
                    {pillar.theme}
                  </Text>
                  {pillar.key_messages && (
                    <Text style={[styles.value, { fontSize: 7, color: '#6B7280' }]}>
                      {pillar.key_messages}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Content Pillars - Dettagli */}
      {strategy.content_pillars && strategy.content_pillars.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Content Pillars - Dettagli</Text>
          {strategy.content_pillars.map((pillar: any, index: number) => (
            <View key={index} style={[styles.subsection, styles.highlight]}>
              <Text style={styles.label}>{pillar.pillar_name}</Text>
              {pillar.theme && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Tema: </Text>
                  {pillar.theme}
                </Text>
              )}
              {pillar.key_messages && pillar.key_messages.length > 0 && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Messaggi chiave: </Text>
                  {pillar.key_messages.join(', ')}
                </Text>
              )}
              {pillar.objectives && pillar.objectives.length > 0 && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Obiettivi: </Text>
                  {pillar.objectives.join(', ')}
                </Text>
              )}
              {pillar.content_types && pillar.content_types.length > 0 && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Tipi di contenuto: </Text>
                  {pillar.content_types.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
      
      {/* Communication Principles */}
      {strategy.communication_principles && strategy.communication_principles.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Principi di Comunicazione</Text>
          <View style={styles.list}>
            {strategy.communication_principles.map((principle: string, index: number) => (
              <Text key={index} style={styles.listItem}>
                • {principle}
              </Text>
            ))}
          </View>
        </View>
      )}
      
      {/* Communication Examples */}
      {strategy.communication_examples && strategy.communication_examples.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Esempi di Comunicazione</Text>
          {strategy.communication_examples.map((example: any, index: number) => (
            <View key={index} style={[styles.subsection, styles.highlight]}>
              <Text style={styles.label}>
                {example.example_title || `${example.touchpoint_type} - Esempio ${index + 1}`}
              </Text>
              <Text style={styles.value}>{example.example_content}</Text>
              {example.notes && (
                <Text style={[styles.value, { fontStyle: 'italic', marginTop: 5 }]}>
                  Note: {example.notes}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
      
      {/* Tone Guidelines */}
      {strategy.tone_guidelines && strategy.tone_guidelines.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Linee Guida Tone of Voice</Text>
          {strategy.tone_guidelines.map((guideline: any, index: number) => (
            <View key={index} style={styles.subsection}>
              <Text style={styles.label}>
                {guideline.guideline_type === 'do' ? '✅ DO' : '❌ DON\'T'}
              </Text>
              <Text style={styles.value}>{guideline.guideline_text}</Text>
              {guideline.example && (
                <Text style={[styles.value, { fontStyle: 'italic', marginTop: 3 }]}>
                  Esempio: {guideline.example}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
      
      {/* Glossary */}
      {strategy.glossary && strategy.glossary.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Glossario Terminologico</Text>
          {strategy.glossary.map((term: any, index: number) => (
            <View key={index} style={styles.subsection}>
              <Text style={styles.label}>
                {term.term_type === 'to_use' ? '✅ DA USARE' : 
                 term.term_type === 'to_avoid' ? '❌ DA EVITARE' : 
                 '🔄 TRADUZIONE'} - {term.term}
              </Text>
              {term.context && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Contesto: </Text>
                  {term.context}
                </Text>
              )}
              {term.example && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Esempio: </Text>
                  {term.example}
                </Text>
              )}
              {term.why_avoid && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Perché evitare: </Text>
                  {term.why_avoid}
                </Text>
              )}
              {term.alternative && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Alternativa: </Text>
                  {term.alternative}
                </Text>
              )}
              {term.term_en && term.term_it && (
                <Text style={styles.value}>
                  <Text style={styles.label}>Traduzione: </Text>
                  {term.term_en} → {term.term_it}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

