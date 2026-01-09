import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles'

interface BrandFoundationProps {
  strategy: any
}

export const BrandFoundation: React.FC<BrandFoundationProps> = ({ strategy }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>1. Brand Foundation</Text>
    
    {/* Overview Cards */}
    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <View style={styles.card}>
          <Text style={[styles.label, { fontSize: 10, color: '#007bff', marginBottom: 5 }]}>Purpose</Text>
          <Text style={[styles.value, { fontSize: 9 }]}>
            {strategy.purpose || 'Non specificato'}
          </Text>
        </View>
      </View>
      
      <View style={styles.gridItem}>
        <View style={styles.card}>
          <Text style={[styles.label, { fontSize: 10, color: '#10B981', marginBottom: 5 }]}>Vision</Text>
          <Text style={[styles.value, { fontSize: 9 }]}>
            {strategy.vision || 'Non specificato'}
          </Text>
        </View>
      </View>
    </View>
    
    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <View style={styles.card}>
          <Text style={[styles.label, { fontSize: 10, color: '#F59E0B', marginBottom: 5 }]}>Mission</Text>
          <Text style={[styles.value, { fontSize: 9 }]}>
            {strategy.mission || 'Non specificato'}
          </Text>
        </View>
      </View>
      
      <View style={styles.gridItem}>
        <View style={styles.card}>
          <Text style={[styles.label, { fontSize: 10, color: '#8B5CF6', marginBottom: 5 }]}>UVP</Text>
          <Text style={[styles.value, { fontSize: 9 }]}>
            {strategy.unique_value_proposition || 'Non specificato'}
          </Text>
        </View>
      </View>
    </View>
    
    {/* Brand Promise */}
    {strategy.brand_promise && (
      <View style={styles.highlight}>
        <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Brand Promise</Text>
        <Text style={[styles.value, { fontSize: 11, lineHeight: 1.4 }]}>
          {strategy.brand_promise}
        </Text>
      </View>
    )}
    
    {/* Brand Values */}
    {strategy.core_values && strategy.core_values.length > 0 && (
      <View style={styles.highlight}>
        <Text style={[styles.subsectionTitle, { marginBottom: 10 }]}>Core Values</Text>
        {strategy.core_values.map((value: any, index: number) => (
          <View key={index} style={styles.subsection}>
            <Text style={[styles.label, { fontSize: 10, color: '#007bff' }]}>
              {value.value_name}
            </Text>
            <Text style={[styles.value, { fontSize: 9, marginBottom: 5 }]}>
              {value.value_description}
            </Text>
            {value.practical_example && (
              <Text style={[styles.value, { fontSize: 8, color: '#6B7280', fontStyle: 'italic' }]}>
                Esempio: {value.practical_example}
              </Text>
            )}
          </View>
        ))}
      </View>
    )}
  </View>
)