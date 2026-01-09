"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceParameter } from "@/types/service-configuration.types";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ServiceParameterInputProps {
  parameter: ServiceParameter;
  value: any;
  onChange: (value: any) => void;
}

export default function ServiceParameterInput({
  parameter,
  value,
  onChange,
}: ServiceParameterInputProps) {
  const renderInput = () => {
    switch (parameter.parameter_type) {
      case "number":
        const possibleValues = parameter.possible_values as
          | { min?: number; max?: number; step?: number }
          | undefined;

        return (
          <Input
            type="number"
            min={possibleValues?.min}
            max={possibleValues?.max}
            step={possibleValues?.step || 1}
            value={value || parameter.default_value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={parameter.placeholder}
          />
        );

      case "select":
        const options = Array.isArray(parameter.possible_values)
          ? parameter.possible_values
          : [];

        return (
          <Select
            value={String(value || parameter.default_value)}
            onValueChange={(val) => {
              // Try to parse as number if possible
              const numVal = parseFloat(val);
              onChange(isNaN(numVal) ? val : numVal);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={parameter.placeholder || "Seleziona..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={String(option)} value={String(option)}>
                  {String(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value !== undefined ? value : parameter.default_value}
              onCheckedChange={onChange}
            />
            <span className="text-sm text-muted-foreground">
              {value ? "Sì" : "No"}
            </span>
          </div>
        );

      case "text":
        return (
          <Textarea
            value={value || parameter.default_value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={parameter.placeholder}
            rows={3}
          />
        );

      case "multiselect":
        // TODO: Implement multiselect with Checkbox group
        return <div className="text-sm text-muted-foreground">Multiselect non implementato</div>;

      default:
        return <Input value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={parameter.parameter_key} className="text-sm font-medium">
          {parameter.parameter_name}
          {parameter.is_required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {parameter.help_text && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{parameter.help_text}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {renderInput()}
    </div>
  );
}

