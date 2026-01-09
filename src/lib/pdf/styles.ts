import { StyleSheet } from '@react-pdf/renderer'

// Colori Sicilean - Palette professionale
const colors = {
  primary: '#1F2937',      // Grigio scuro per testi principali
  secondary: '#6B7280',    // Grigio medio per testi secondari
  accent: '#007bff',       // Blu Sicilean
  accentLight: '#3B82F6',  // Blu più chiaro
  light: '#F8FAFC',        // Grigio molto chiaro per sfondi
  white: '#FFFFFF',        // Bianco puro
  border: '#E2E8F0',       // Grigio chiaro per bordi
  success: '#10B981',      // Verde per elementi positivi
  warning: '#F59E0B',      // Arancione per avvisi
  error: '#EF4444',        // Rosso per errori
  purple: '#8B5CF6',       // Viola per elementi speciali
  pink: '#EC4899',         // Rosa per elementi femminili
  teal: '#14B8A6'          // Turchese per elementi freschi
}

export const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: colors.primary
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
    backgroundColor: colors.light,
    padding: 20,
    borderRadius: 8,
    margin: 20,
    marginBottom: 30
  },
  
  headerLeft: {
    flex: 1
  },
  
  headerRight: {
    flex: 1,
    alignItems: 'flex-end'
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 5,
    letterSpacing: -0.5
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 3
  },
  
  headerClient: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 3,
    fontWeight: 'bold'
  },
  
  headerDate: {
    fontSize: 9,
    color: colors.secondary
  },
  
  logo: {
    width: 60,
    height: 30,
    marginBottom: 10
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5
  },
  
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 4,
    fontWeight: 'normal'
  },
  
  date: {
    fontSize: 10,
    color: colors.secondary
  },
  
  // Content
  content: {
    flex: 1
  },
  
  section: {
    pageBreakInside: 'avoid',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    margin: 20,
    marginBottom: 30
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    letterSpacing: -0.3
  },
  
  subsection: {
    marginBottom: 12
  },
  
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5
  },
  
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  
  value: {
    fontSize: 11,
    color: colors.primary,
    marginBottom: 8,
    lineHeight: 1.5
  },
  
  emptyValue: {
    fontSize: 10,
    color: colors.secondary,
    fontStyle: 'italic',
    marginBottom: 8
  },
  
  // Lists
  list: {
    marginLeft: 15
  },
  
  listItem: {
    fontSize: 10,
    color: colors.primary,
    marginBottom: 3,
    lineHeight: 1.4
  },
  
  // Tables
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  
  tableHeader: {
    backgroundColor: colors.light,
    fontWeight: 'bold'
  },
  
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: colors.border
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  
  footerLeft: {
    flex: 1
  },
  
  footerRight: {
    flex: 1,
    alignItems: 'flex-end'
  },
  
  footerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 3
  },
  
  footerText: {
    fontSize: 8,
    color: colors.secondary,
    marginBottom: 2,
    lineHeight: 1.3
  },
  
  // Special elements
  quote: {
    fontStyle: 'italic',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 10,
    marginVertical: 8
  },
  
  // Page numbers
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 30,
    fontSize: 8,
    color: colors.secondary
  },
  
  // Visualizzazioni e elementi speciali
  highlight: {
    backgroundColor: colors.light,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: 12
  },
  
  visualization: {
    backgroundColor: colors.white,
    border: `2px solid ${colors.accent}`,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10
  },
  
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4
  },
  
  badge: {
    backgroundColor: colors.accent,
    color: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  
  card: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  
  gridItem: {
    width: '48%',
    marginBottom: 10
  }
})

