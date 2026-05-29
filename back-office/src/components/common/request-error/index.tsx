import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  refetch: () => void;
  message?: string;
};

export function RequestError({ refetch, message }: Props) {
  return (
    <Card className="p-8 mt-4 border-destructive/20 bg-destructive/5">
      <CardContent className="space-y-6 flex flex-col items-center justify-center pt-6">
        <div className="p-4 bg-destructive/10 rounded-full">
          <Icon name="CircleAlert" className="h-12 w-12 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Erro de Carregamento
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {message || "Ocorreu um erro ao carregar os dados do servidor. Por favor, verifique sua conexão ou tente novamente."}
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => refetch()}
        >
          <Icon name="RefreshCcw" size={16} />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}
