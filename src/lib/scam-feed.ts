import { v4 as uuidv4 } from "uuid";

export interface ScamReport {
  id: string;
  category: string;
  platform: string;
  description: string;
  reportedAt: string;
  upvotes: number;
}

export interface ScamAlert {
  id: string;
  title: string;
  description: string;
  category: string;
  reportCount: number;
  createdAt: string;
}

const reports: ScamReport[] = [
  {
    id: uuidv4(),
    category: "Gaming",
    platform: "Facebook Marketplace",
    description:
      "Same PS5 photo used across 3 different listings in different cities. Seller asked for Zelle payment only.",
    reportedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    upvotes: 24,
  },
  {
    id: uuidv4(),
    category: "Electronics",
    platform: "OfferUp",
    description:
      "Stock photo of AirPods Pro being used as a real listing. Image traced back to Apple's website.",
    reportedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    upvotes: 18,
  },
  {
    id: uuidv4(),
    category: "Tickets",
    platform: "Reddit",
    description:
      "Concert ticket with duplicate barcode reported by 4 different buyers in the same city.",
    reportedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    upvotes: 42,
  },
  {
    id: uuidv4(),
    category: "Electronics",
    platform: "Facebook Marketplace",
    description:
      "iPhone 15 Pro listing using photos pulled directly from an Amazon product page.",
    reportedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    upvotes: 31,
  },
  {
    id: uuidv4(),
    category: "Designer Goods",
    platform: "OfferUp",
    description:
      "Designer bag listing using photos stolen from a Poshmark seller. Same background and angle.",
    reportedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    upvotes: 15,
  },
  {
    id: uuidv4(),
    category: "Tickets",
    platform: "Facebook Marketplace",
    description:
      "Taylor Swift tickets -- same screenshot being sold in 8 different cities. Identical barcode visible.",
    reportedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    upvotes: 87,
  },
];

const alerts: ScamAlert[] = [
  {
    id: uuidv4(),
    title: "Fake concert ticket listings surging",
    description:
      "Reports of fake concert tickets have increased 300% ahead of summer tour season. Always verify before buying.",
    category: "Tickets",
    reportCount: 156,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "Crypto payment scam pattern",
    description:
      "New scam pattern: sellers requesting payment via cryptocurrency for electronics. Legitimate sellers accept standard payment methods.",
    category: "Electronics",
    reportCount: 89,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "Duplicate GPU listings on Reddit",
    description:
      "Duplicate GPU listings spreading across Reddit hardware swap communities. Same photos appearing in multiple posts.",
    category: "Electronics",
    reportCount: 67,
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
];

export function getRecentReports(limit: number = 20): ScamReport[] {
  return [...reports]
    .sort(
      (a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )
    .slice(0, limit);
}

export function getAlerts(): ScamAlert[] {
  return [...alerts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addReport(report: {
  category: string;
  platform: string;
  description: string;
}): ScamReport {
  const newReport: ScamReport = {
    id: uuidv4(),
    ...report,
    reportedAt: new Date().toISOString(),
    upvotes: 0,
  };
  reports.unshift(newReport);
  return newReport;
}

export function upvoteReport(id: string): boolean {
  const report = reports.find((r) => r.id === id);
  if (!report) return false;
  report.upvotes += 1;
  return true;
}
