"use client";
import { useModal, currentUserStore } from "@/stores";
import { Icon, Button, DetailRow, GlobalModal } from "@/components";
import { ItemStatusBadge } from "@/components/common/badges/item-status-badge";
import { formatDateTime } from "@/utils/format-date";

export function DetailsUserModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["DETAILS_MODAL"];
  const { currentUser } = currentUserStore();

  if (!currentUser || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="DETAILS_MODAL"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="User" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1 mt-4">
            <h2 className="text-2xl font-bold">{currentUser.name}</h2>
            <ItemStatusBadge status={currentUser.isActive ? "ACTIVE" : "INACTIVE"} />
          </div>
        </>
      }
      className="w-full max-w-4xl"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={() => closeModal("DETAILS_MODAL")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground border-b pb-2">Informações do Utilizador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailRow label="Nome" value={currentUser.name} />
            <DetailRow label="Email" value={currentUser.email} />
            <DetailRow label="Função" value={currentUser.role || "—"} />
            <DetailRow label="Estado" value={currentUser.isActive ? "Activo" : "Inactivo"} />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold text-foreground border-b pb-2">Âmbito de Supervisão (Letras Iniciais)</h3>
          {currentUser.assignedLetters && currentUser.assignedLetters.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentUser.assignedLetters.map((letter: string) => (
                <span
                  key={letter}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold bg-primary/15 text-primary border border-primary/25 shadow-sm"
                  title={`Letra ${letter}`}
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              Acesso total / Não restringido a letras específicas (A a Z).
            </p>
          )}
        </section>

        {(currentUser.createdAt || currentUser.updatedAt) && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Informações Técnicas
            </h3>
            {currentUser.createdAt && (
              <DetailRow
                label="Criado em"
                value={formatDateTime(currentUser.createdAt as string)}
              />
            )}
            {currentUser.updatedAt && (
              <DetailRow
                label="Actualizado em"
                value={formatDateTime(currentUser.updatedAt as string)}
              />
            )}
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
