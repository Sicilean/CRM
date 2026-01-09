"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Target,
  Trophy,
  Flame,
  Star,
  Zap,
  Award,
  Gift,
  Crown,
  Rocket,
  Euro,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ====== TIPI ======

interface CommissionTier {
  min: number;
  max: number | null;
  percentage: number;
  label: string;
  color: string;
  icon: React.ReactNode;
}

interface SalesData {
  monthlySales: number; // Vendite del mese corrente (IVA esclusa)
  quarterlySales: number; // Vendite del trimestre corrente (IVA esclusa)
  monthlyTarget: number; // Target mensile per incentivare
  quarterlyBonusThreshold: number; // Soglia per bonus trimestrale (60001)
  quarterlyBonus: number; // Valore bonus trimestrale (5000)
  closedDeals: number; // Numero contratti chiusi nel mese
  quarterlyClosedDeals: number; // Numero contratti chiusi nel trimestre
}

// ====== COSTANTI ======

const COMMISSION_TIERS: CommissionTier[] = [
  {
    min: 0,
    max: 3000,
    percentage: 5,
    label: "Bronze",
    color: "from-amber-700 to-amber-500",
    icon: <Star className="h-4 w-4" />,
  },
  {
    min: 3001,
    max: 5000,
    percentage: 6,
    label: "Silver",
    color: "from-slate-400 to-slate-300",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    min: 5001,
    max: 10000,
    percentage: 7,
    label: "Gold",
    color: "from-yellow-500 to-yellow-400",
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    min: 10001,
    max: null,
    percentage: 9,
    label: "Platinum",
    color: "from-violet-600 to-violet-400",
    icon: <Crown className="h-4 w-4" />,
  },
];

const QUARTERLY_BONUS_THRESHOLD = 60001;
const QUARTERLY_BONUS_AMOUNT = 5000;

// ====== UTILITY FUNCTIONS ======

function getCurrentTier(sales: number): CommissionTier {
  for (let i = COMMISSION_TIERS.length - 1; i >= 0; i--) {
    if (sales >= COMMISSION_TIERS[i].min) {
      return COMMISSION_TIERS[i];
    }
  }
  return COMMISSION_TIERS[0];
}

function getNextTier(sales: number): CommissionTier | null {
  const currentIndex = COMMISSION_TIERS.findIndex(
    (tier) => tier.max !== null && sales <= tier.max
  );
  if (currentIndex >= 0 && currentIndex < COMMISSION_TIERS.length - 1) {
    return COMMISSION_TIERS[currentIndex + 1];
  }
  return null;
}

function calculateCommission(sales: number): number {
  const tier = getCurrentTier(sales);
  return sales * (tier.percentage / 100);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getQuarterInfo(): { quarter: number; label: string; startMonth: number; endMonth: number } {
  const month = new Date().getMonth(); // 0-11
  if (month < 3) return { quarter: 1, label: "Q1", startMonth: 0, endMonth: 2 };
  if (month < 6) return { quarter: 2, label: "Q2", startMonth: 3, endMonth: 5 };
  if (month < 9) return { quarter: 3, label: "Q3", startMonth: 6, endMonth: 8 };
  return { quarter: 4, label: "Q4", startMonth: 9, endMonth: 11 };
}

function getCurrentMonthName(): string {
  return new Date().toLocaleDateString("it-IT", { month: "long" });
}

function getDaysLeftInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

function getDaysLeftInQuarter(): number {
  const now = new Date();
  const { endMonth } = getQuarterInfo();
  const lastDayOfQuarter = new Date(now.getFullYear(), endMonth + 1, 0);
  const diffTime = lastDayOfQuarter.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ====== COMPONENTI ======

function TierProgressCard({ salesData }: { salesData: SalesData }) {
  const currentTier = getCurrentTier(salesData.monthlySales);
  const nextTier = getNextTier(salesData.monthlySales);
  const currentTierIndex = COMMISSION_TIERS.indexOf(currentTier);

  // Calcola progresso verso prossimo tier
  const progressToNextTier = nextTier
    ? ((salesData.monthlySales - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const amountToNextTier = nextTier
    ? nextTier.min - salesData.monthlySales
    : 0;

  return (
    <Card className="relative overflow-hidden">
      {/* Background gradient animato */}
      <div className={cn(
        "absolute inset-0 opacity-10 bg-gradient-to-br",
        currentTier.color
      )} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br text-white",
              currentTier.color
            )}>
              {currentTier.icon}
            </div>
            <div>
              <CardTitle className="text-lg">Livello {currentTier.label}</CardTitle>
              <CardDescription>
                Commissione attuale: <span className="font-bold text-foreground">{currentTier.percentage}%</span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg font-bold">
            {formatCurrency(calculateCommission(salesData.monthlySales))}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tier Progress Steps */}
        <div className="flex items-center gap-1 py-2">
          {COMMISSION_TIERS.map((tier, index) => (
            <div key={tier.label} className="flex-1 flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                index <= currentTierIndex 
                  ? `bg-gradient-to-br ${tier.color} text-white shadow-lg` 
                  : "bg-muted text-muted-foreground"
              )}>
                {tier.icon}
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-medium",
                index <= currentTierIndex ? "text-foreground" : "text-muted-foreground"
              )}>
                {tier.percentage}%
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar verso prossimo tier */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Prossimo livello: <span className="font-semibold text-foreground">{nextTier.label}</span>
              </span>
              <span className="font-bold text-foreground">
                {formatCurrency(amountToNextTier)} mancanti
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(progressToNextTier, 100)} 
                className="h-3"
              />
              {progressToNextTier >= 80 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 animate-pulse">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Vendi ancora {formatCurrency(amountToNextTier)} per sbloccare il {nextTier.percentage}% di commissione!
            </p>
          </div>
        )}

        {/* Messaggio se al massimo tier */}
        {!nextTier && (
          <div className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg">
            <Crown className="h-6 w-6 text-violet-500" />
            <span className="font-bold text-violet-600 dark:text-violet-400">
              Hai raggiunto il livello massimo! 🎉
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MonthlyOverviewCard({ salesData }: { salesData: SalesData }) {
  const currentTier = getCurrentTier(salesData.monthlySales);
  const commission = calculateCommission(salesData.monthlySales);
  const daysLeft = getDaysLeftInMonth();
  const monthName = getCurrentMonthName();

  // Calcola velocità media giornaliera necessaria
  const dailyAverage = daysLeft > 0 ? salesData.monthlySales / (new Date().getDate()) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl capitalize flex items-center gap-2">
              <Target className="h-5 w-5" />
              Vendite {monthName}
            </CardTitle>
            <CardDescription>
              {daysLeft} giorni rimanenti nel mese
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Big number display */}
        <div className="text-center py-4">
          <div className="text-4xl md:text-5xl font-bold tracking-tight">
            {formatCurrency(salesData.monthlySales)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            IVA esclusa
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {salesData.closedDeals}
            </div>
            <div className="text-xs text-muted-foreground">
              Contratti chiusi
            </div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className={cn(
              "text-2xl font-bold",
              `text-foreground`
            )}>
              {currentTier.percentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              Commissione
            </div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(commission)}
            </div>
            <div className="text-xs text-muted-foreground">
              Guadagno
            </div>
          </div>
        </div>

        {/* Daily average insight */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Media giornaliera</span>
          </div>
          <span className="font-semibold">{formatCurrency(dailyAverage)}/giorno</span>
        </div>
      </CardContent>
    </Card>
  );
}

function QuarterlyBonusCard({ salesData }: { salesData: SalesData }) {
  const quarterInfo = getQuarterInfo();
  const daysLeft = getDaysLeftInQuarter();
  const progress = (salesData.quarterlySales / QUARTERLY_BONUS_THRESHOLD) * 100;
  const amountRemaining = QUARTERLY_BONUS_THRESHOLD - salesData.quarterlySales;
  const bonusAchieved = salesData.quarterlySales >= QUARTERLY_BONUS_THRESHOLD;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      bonusAchieved && "ring-2 ring-yellow-500 dark:ring-yellow-400"
    )}>
      {/* Confetti effect when bonus achieved */}
      {bonusAchieved && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 text-2xl animate-bounce" style={{ animationDelay: "0ms" }}>🎉</div>
          <div className="absolute top-4 right-8 text-xl animate-bounce" style={{ animationDelay: "200ms" }}>🎊</div>
          <div className="absolute bottom-8 left-12 text-lg animate-bounce" style={{ animationDelay: "400ms" }}>⭐</div>
          <div className="absolute bottom-4 right-4 text-2xl animate-bounce" style={{ animationDelay: "100ms" }}>💰</div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              bonusAchieved 
                ? "bg-gradient-to-br from-yellow-500 to-amber-500 text-white" 
                : "bg-muted"
            )}>
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Bonus Trimestrale {quarterInfo.label}</CardTitle>
              <CardDescription>
                {daysLeft} giorni rimanenti nel trimestre
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={bonusAchieved ? "default" : "secondary"}
            className={cn(
              "text-lg font-bold px-3 py-1",
              bonusAchieved && "bg-gradient-to-r from-yellow-500 to-amber-500"
            )}
          >
            {formatCurrency(QUARTERLY_BONUS_AMOUNT)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress visualization */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Progresso verso il bonus
            </span>
            <span className="font-bold">
              {Math.min(progress, 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={Math.min(progress, 100)} 
              className={cn(
                "h-4",
                bonusAchieved && "[&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-amber-500"
              )}
            />
            {/* Threshold marker */}
            <div 
              className="absolute top-0 h-full w-0.5 bg-foreground"
              style={{ left: "100%" }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(0)}</span>
            <span className="font-semibold text-foreground">
              Soglia: {formatCurrency(QUARTERLY_BONUS_THRESHOLD)}
            </span>
          </div>
        </div>

        {/* Current sales vs target */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold">{formatCurrency(salesData.quarterlySales)}</div>
            <div className="text-xs text-muted-foreground">Vendite {quarterInfo.label}</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className={cn(
              "text-2xl font-bold",
              bonusAchieved ? "text-green-600 dark:text-green-400" : "text-foreground"
            )}>
              {bonusAchieved ? "✓ Sbloccato!" : formatCurrency(amountRemaining)}
            </div>
            <div className="text-xs text-muted-foreground">
              {bonusAchieved ? "Bonus ottenuto" : "Mancanti al bonus"}
            </div>
          </div>
        </div>

        {/* Motivational message */}
        {!bonusAchieved && (
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Rocket className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              {progress >= 80 
                ? "Ci sei quasi! Spingi ancora un po' per il bonus!" 
                : progress >= 50 
                  ? "Ottimo lavoro! Sei a metà strada verso il bonus!" 
                  : "Inizia a costruire il tuo percorso verso il bonus trimestrale!"}
            </p>
          </div>
        )}

        {/* Success message */}
        {bonusAchieved && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20">
            <Award className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                Congratulazioni! 🎉
              </p>
              <p className="text-sm text-muted-foreground">
                Hai sbloccato il bonus trimestrale di {formatCurrency(QUARTERLY_BONUS_AMOUNT)}!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommissionScaleCard({ currentSales }: { currentSales: number }) {
  const currentTier = getCurrentTier(currentSales);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2 p-3 md:p-4">
        <CardTitle className="text-sm md:text-base flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Scala Commissioni
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 md:p-4 pt-0">
        {/* Layout compatto a griglia 2x2 su mobile, 4 colonne su desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {COMMISSION_TIERS.map((tier) => {
            const isCurrentTier = tier.label === currentTier.label;
            const isAchieved = currentSales >= tier.min;
            
            return (
              <div 
                key={tier.label}
                className={cn(
                  "flex flex-col items-center p-2 md:p-3 rounded-lg border transition-all text-center",
                  isCurrentTier 
                    ? "border-primary bg-primary/5 ring-1 ring-primary" 
                    : isAchieved 
                      ? "bg-muted/50 border-transparent" 
                      : "bg-card opacity-50 border-dashed"
                )}
              >
                <div className={cn(
                  "p-1.5 md:p-2 rounded-lg bg-gradient-to-br text-white shrink-0 transition-transform mb-1",
                  tier.color,
                  isCurrentTier && "scale-110"
                )}>
                  {tier.icon}
                </div>
                <span className={cn(
                  "text-xs font-semibold",
                  isCurrentTier && "text-primary"
                )}>{tier.label}</span>
                <Badge 
                  variant={isCurrentTier ? "default" : "outline"} 
                  className="text-[10px] mt-1 px-1.5"
                >
                  {tier.percentage}%
                </Badge>
                <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 leading-tight">
                  {tier.max 
                    ? `≤ ${formatCurrency(tier.max)}` 
                    : `> ${formatCurrency(tier.min - 1)}`}
                </p>
              </div>
            );
          })}
        </div>

        {/* Info box compatto */}
        <div className="mt-2 p-2 bg-muted/50 rounded-lg">
          <p className="text-[10px] md:text-xs text-muted-foreground text-center">
            Commissione calcolata sulle vendite mensili (IVA esclusa)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ====== MAIN COMPONENT ======

interface AgentSalesDashboardProps {
  userId: string;
  initialMonthlySales?: number;
  initialQuarterlySales?: number;
  initialMonthlyDeals?: number;
  initialQuarterlyDeals?: number;
}

export function AgentSalesDashboard({
  userId,
  initialMonthlySales = 0,
  initialQuarterlySales = 0,
  initialMonthlyDeals = 0,
  initialQuarterlyDeals = 0,
}: AgentSalesDashboardProps) {
  const [salesData, setSalesData] = useState<SalesData>({
    monthlySales: initialMonthlySales,
    quarterlySales: initialQuarterlySales,
    monthlyTarget: 10000, // Target suggerito
    quarterlyBonusThreshold: QUARTERLY_BONUS_THRESHOLD,
    quarterlyBonus: QUARTERLY_BONUS_AMOUNT,
    closedDeals: initialMonthlyDeals,
    quarterlyClosedDeals: initialQuarterlyDeals,
  });

  // Aggiorna salesData quando cambiano le props iniziali
  useEffect(() => {
    setSalesData({
      monthlySales: initialMonthlySales,
      quarterlySales: initialQuarterlySales,
      monthlyTarget: 10000,
      quarterlyBonusThreshold: QUARTERLY_BONUS_THRESHOLD,
      quarterlyBonus: QUARTERLY_BONUS_AMOUNT,
      closedDeals: initialMonthlyDeals,
      quarterlyClosedDeals: initialQuarterlyDeals,
    });
  }, [initialMonthlySales, initialQuarterlySales, initialMonthlyDeals, initialQuarterlyDeals]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header con totale guadagni potenziali */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-foreground/20 rounded-xl">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm">
                Guadagno potenziale questo mese
              </p>
              <p className="text-3xl md:text-4xl font-bold">
                {formatCurrency(
                  calculateCommission(salesData.monthlySales) +
                  (salesData.quarterlySales >= QUARTERLY_BONUS_THRESHOLD 
                    ? QUARTERLY_BONUS_AMOUNT / 3 // Quota mensile del bonus trimestrale
                    : 0)
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">{salesData.closedDeals}</p>
              <p className="text-primary-foreground/70 text-xs">Chiusi questo mese</p>
            </div>
            <div className="h-12 w-px bg-primary-foreground/20" />
            <div>
              <p className="text-3xl font-bold">{salesData.quarterlyClosedDeals}</p>
              <p className="text-primary-foreground/70 text-xs">Chiusi nel trimestre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principale */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Colonna sinistra */}
        <div className="space-y-4 md:space-y-6">
          <MonthlyOverviewCard salesData={salesData} />
          <TierProgressCard salesData={salesData} />
        </div>

        {/* Colonna destra */}
        <div className="space-y-4 md:space-y-6">
          <QuarterlyBonusCard salesData={salesData} />
          <CommissionScaleCard currentSales={salesData.monthlySales} />
        </div>
      </div>
    </div>
  );
}
