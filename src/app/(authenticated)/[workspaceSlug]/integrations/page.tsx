export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Integrações</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Em breve você poderá conectar o AppSeed a outras ferramentas para sincronizar dados, automatizar processos
          e personalizar o seu fluxo de trabalho. Enquanto isso, fale com o nosso time caso precise de alguma integração
          específica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma integração disponível no momento
          </p>
          <p className="mt-2 text-xs text-muted-foreground/80">
            Estamos construindo a primeira leva de integrações com CRMs, automação de marketing e ferramentas de atendimento.
          </p>
        </div>
      </div>
    </div>
  );
}
