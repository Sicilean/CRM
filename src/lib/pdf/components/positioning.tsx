import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles'
import { CompetitorMatrixPDF } from './visualizations'

interface PositioningProps {
  strategy: any
}

export const Positioning: React.FC<PositioningProps> = ({ strategy }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. Positioning & Competitors</Text>
      
      {/* Core Values */}
      {strategy.core_values && strategy.core_values.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Core Values</Text>
          {strategy.core_values.map((value: any, index: number) => (
            <View key={index} style={styles.subsection}>
              <Text style={styles.label}>{value.value_name}</Text>
              <Text style={styles.value}>{value.value_description || 'Non specificato'}</Text>
              {value.practical_example && (
                <Text style={[styles.value, { fontStyle: 'italic', marginTop: 3 }]}>
                  Esempio: {value.practical_example}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
      
      {/* Competitor Analysis con visualizzazione */}
      <CompetitorMatrixPDF competitors={strategy.competitors || []} />
      
      {/* Differentiation Opportunities */}
      {strategy.differentiation_opportunities && (
        <View style={styles.subsection}>
          <Text style={styles.label}>Opportunità di Differenziazione</Text>
          <Text style={styles.value}>{strategy.differentiation_opportunities}</Text>
        </View>
      )}
      
      {/* Positioning Notes */}
      {strategy.positioning_notes && (
        <View style={styles.subsection}>
          <Text style={styles.label}>Note di Posizionamento</Text>
          <Text style={styles.value}>{strategy.positioning_notes}</Text>
        </View>
      )}
    </View>
  )
}

