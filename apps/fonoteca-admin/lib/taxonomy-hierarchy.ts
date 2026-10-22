// Reglas de jerarquía Reino > Filo > Clase. Sin dependencias para poder usarse en
// formularios, acciones del servidor, scripts y pruebas.

/** Filos aceptados por reino. Un filo fuera de su reino es una relación inválida. */
export const PHYLA_BY_KINGDOM: Record<string, readonly string[]> = {
  Animalia: ["Chordata", "Arthropoda", "Mollusca", "Annelida", "Cnidaria", "Echinodermata", "Porifera"],
}

/** Filo esperado de las clases conocidas. Las clases no listadas no se bloquean. */
export const PHYLUM_BY_CLASS: Record<string, string> = {
  Aves: "Chordata",
  Mammalia: "Chordata",
  Amphibia: "Chordata",
  Reptilia: "Chordata",
  Actinopterygii: "Chordata",
  Chondrichthyes: "Chordata",
  Insecta: "Arthropoda",
  Arachnida: "Arthropoda",
  Malacostraca: "Arthropoda",
  Diplopoda: "Arthropoda",
  Chilopoda: "Arthropoda",
  Gastropoda: "Mollusca",
  Bivalvia: "Mollusca",
  Cephalopoda: "Mollusca",
  Clitellata: "Annelida",
  Anthozoa: "Cnidaria",
  Asteroidea: "Echinodermata",
}

const normalize = (value: string) => value.trim().toLowerCase()

export function expectedPhylumForClass(className: string | null | undefined): string | null {
  if (!className) return null
  const match = Object.keys(PHYLUM_BY_CLASS).find((name) => normalize(name) === normalize(className))
  return match ? PHYLUM_BY_CLASS[match] : null
}

export interface ClassHierarchyInput {
  kingdom?: string | null
  phylum?: string | null
  name?: string | null
}

/** Devuelve el motivo por el que la jerarquía es inválida, o null si es coherente. */
export function validateClassHierarchy({ kingdom, phylum, name }: ClassHierarchyInput): string | null {
  if (phylum && kingdom) {
    const allowed = PHYLA_BY_KINGDOM[kingdom]
    if (allowed && !allowed.some((p) => normalize(p) === normalize(phylum))) {
      return `El filo ${phylum} no pertenece al reino ${kingdom}.`
    }
  }

  const expected = expectedPhylumForClass(name)
  if (expected && normalize(phylum ?? "") !== normalize(expected)) {
    return `La clase ${name?.trim()} pertenece al filo ${expected}, no a ${phylum || "un filo vacío"}.`
  }

  return null
}
