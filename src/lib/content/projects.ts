import type { Project } from "./schema";

/**
 * The home grid shows all three, so every card is marked `featured`.
 *
 * `status` is load-bearing. It drives the badge and which links render:
 *   live -> "Live",           a live URL is required by the schema
 *   repo -> "Source only",    finished and readable, but never deployed
 *   wip  -> "In development", no links
 */
export const projects: Project[] = [
  {
    slug: "securx",
    title: "SecuRx",
    status: "live",
    hook: "A digital prescription system built to replace paper scripts, so forged prescriptions stop circulating and the outpatient workflow stops depending on handwritten notes.",
    summary:
      "SecuRx is a secure digital prescription platform for outpatient care. It replaces the paper prescription with a tracked, auditable record, and pairs it with a clinical documentation engine that turns a patient consultation into structured notes instead of manual typing. I led this as my capstone project, owning both the system architecture and the delivery of the full software development lifecycle, from initial planning through documentation and testing.",
    stack: ["Laravel", "PHP", "MySQL", "JavaScript", "Azure AI Services"],
    screenshot: {
      src: "/projects/securx.png",
      alt: "The SecuRx prescription dashboard, showing the queue of patient consultations awaiting a signed digital prescription.",
    },
    links: [{ label: "Live Demo", href: "https://securx.on-forge.com/" }],
    featured: true,
    order: 0,
    problem:
      "Outpatient prescriptions were handwritten, which made them easy to forge and impossible to track after the patient left the clinic. The same workflow also pushed clinical notes back to manual typing, so clinicians spent consultation time retyping what they had just said.",
    role: "Project Manager and System Architect. I ran the full software development lifecycle: architectural planning, system documentation, and testing.",
    architecture:
      "A Laravel and MySQL application fronted by a clinical documentation engine. Consultations feed an AI Transcriber and an AI-assisted SOAP Notes Generator built on Azure AI Services, which produce structured notes for clinician review before anything is signed. Nothing is issued until that review happens.",
    decisions: [
      {
        heading: "Draft notes, never auto-signed",
        body: "The AI layer produces a draft that a clinician reviews and signs. An assistive model that could issue a prescription unattended would move the forgery problem rather than solve it, so the human stays in the loop on every record.",
      },
      {
        heading: "PHP and MySQL over a heavier stack",
        body: "The domain is document and record handling, not high-throughput compute. Laravel and MySQL kept the deployment simple enough to run as a capstone while still giving structured clinical data somewhere reliable to live.",
      },
    ],
    lessons:
      "The clinical workflow deserved more attention than the interface. Early on I underweighted what staff actually do between a consultation and a signature, and the model was much easier to design once I had watched that sequence end to end.",
  },
  {
    slug: "ryb-vehicle-trading",
    title: "RYB Vehicle Trading",
    status: "repo",
    hook: "A vehicle trading marketplace where listings can be browsed, filtered, and enquired about in real time, backed by an admin CMS for the inventory.",
    summary:
      "RYB is a full-stack e-commerce platform for a vehicle dealership. Visitors browse and filter live listings and send enquiries without leaving the page, while staff manage specifications, pricing, and image galleries through a backend content management system. I built the front end, the CMS, and the query layer behind the filtering as a full-stack developer.",
    stack: ["Laravel", "MySQL", "JavaScript", "Tailwind CSS"],
    screenshot: {
      src: "/projects/ryb-vehicle-trading.png",
      alt: "The RYB vehicle listing grid, showing filtered search results with vehicle photographs, specifications, and prices.",
    },
    links: [{ label: "Source", href: "https://github.com/ralphfdg/ryb-site" }],
    featured: true,
    order: 1,
    problem:
      "A dealership inventory lives in spreadsheets and ad posts, so searching by make, price, or category means asking someone. Buyers wanted to narrow the catalogue themselves, and staff wanted one place to edit it.",
    role: "Full-Stack Developer. I built the storefront, the admin CMS, and the filtering and search behaviour.",
    architecture:
      "A Laravel application with MySQL handling vehicle categories, specifications, pricing, image galleries, and user enquiries. Filtering and search run in JavaScript against the listing data, and the schema carries the relationships between categories and vehicles so a broad query stays fast as inventory grows.",
    decisions: [
      {
        heading: "A CMS rather than hand-edited records",
        body: "Specifications, pricing, and photo galleries all change often and by non-technical staff. A CMS meant the catalogue could stay current without a deploy, which is the difference between a site that is accurate and one that quietly goes stale.",
      },
      {
        heading: "Normalised categories with explicit migrations",
        body: "Vehicles, categories, and enquiries are related tables with managed migrations, so adding a category does not require reshaping every vehicle record and enquiries stay attributable as the catalogue grows.",
      },
    ],
    lessons:
      "Responsive behaviour is cheapest to get right before the markup exists, not after. Rebuilding image galleries for smaller breakpoints cost more time than writing the grid flexibly the first time.",
  },
  {
    slug: "modern-homes",
    title: "Modern Homes",
    status: "wip",
    hook: "A rental and property management system for a Pampanga business, covering reservations, automated billing, PDF contracts, and room or commercial availability.",
    summary:
      "Modern Homes is a property management system for a business renting long-term and short-term accommodation. It handles reservations with double-booking prevention, room assignments and tenant profiles, maintenance tracking, and the financial side: digital invoices and contracts generated as PDFs. I designed the cloud architecture it runs on, which is the part currently complete.",
    stack: [
      "AWS",
      "EC2",
      "RDS PostgreSQL",
      "S3",
      "VPC",
      "IAM",
    ],
    screenshot: {
      src: "/projects/modern-homes.png",
      alt: "The Modern Homes three-tier AWS architecture, showing public, private application, and private database subnets with their standby targets.",
    },
    links: [],
    featured: true,
    order: 2,
    problem:
      "A rental business juggling rooms and commercial units runs on spreadsheets and manual invoices. Availability is not trustworthy across channels, double bookings are possible, and every contract is drafted by hand.",
    role: "Infrastructure and systems designer. The architecture and its cost model are designed; the application itself is still being built.",
    architecture:
      "A three-tier VPC in ap-southeast-1, split so that no tier can reach another directly. Public subnets hold the web server and its standby, private application subnets hold the app and worker server, and private database subnets hold a Multi-AZ PostgreSQL primary and its replica. Traffic enters over HTTPS, the app tier reaches the database only on 5432, and S3 fetches happen through a VPC endpoint rather than the public internet.",
    decisions: [
      {
        heading: "Tiered subnets with a standby in each",
        body: "Every tier has a standby target, so a single instance failure does not take a capability offline. Segmenting by tier means a compromised web server has no route to the database, which is the failure that actually matters.",
      },
      {
        heading: "Graviton2 instances for a mixed workload",
        body: "EC2 t4g instances deliver roughly 20% better performance at 20% lower cost than comparable x86, which suits a web and worker tier that runs steadily rather than spiking. A dedicated worker instance was kept for the 24/7 scheduled jobs.",
      },
      {
        heading: "S3 Standard for live files, Glacier for the archive",
        body: "Contracts and invoices are written to S3 Standard and aged into Glacier after a year, since most files are read once. Storage is the cheapest line in the model and the one most likely to be wasted by keeping everything hot.",
      },
    ],
    lessons:
      "Modelling the monthly bill up front changed the design. The baseline lands at about $187 a month, and a one or three year Compute Savings Plan would cut the EC2 and RDS baseline by 30-35%, so the architecture is deliberately shaped to make that commitment easy to take later.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects
    .filter((project) => project.featured)
    .sort((a, b) => a.order - b.order);
}
