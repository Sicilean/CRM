"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ServicePreset, ServiceModule } from "@/types/service-configuration.types";

interface ServicePresetCardProps {
  preset: ServicePreset;
  modules: ServiceModule[];
  onSelect: () => void;
}

export default function ServicePresetCard({
  preset,
  modules,
  onSelect,
}: ServicePresetCardProps) {
  // Get included modules details
  const includedModules = modules.filter((m) =>
    preset.included_modules.includes(m.id)
  );

  // Calculate total price if not provided
  const totalPrice = preset.total_price || 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        preset.is_featured
          ? "border-primary ring-2 ring-primary/20"
          : "hover:border-primary/50"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{preset.name}</CardTitle>
          {preset.badge_text && (
            <Badge
              variant={preset.is_featured ? "default" : "secondary"}
              className="shrink-0"
            >
              {preset.badge_text}
            </Badge>
          )}
        </div>
        {preset.description && (
          <CardDescription className="text-sm">
            {preset.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Included Modules */}
        {includedModules.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Moduli Inclusi
            </p>
            <div className="space-y-1">
              {includedModules.map((module) => (
                <div key={module.id} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{module.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parameters Summary */}
        {Object.keys(preset.parameters).length > 0 && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {Object.entries(preset.parameters).map(([key, value]) => (
              <div key={key}>
                {key}: <span className="font-medium text-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Discount Badge */}
        {preset.discount_percentage > 0 && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            -{preset.discount_percentage}% sconto
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button className="w-full" variant={preset.is_featured ? "default" : "outline"}>
          Seleziona
        </Button>
      </CardFooter>
    </Card>
  );
}

