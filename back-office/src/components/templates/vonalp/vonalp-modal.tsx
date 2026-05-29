"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, GlobalModal, Icon } from "@/components";
import { Input, Textarea } from "@/components/ui";
import { useUpdateVonalpTerm } from "@/hooks";
import { useModal } from "@/stores";
import { UpdateVonalpPayload, VonalpFieldKey, VonalpTermResponse } from "@/types";

const fieldLabels: Record<VonalpFieldKey, string> = {
  term: "Termo",
  pronunciation: "Pronúncia",
  grammaticalCategory: "Categoria gramatical",
  grammaticalSubcategory: "Subcategoria gramatical",
  syllabicDivision: "Divisão silábica",
  etymology: "Etimologia",
  firstDefinition: "Definição 1",
  secondDefinition: "Definição 2",
  origin: "Origem",
};

const longFields = new Set<VonalpFieldKey>(["etymology", "firstDefinition", "secondDefinition"]);

function vocabularyLabel(type?: string) {
  return type === "VONALP_EP" ? "VONALP-EP" : "VONALP";
}

export function VonalpModal() {
  const { closeModal, modalData, open } = useModal();
  const term = modalData["VONALP_MODAL"] as VonalpTermResponse | undefined;
  const isOpen = open["VONALP_MODAL"];
  const updateTerm = useUpdateVonalpTerm();
  const [values, setValues] = useState<Partial<Record<VonalpFieldKey, string>>>({});

  const missingFields = useMemo(() => term?.missingFields || [], [term?.missingFields]);

  useEffect(() => {
    if (!term || !isOpen) return;

    setValues(
      Object.fromEntries(
        missingFields.map((field) => [field, String(term[field] || "")]),
      ) as Partial<Record<VonalpFieldKey, string>>,
    );
  }, [term, missingFields, isOpen]);

  if (!term || !isOpen) return null;

  const hasEmptyRequired = missingFields.some((field) => !values[field]?.trim());
  const canSaveIncomplete = term.canSaveIncomplete;
  const isPending = updateTerm.isPending;

  const handleChange = (field: VonalpFieldKey, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async (saveIncomplete: boolean) => {
    const payload: UpdateVonalpPayload = {
      ...values,
      saveIncomplete,
    };

    const updated = await updateTerm.mutateAsync({ id: term.id, data: payload });

    if (!updated.requiresModal || saveIncomplete) {
      closeModal("VONALP_MODAL");
    }
  };

  return (
    <GlobalModal
      canClose
      id="VONALP_MODAL"
      className="w-full max-w-2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
            <Icon name="BookOpenCheck" className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Modal Vonalp</h2>
            <p className="text-sm text-muted-foreground">
              Complete os campos obrigatórios para {vocabularyLabel(term.vocabularyType)}.
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => closeModal("VONALP_MODAL")} disabled={isPending}>
            Cancelar
          </Button>
          {canSaveIncomplete && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => submit(true)}
              disabled={isPending}
            >
              Guardar incompleto
            </Button>
          )}
          <Button
            type="button"
            onClick={() => submit(false)}
            disabled={isPending || hasEmptyRequired}
          >
            Completar e guardar
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-semibold">{term.term}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {missingFields.length} campo{missingFields.length === 1 ? "" : "s"} obrigatório{missingFields.length === 1 ? "" : "s"} em falta.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {missingFields.map((field) => {
            const value = values[field] || "";
            const label = `${fieldLabels[field]} *`;

            if (longFields.has(field)) {
              return (
                <div key={field} className="md:col-span-2">
                  <Textarea
                    label={label}
                    value={value}
                    rows={4}
                    onChange={(event) => handleChange(field, event.target.value)}
                    placeholder={`Informe ${fieldLabels[field].toLowerCase()}`}
                    disabled={isPending}
                  />
                </div>
              );
            }

            return (
              <Input
                key={field}
                label={label}
                value={value}
                onChange={(event) => handleChange(field, event.target.value)}
                placeholder={`Informe ${fieldLabels[field].toLowerCase()}`}
                disabled={isPending}
              />
            );
          })}
        </div>

        {!canSaveIncomplete && (
          <p className="rounded-md border border-primary/20 bg-primary/10 p-3 text-sm text-muted-foreground">
            Operadores precisam preencher todos os campos obrigatórios antes de concluir a marcação.
          </p>
        )}
      </div>
    </GlobalModal>
  );
}
