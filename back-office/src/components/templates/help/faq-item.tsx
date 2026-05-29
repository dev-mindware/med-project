"use client";

import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui";
import { Icon } from "@/components/common";
import { cn } from "@/lib/utils";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpenByDefault?: boolean;
}

export function FAQItem({ question, answer, isOpenByDefault = false }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-border/50 py-4 last:border-0">
      <CollapsibleTrigger className="flex w-full items-center justify-between text-left group">
        <span className="font-semibold text-foreground/90 group-hover:text-foreground transition-colors">{question}</span>
        <div className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
          isOpen ? "bg-primary border-primary text-primary-foreground" : "bg-transparent text-muted-foreground border-muted-foreground/30 group-hover:border-muted-foreground/50"
        )}>
          {isOpen ? <Icon name="Minus" className="h-3.5 w-3.5" /> : <Icon name="Plus" className="h-3.5 w-3.5" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {answer}
      </CollapsibleContent>
    </Collapsible>
  );
}
