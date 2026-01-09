# Sicilean CRM

Area Commerciale del gestionale Sicilean: CRM, Catalogo Servizi e Preventivi.

## 🎯 Caratteristiche

- **CRM Completo**: Gestione leads, opportunità e clienti con calcolo CLV
- **Catalogo Servizi**: Gestione servizi con pricing dinamico e moduli configurabili
- **Preventivi**: Creazione preventivi personalizzati con generazione PDF
- **UI Moderna**: Design system coerente con il gestionale principale
- **Database Condiviso**: Utilizza lo stesso database Supabase

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+
- npm o yarn
- Accesso al database Supabase

### Installazione

```bash
# Clona il repository
git clone https://github.com/Sicilean/CRM.git
cd CRM

# Installa dipendenze
npm install

# Configura variabili d'ambiente
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Supabase

# Avvia il server di sviluppo
npm run dev
```

### Variabili d'Ambiente

Crea un file `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Struttura Progetto

```
sicilean-crm/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── commerciale/    # Dashboard e CRM
│   │   │   ├── preventivi/      # Gestione preventivi
│   │   │   └── servizi/         # Catalogo servizi
│   │   ├── (public)/
│   │   │   └── preventivo/     # Vista pubblica preventivi
│   │   ├── api/                 # API routes
│   │   └── login/              # Autenticazione
│   ├── components/
│   │   ├── features/           # Componenti business logic
│   │   ├── layout/             # Layout e navigazione
│   │   └── ui/                 # Componenti UI base
│   ├── lib/                    # Utilities e helpers
│   ├── hooks/                  # React hooks
│   └── types/                  # TypeScript types
└── public/                     # Assets statici
```

## 🛠️ Script Disponibili

```bash
npm run dev          # Server di sviluppo
npm run build        # Build produzione
npm run start        # Avvia server produzione
npm run lint         # Linting
npm run type-check   # Verifica TypeScript
```

## 📚 Funzionalità

### CRM

- Gestione leads con import/export CSV
- Pipeline opportunità con stage configurabili
- Calcolo automatico Customer Lifetime Value (CLV)
- Tracking attività e follow-up

### Servizi

- Catalogo servizi con varianti e addon
- Pricing dinamico con parametri configurabili
- Moduli e preset servizi
- Mapping servizi → output operativi

### Preventivi

- Creazione preventivi personalizzati
- Configurazione servizi con pricing avanzato
- Generazione PDF professionale
- Vista pubblica con token univoco
- Tracking stato e conversioni

## 🔗 Integrazione

Questo repository è separato dal gestionale principale ma condivide:

- **Database**: Stesso Supabase
- **Autenticazione**: Stesso sistema auth
- **UI**: Stessi componenti e design system

## 📝 Licenza

Proprietario - Sicilean

## 👥 Team

Sviluppato da Sicilean Team
