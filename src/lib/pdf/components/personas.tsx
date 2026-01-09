import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles'

interface PersonasProps {
  strategy: any
}

export const Personas: React.FC<PersonasProps> = ({ strategy }) => {
  if (!strategy.personas || strategy.personas.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Target & Personas</Text>
        <Text style={styles.emptyValue}>Nessuna persona definita</Text>
      </View>
    )
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>4. Target & Personas</Text>
      
      {/* Personas Grid */}
      <View style={styles.grid}>
        {strategy.personas && strategy.personas.map((persona: any, index: number) => (
          <View key={index} style={styles.gridItem}>
            <View style={styles.card}>
              <Text style={[styles.label, { fontSize: 11, color: '#007bff', marginBottom: 8 }]}>
                {persona.persona_name}
              </Text>
              
              {/* Demographics */}
              <View style={styles.subsection}>
                <Text style={[styles.label, { fontSize: 9, color: '#6B7280' }]}>Demographics</Text>
                <Text style={[styles.value, { fontSize: 8 }]}>
                  {persona.age_range && `Età: ${persona.age_range}`}
                  {persona.gender && ` • ${persona.gender}`}
                  {persona.location && ` • ${persona.location}`}
                </Text>
                {persona.occupation && (
                  <Text style={[styles.value, { fontSize: 8, marginTop: 2 }]}>
                    Professione: {persona.occupation}
                  </Text>
                )}
              </View>
              
              {/* Quote */}
              {persona.representative_quote && (
                <View style={styles.subsection}>
                  <Text style={[styles.label, { fontSize: 9, color: '#6B7280' }]}>Quote</Text>
                  <Text style={[styles.value, { fontSize: 8, fontStyle: 'italic' }]}>
                    &ldquo;{persona.representative_quote}&rdquo;
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
      
      {/* Dettagli completi delle personas */}
      {strategy.personas.map((persona: any, index: number) => (
        <View key={`detail-${index}`} style={[styles.subsection, styles.highlight]}>
          <Text style={styles.subsectionTitle}>{persona.persona_name}</Text>
          
          {/* Demographics */}
          <View style={styles.subsection}>
            <Text style={styles.label}>Demographics</Text>
            <Text style={styles.value}>
              {[
                persona.age_range && `Età: ${persona.age_range}`,
                persona.gender && `Genere: ${persona.gender}`,
                persona.location && `Località: ${persona.location}`,
                persona.occupation && `Occupazione: ${persona.occupation}`,
                persona.income_range && `Fascia reddito: ${persona.income_range}`,
                persona.education && `Istruzione: ${persona.education}`
              ].filter(Boolean).join(' • ')}
            </Text>
          </View>
          
          {/* Psychographics */}
          <View style={styles.subsection}>
            <Text style={styles.label}>Psychographics</Text>
            {persona.interests && persona.interests.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Interessi: </Text>
                {persona.interests.join(', ')}
              </Text>
            )}
            {persona.values && persona.values.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Valori: </Text>
                {persona.values.join(', ')}
              </Text>
            )}
            {persona.lifestyle && (
              <Text style={styles.value}>
                <Text style={styles.label}>Stile di vita: </Text>
                {persona.lifestyle}
              </Text>
            )}
            {persona.personality && (
              <Text style={styles.value}>
                <Text style={styles.label}>Personalità: </Text>
                {persona.personality}
              </Text>
            )}
          </View>
          
          {/* Needs & Pain Points */}
          <View style={styles.subsection}>
            <Text style={styles.label}>Bisogni e Pain Points</Text>
            {persona.needs && persona.needs.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Bisogni: </Text>
                {persona.needs.join(', ')}
              </Text>
            )}
            {persona.pain_points && persona.pain_points.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Pain Points: </Text>
                {persona.pain_points.join(', ')}
              </Text>
            )}
            {persona.aspirations && persona.aspirations.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Aspirazioni: </Text>
                {persona.aspirations.join(', ')}
              </Text>
            )}
          </View>
          
          {/* Goals */}
          <View style={styles.subsection}>
            <Text style={styles.label}>Obiettivi</Text>
            {persona.personal_goals && persona.personal_goals.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Obiettivi personali: </Text>
                {persona.personal_goals.join(', ')}
              </Text>
            )}
            {persona.professional_goals && persona.professional_goals.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Obiettivi professionali: </Text>
                {persona.professional_goals.join(', ')}
              </Text>
            )}
          </View>
          
          {/* Behavior */}
          <View style={styles.subsection}>
            <Text style={styles.label}>Comportamento</Text>
            {persona.decision_process && (
              <Text style={styles.value}>
                <Text style={styles.label}>Processo decisionale: </Text>
                {persona.decision_process}
              </Text>
            )}
            {persona.budget_range && (
              <Text style={styles.value}>
                <Text style={styles.label}>Budget: </Text>
                {persona.budget_range}
              </Text>
            )}
            {persona.purchase_frequency && (
              <Text style={styles.value}>
                <Text style={styles.label}>Frequenza acquisti: </Text>
                {persona.purchase_frequency}
              </Text>
            )}
            {persona.preferred_channels && persona.preferred_channels.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Canali preferiti: </Text>
                {persona.preferred_channels.join(', ')}
              </Text>
            )}
            {persona.touchpoints && persona.touchpoints.length > 0 && (
              <Text style={styles.value}>
                <Text style={styles.label}>Touchpoints: </Text>
                {persona.touchpoints.join(', ')}
              </Text>
            )}
          </View>
          
          {/* Quote */}
          {persona.representative_quote && (
            <View style={styles.subsection}>
              <Text style={styles.label}>Quote Rappresentativo</Text>
              <View style={styles.quote}>
                <Text style={styles.value}>&ldquo;{persona.representative_quote}&rdquo;</Text>
                {persona.quote_context && (
                  <Text style={[styles.value, { marginTop: 5, fontSize: 9 }]}>
                    - {persona.quote_context}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  )
}
