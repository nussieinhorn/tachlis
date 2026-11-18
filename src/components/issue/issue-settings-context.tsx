"use client";

import { createContext, useContext, type ReactNode } from "react";

type IssueSettings = {
  voteRequiresLogin: boolean;
  votingClosed: boolean;
  allowSuggestSolutions: boolean;
};

const IssueSettingsContext = createContext<IssueSettings>({
  voteRequiresLogin: false,
  votingClosed: false,
  allowSuggestSolutions: true,
});

/** Hands the issue's own rules (login for votes, voting closed, suggestions allowed) to every solution card without threading props. */
export function IssueSettingsProvider({ value, children }: { value: IssueSettings; children: ReactNode }) {
  return <IssueSettingsContext.Provider value={value}>{children}</IssueSettingsContext.Provider>;
}

export function useIssueSettings(): IssueSettings {
  return useContext(IssueSettingsContext);
}
