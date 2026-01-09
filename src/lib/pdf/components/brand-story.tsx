import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles'

interface BrandStoryProps {
  strategy: any
}

export const BrandStory: React.FC<BrandStoryProps> = ({ strategy }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>6. Brand Story & Narrative</Text>
      
      {/* Brand Name */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Brand Name</Text>
        
        {strategy.brand_name_origin && (
          <View style={styles.subsection}>
            <Text style={styles.label}>Origine del Nome</Text>
            <Text style={styles.value}>{strategy.brand_name_origin}</Text>
          </View>
        )}
        
        {strategy.brand_name_meaning && (
          <View style={styles.subsection}>
            <Text style={styles.label}>Significato</Text>
            <Text style={styles.value}>{strategy.brand_name_meaning}</Text>
          </View>
        )}
        
        {strategy.brand_name_pronunciation && (
          <View style={styles.subsection}>
            <Text style={styles.label}>Pronuncia</Text>
            <Text style={styles.value}>{strategy.brand_name_pronunciation}</Text>
          </View>
        )}
      </View>
      
      {/* Elevator Pitch */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Elevator Pitch</Text>
        
        {strategy.elevator_pitch_30s && (
          <View style={styles.subsection}>
            <Text style={styles.label}>Pitch 30 secondi</Text>
            <View style={styles.quote}>
              <Text style={styles.value}>{strategy.elevator_pitch_30s}</Text>
            </View>
          </View>
        )}
        
        {strategy.one_liner && (
          <View style={styles.subsection}>
            <Text style={styles.label}>One Liner</Text>
            <View style={styles.quote}>
              <Text style={styles.value}>{strategy.one_liner}</Text>
            </View>
          </View>
        )}
        
        {strategy.extended_pitch && (
          <View style={styles.subsection}>
            <Text style={styles.label}>Pitch Esteso</Text>
            <Text style={styles.value}>{strategy.extended_pitch}</Text>
          </View>
        )}
      </View>
      
      {/* Payoff */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Payoff</Text>
        
        {strategy.payoff_main && (
          <View style={styles.subsection}>
            <Text style={styles.label}>Payoff Principale</Text>
            <View style={[styles.highlight, { textAlign: 'center' }]}>
              <Text style={[styles.value, { fontSize: 14, fontWeight: 'bold' }]}>
                {strategy.payoff_main}
              </Text>
            </View>
          </View>
        )}
        
        {strategy.payoff_variants && strategy.payoff_variants.length > 0 && (
          <View style={styles.subsection}>
            <Text style={styles.label}>Varianti Payoff</Text>
            <View style={styles.list}>
              {strategy.payoff_variants.map((variant: string, index: number) => (
                <Text key={index} style={styles.listItem}>
                  • {variant}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
      
      {/* Key Messages */}
      {strategy.recurring_messages && strategy.recurring_messages.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Messaggi Ricorrenti</Text>
          <View style={styles.list}>
            {strategy.recurring_messages.map((message: string, index: number) => (
              <Text key={index} style={styles.listItem}>
                • {message}
              </Text>
            ))}
          </View>
        </View>
      )}
      
      {/* Industry Trends */}
      {strategy.industry_trends && strategy.industry_trends.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Trend di Settore</Text>
          <View style={styles.list}>
            {strategy.industry_trends.map((trend: string, index: number) => (
              <Text key={index} style={styles.listItem}>
                • {trend}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}



