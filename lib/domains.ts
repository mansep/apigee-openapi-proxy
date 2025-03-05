// Define types for domains and subdomains
export interface Domain {
  name: string
  code: string
  subdomains: Subdomain[]
}

export interface Subdomain {
  name: string
  code: string
  domainCode: string
}

// Define the domains and subdomains from the provided data
export const domains: Domain[] = [
  {
    name: "Personas",
    code: "per",
    subdomains: [
      { name: "Generico (Abarca todos los subdominio)", code: "per-gen", domainCode: "per" },
      { name: "Persona Natural", code: "per-nat", domainCode: "per" },
      { name: "Persona Jurídica", code: "per-jur", domainCode: "per" },
    ],
  },
  {
    name: "Trabajadores Caja",
    code: "trc",
    subdomains: [{ name: "Persona Trabajador Caja", code: "trc-ptc", domainCode: "trc" }],
  },
  {
    name: "Productos Financieros",
    code: "prf",
    subdomains: [
      { name: "Seguros", code: "prf-seg", domainCode: "prf" },
      { name: "Ahorros", code: "prf-aho", domainCode: "prf" },
      { name: "Créditos", code: "prf-cre", domainCode: "prf" },
      { name: "Generico (Abarca todos los subdominio)", code: "prf-gen", domainCode: "prf" },
    ],
  },
  {
    name: "Regímenes Legales",
    code: "rgl",
    subdomains: [
      { name: "Sistema Integral de Licencias Médicas", code: "rgl-silm", domainCode: "rgl" },
      { name: "Asignación Familiar", code: "rgl-asf", domainCode: "rgl" },
      { name: "Subsidios Cesantía", code: "rgl-subc", domainCode: "rgl" },
      { name: "Permiso Post-Natal", code: "rgl-ppn", domainCode: "rgl" },
      { name: "Aporte Familiar Permanente", code: "rgl-afp", domainCode: "rgl" },
      { name: "Generico (Abarca todos los subdominio)", code: "rgl-gen", domainCode: "rgl" },
    ],
  },
  {
    name: "Beneficios",
    code: "ben",
    subdomains: [
      { name: "Salud", code: "ben-sal", domainCode: "ben" },
      { name: "Educación", code: "ben-edu", domainCode: "ben" },
      { name: "Recreación", code: "ben-rec", domainCode: "ben" },
      { name: "Pro Empleo", code: "ben-pro", domainCode: "ben" },
      { name: "Participación Social", code: "ben-pars", domainCode: "ben" },
      { name: "Protección", code: "ben-prt", domainCode: "ben" },
      { name: "Hogar", code: "ben-hog", domainCode: "ben" },
      { name: "Apoyo Social", code: "ben-aps", domainCode: "ben" },
      { name: "Asignación en Dinero", code: "ben-asd", domainCode: "ben" },
      { name: "Prestaciones Complementarias", code: "ben-prec", domainCode: "ben" },
      { name: "Generico (Abarca todos los subdominio)", code: "ben-gen", domainCode: "ben" },
    ],
  },
  {
    name: "Nóminas",
    code: "nom",
    subdomains: [
      { name: "Ahorro", code: "nom-aho", domainCode: "nom" },
      { name: "Créditos", code: "nom-cre", domainCode: "nom" },
      { name: "Previsional", code: "nom-pre", domainCode: "nom" },
      { name: "Cotizaciones", code: "nom-cot", domainCode: "nom" },
      { name: "Generico (Abarca todos los subdominio)", code: "nom-gen", domainCode: "nom" },
    ],
  },
  {
    name: "Canales",
    code: "can",
    subdomains: [
      { name: "Sucursales", code: "can-suc", domainCode: "can" },
      { name: "Canal de Atención Remota Asistido", code: "can-cara", domainCode: "can" },
      { name: "Canal de Atención Remota Autoasistido", code: "can-caraa", domainCode: "can" },
      { name: "Canales de Pago", code: "can-cap", domainCode: "can" },
      { name: "Generico (Abarca todos los subdominio)", code: "can-gen", domainCode: "can" },
    ],
  },
]

// Helper functions to work with domains and subdomains
export function getDomainByCode(code: string): Domain | undefined {
  return domains.find((domain) => domain.code === code)
}

export function getSubdomainsByDomainCode(domainCode: string): Subdomain[] {
  const domain = getDomainByCode(domainCode)
  return domain ? domain.subdomains : []
}

export function getSubdomainByCode(code: string): Subdomain | undefined {
  for (const domain of domains) {
    const subdomain = domain.subdomains.find((sub) => sub.code === code)
    if (subdomain) return subdomain
  }
  return undefined
}

