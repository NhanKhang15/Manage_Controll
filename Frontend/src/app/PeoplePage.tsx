import { AppShellPage } from "../layout/AppShellPage";
import { PeopleView } from "../features/people/PeopleView";

export function PeoplePage() {
  return (
    <AppShellPage initialNavId="people">
      <PeopleView />
    </AppShellPage>
  );
}
