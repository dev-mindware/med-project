"use client";

import { useState } from "react";
import { Icon } from "@/components/common";
import { GlobalModal } from "@/components";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { useModal } from "@/stores/modal/use-modal-store";
import { useAuth } from "@/hooks/auth";
import { helpCardsData } from "@/data";
import type { HelpCardItem } from "@/data/help";

const MODAL_ID = "help-card-detail";

interface HelpCardsProps {
  searchQuery?: string;
}

export function HelpCards({ searchQuery = "" }: HelpCardsProps) {
  const { user } = useAuth();
  const role = user?.role || "OPERATOR";
  const query = searchQuery.toLowerCase();
  const { openModal } = useModal();
  const [selectedCard, setSelectedCard] = useState<HelpCardItem | null>(null);

  const roleText =
    role === "ADMIN" ? "Administrador" : role === "SUPERVISOR" ? "Supervisor" : "Operador";

  const filteredCards = helpCardsData.filter(
    (card) =>
      card.searchKeywords.includes(query) ||
      card.title.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query)
  );

  if (query && filteredCards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum guia encontrado para a sua pesquisa.
      </div>
    );
  }

  return (
    <>
      {/* Modal único fora do loop */}
      <GlobalModal
        id={MODAL_ID}
        title={selectedCard?.dialogTitle}
        description={selectedCard?.dialogDescription}
        canClose
      >
        {selectedCard && (
          <div className="mt-4 space-y-4 text-sm text-foreground/80 leading-relaxed">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon name={selectedCard.icon} className="h-5 w-5 text-primary" />
              </div>
            </div>
            {selectedCard.dialogBody}
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Icon name={selectedCard.roleIcon} className="h-4 w-4" />
                {selectedCard.id === "conta"
                  ? `Responsabilidades do perfil ${roleText}:`
                  : selectedCard.id === "comunicacao"
                  ? `Como o perfil ${roleText} interage:`
                  : selectedCard.id === "linguistica"
                  ? `Fluxos para ${roleText}:`
                  : selectedCard.id === "relatorios"
                  ? `Visibilidade para ${roleText}:`
                  : selectedCard.id === "primeiros-passos"
                  ? `Guia específico para o seu perfil (${roleText}):`
                  : `Permissões para o perfil de ${roleText}:`}
              </h4>
              {selectedCard.roleContent[role as keyof typeof selectedCard.roleContent]}
            </div>
          </div>
        )}
      </GlobalModal>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCards.map((card) => (
          <Card
            key={card.id}
            className="rounded-lg border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon name={card.icon} className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{card.title}</CardTitle>
              <CardDescription className="text-base mt-2 line-clamp-3">
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto font-semibold"
                onClick={() => {
                  setSelectedCard(card);
                  openModal(MODAL_ID);
                }}
              >
                Saber mais
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
