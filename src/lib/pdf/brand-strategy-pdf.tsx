import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { styles } from './styles'
import { PDFHeader } from './components/header'
import { CompanyInfo, CompanyContact } from './components/company-info'
import { BrandFoundation } from './components/brand-foundation'
import { BrandIdentity } from './components/brand-identity'
import { Positioning } from './components/positioning'
import { Personas } from './components/personas'
import { Communication } from './components/communication'
import { BrandStory } from './components/brand-story'

interface BrandStrategyPDFProps {
  strategy: any
  brandName: string
  clientName: string
  companyInfo: {
    company_name: string
    legal_name: string
    vat_number: string
    fiscal_code: string
    address: string
    city: string
    postal_code: string
    province: string
    country: string
    phone: string
    email: string
    pec: string
    website: string
  }
}

export const BrandStrategyPDF: React.FC<BrandStrategyPDFProps> = ({
  strategy,
  brandName,
  clientName,
  companyInfo
}) => {
  const currentDate = new Date().toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Professionale */}
        <PDFHeader 
          brandName={brandName}
          clientName={clientName}
          currentDate={currentDate}
        />

        {/* Content */}
        <View style={styles.content}>
          <BrandFoundation strategy={strategy} />
          <BrandIdentity strategy={strategy} />
          <Positioning strategy={strategy} />
          <Personas strategy={strategy} />
          <Communication strategy={strategy} />
          <BrandStory strategy={strategy} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <CompanyInfo companyInfo={companyInfo} />
          <CompanyContact companyInfo={companyInfo} />
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Pagina ${pageNumber} di ${totalPages}`
        )} />
      </Page>
    </Document>
  )
}

