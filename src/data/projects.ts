export type Project = {
  slug: string;
  code: string;
  title: string;
  category: string;
  sector: string;
  status: "Delivered" | "In development" | "Ongoing";
  signal: string;
  summary: string;
  problem: string;
  approach: string;
  architecture: string[];
  value: string;
};

export const projects: Project[] = [
  {
    slug: "aml-risk-analytics",
    code: "SDS-01",
    title: "AML Risk Analytics",
    category: "Financial compliance",
    sector: "Financial services",
    status: "Delivered",
    signal: "40% fewer false-positive alerts",
    summary:
      "A transaction-monitoring and anomaly-detection system built for auditability, faster review, and clearer regulatory reporting.",
    problem:
      "A financial institution needed to detect suspicious transactions and meet regulatory reporting obligations. Manual review and basic rule-based alerts created noise while missing complex patterns.",
    approach:
      "SDS designed a risk-scoring system that combines statistical anomaly detection with configurable rules, reviewer workflows, and an auditable reporting layer.",
    architecture: [
      "Real-time transaction ingestion",
      "Statistical anomaly detection",
      "Configurable risk-scoring engine",
      "Compliance dashboard and audit trail",
    ],
    value:
      "False-positive alerts fell by 40%, regulatory reporting moved from days to a repeatable workflow, and examiners gained a complete decision trail.",
  },
  {
    slug: "civilbot",
    code: "SDS-02",
    title: "CivilBot",
    category: "Applied AI",
    sector: "Legal / public interest",
    status: "In development",
    signal: "Legal information, made legible",
    summary:
      "A public-interest AI assistant that turns scattered civic information into clear, contextual guidance through natural language.",
    problem:
      "Citizens struggle to navigate civic and legal processes because useful information is scattered, procedural, and written for specialists.",
    approach:
      "CivilBot pairs a curated legal knowledge base with retrieval-augmented generation, contextual conversation, and explicit feedback loops for safer iteration.",
    architecture: [
      "Retrieval-augmented generation",
      "Curated legal knowledge base",
      "Context-aware conversation",
      "Human feedback and evaluation loop",
    ],
    value:
      "The system is designed to reduce information asymmetry by giving citizens a clearer starting point before professional legal support is required.",
  },
  {
    slug: "medimesh",
    code: "SDS-03",
    title: "MediMesh",
    category: "Healthcare systems",
    sector: "Distributed clinics",
    status: "In development",
    signal: "FHIR-aligned by design",
    summary:
      "A distributed health-data layer connecting clinics without flattening the governance, privacy, and operational realities between them.",
    problem:
      "Clinics in distributed health systems operate in silos. Patient data stays locked at facility level, limiting care coordination, referrals, and system-wide reporting.",
    approach:
      "MediMesh creates facility-level nodes with a shared analytics layer, standardised data contracts, and role-based access that respects local control.",
    architecture: [
      "Distributed facility-level nodes",
      "HL7 FHIR-aligned data models",
      "Cross-facility analytics layer",
      "Role-based access and audit logging",
    ],
    value:
      "The platform is being built to improve referral visibility, care coordination, and system-level decision support while preserving patient privacy.",
  },
  {
    slug: "telecom-churn",
    code: "SDS-04",
    title: "Telecom Churn Analytics",
    category: "Decision analytics",
    sector: "Telecommunications",
    status: "Delivered",
    signal: "From prediction to intervention",
    summary:
      "A churn intelligence system that connects subscriber behaviour, network quality, and retention action—not just another probability score.",
    problem:
      "A telecom operator was losing subscribers without a reliable view of churn drivers. Retention spend was broad, reactive, and disconnected from service quality.",
    approach:
      "SDS combined usage, CRM, and network signals to identify at-risk segments, explain the drivers behind risk, and guide targeted retention decisions.",
    architecture: [
      "CDR and CRM data integration",
      "Churn prediction models",
      "Customer segmentation analysis",
      "Retention recommendation layer",
    ],
    value:
      "The operator gained an actionable view of churn drivers and could intervene with the right customer groups before departure.",
  },
  {
    slug: "sector-intelligence",
    code: "SDS-05",
    title: "Sector Intelligence Products",
    category: "Research & advisory",
    sector: "East African markets",
    status: "Ongoing",
    signal: "Research structured for action",
    summary:
      "Decision-oriented research products combining local datasets, primary inquiry, and market context for institutions operating in East Africa.",
    problem:
      "Decision-makers often rely on sector reports that are outdated, generic, or detached from the operational realities of East African markets.",
    approach:
      "SDS combines quantitative analysis, expert interviews, and institutional context, then structures the output around the decision a reader needs to make.",
    architecture: [
      "Primary and secondary research",
      "Local quantitative datasets",
      "Expert qualitative validation",
      "Decision-oriented report frameworks",
    ],
    value:
      "Investors, NGOs, and public institutions use the resulting intelligence to shape market entry, programme design, and policy decisions.",
  },
];
