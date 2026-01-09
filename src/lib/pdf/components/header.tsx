import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { styles } from '../styles'

interface PDFHeaderProps {
  brandName: string
  clientName: string
  currentDate: string
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({
  brandName,
  clientName,
  currentDate
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Brand Strategy</Text>
        <Text style={styles.headerSubtitle}>{brandName}</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerClient}>Cliente: {clientName}</Text>
        <Text style={styles.headerDate}>Data: {currentDate}</Text>
      </View>
    </View>
  )
}
