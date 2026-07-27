import { AppShellPage } from "../layout/AppShellPage";
import { ClientsView } from "../features/clients/ClientsView";

export function ClientsPage() {
  return (
    <AppShellPage initialNavId="clients">
      <ClientsView />
    </AppShellPage>
  );
}
