import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles'

interface CompanyInfoProps {
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

export const CompanyInfo: React.FC<CompanyInfoProps> = ({ companyInfo }) => (
  <View style={styles.footerLeft}>
    <Text style={styles.footerTitle}>{companyInfo.company_name}</Text>
    <Text style={styles.footerText}>{companyInfo.legal_name}</Text>
    <Text style={styles.footerText}>
      {companyInfo.address}, {companyInfo.postal_code} {companyInfo.city} ({companyInfo.province})
    </Text>
    <Text style={styles.footerText}>{companyInfo.country}</Text>
    <Text style={styles.footerText}>P.IVA: {companyInfo.vat_number}</Text>
    <Text style={styles.footerText}>CF: {companyInfo.fiscal_code}</Text>
  </View>
)

export const CompanyContact: React.FC<CompanyInfoProps> = ({ companyInfo }) => (
  <View style={styles.footerRight}>
    <Text style={styles.footerTitle}>Contatti</Text>
    <Text style={styles.footerText}>Tel: {companyInfo.phone}</Text>
    <Text style={styles.footerText}>Email: {companyInfo.email}</Text>
    <Text style={styles.footerText}>PEC: {companyInfo.pec}</Text>
    <Text style={styles.footerText}>Web: {companyInfo.website}</Text>
  </View>
)



