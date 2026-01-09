"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Percent, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RelatedService {
  id: string;
  name: string;
  base_price: number;
  description?: string;
  relationship_type: string;
  priority: number;
  discount_if_bundled?: number;
  auto_suggest: boolean;
}

interface RelatedServicesPanelProps {
  serviceId: string;
  onAddService: (serviceId: string) => void;
  excludeServiceIds?: string[];
}

export default function RelatedServicesPanel({
  serviceId,
  onAddService,
  excludeServiceIds = [],
}: RelatedServicesPanelProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);

  const loadRelatedServices = useCallback(async () => {
    setLoading(true);
    try {
      // Query diretta alla tabella service_relationships per ottenere servizi correlati
      const { data: relationships, error } = await supabase
        .from('service_relationships')
        .select(`
          related_service_id,
          relationship_type,
          display_order,
          description,
          service:services!service_relationships_related_service_id_fkey(
            id,
            name,
            base_price,
            description
          )
        `)
        .eq('service_id', serviceId)
        .in('relationship_type', [
          'frequently_together',
          'complementary',
          'recommended_addon',
        ])
        .order('display_order', { ascending: true, nullsFirst: false });

      if (error) {
        console.error("Error loading related services:", error);
      } else if (relationships) {
        // Filtra servizi già aggiunti e mappa i dati
        interface ServiceRelationship {
          related_service_id: string
          relationship_type: string
          display_order: number | null
          description: string | null
          service: {
            id: string
            name: string
            base_price: number
            description: string | null
          } | null
        }

        const filtered = relationships
          .filter((rel: ServiceRelationship) => 
            rel.service && !excludeServiceIds.includes(rel.related_service_id)
          );

        setRelatedServices(
          filtered.map((rel: ServiceRelationship) => ({
            id: rel.related_service_id,
            name: rel.service?.name || '',
            base_price: rel.service?.base_price || 0,
            description: rel.service?.description || undefined,
            relationship_type: rel.relationship_type,
            priority: rel.display_order || 0,
            discount_if_bundled: null, // Non disponibile in service_relationships
            auto_suggest: true,
          }))
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [serviceId, supabase, excludeServiceIds]);

  useEffect(() => {
    loadRelatedServices();
  }, [loadRelatedServices]);

  const relationshipLabels: Record<string, { icon: string; label: string; color: string }> = {
    frequently_together: {
      icon: "🔥",
      label: "Spesso insieme",
      color: "bg-orange-100 text-orange-800 border-orange-300",
    },
    complementary: {
      icon: "✨",
      label: "Complementare",
      color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    recommended_addon: {
      icon: "⭐",
      label: "Consigliato",
      color: "bg-purple-100 text-purple-800 border-purple-300",
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Servizi Correlati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedServices.length === 0) {
    return null; // Non mostrare se non ci sono servizi correlati
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Servizi Correlati
        </CardTitle>
        <CardDescription className="text-xs">
          Aggiungi questi servizi per completare l&apos;offerta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {relatedServices.map((service) => {
          const relInfo =
            relationshipLabels[service.relationship_type] ||
            relationshipLabels.complementary;

          return (
            <div
              key={service.id}
              className="flex items-start justify-between gap-3 p-3 border rounded-lg bg-background"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{service.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${relInfo.color}`}
                  >
                    {relInfo.icon} {relInfo.label}
                  </Badge>
                </div>

                {service.discount_if_bundled && service.discount_if_bundled > 0 && (
                  <Alert className="py-2 bg-green-50 border-green-200">
                    <Percent className="h-3 w-3 text-green-600" />
                    <AlertDescription className="text-xs text-green-800 ml-2">
                      -{service.discount_if_bundled}% se acquistato insieme
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddService(service.id)}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

