export interface AlertScenario {
  id: string;
  title: string;
  location: string;
  summary: string;
  targetLabel?: string;
  collateralContext?: string;
  preferredNegotiation?: 'INTIMIDATE' | 'PERSUADE' | 'REASON';
  negotiation: {
    intimidate: string;
    persuade: string;
    reason: string;
  };
  outcomes: {
    detonate: string;
    intercept: string;
    negotiateSuccess: string;
    negotiateFail: string;
    ignore: string;
  };
  propaganda: {
    headline: string;
    body: string;
  };
}
