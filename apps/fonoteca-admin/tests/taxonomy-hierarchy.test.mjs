import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PHYLA_BY_KINGDOM,
  PHYLUM_BY_CLASS,
  expectedPhylumForClass,
  validateClassHierarchy,
} from "../lib/taxonomy-hierarchy.ts";

test("Insecta no puede asociarse a Chordata", () => {
  const reason = validateClassHierarchy({ kingdom: "Animalia", phylum: "Chordata", name: "Insecta" });
  assert.match(reason, /Arthropoda/);
});

test("Insecta bajo Arthropoda es válida, sin importar mayúsculas ni espacios", () => {
  assert.equal(validateClassHierarchy({ kingdom: "Animalia", phylum: "Arthropoda", name: "Insecta" }), null);
  assert.equal(validateClassHierarchy({ kingdom: "Animalia", phylum: "arthropoda", name: " insecta " }), null);
});

test("una clase conocida sin filo se rechaza", () => {
  assert.ok(validateClassHierarchy({ kingdom: "Animalia", phylum: "", name: "Aves" }));
  assert.ok(validateClassHierarchy({ kingdom: "Animalia", phylum: null, name: "Aves" }));
});

test("las clases de vertebrados del catálogo van en Chordata", () => {
  for (const name of ["Aves", "Mammalia", "Amphibia", "Reptilia"]) {
    assert.equal(validateClassHierarchy({ kingdom: "Animalia", phylum: "Chordata", name }), null, name);
    assert.ok(validateClassHierarchy({ kingdom: "Animalia", phylum: "Arthropoda", name }), name);
  }
});

test("una clase desconocida no se bloquea mientras el filo pertenezca al reino", () => {
  assert.equal(validateClassHierarchy({ kingdom: "Animalia", phylum: "Mollusca", name: "ClaseNueva" }), null);
  assert.ok(validateClassHierarchy({ kingdom: "Animalia", phylum: "Tracheophyta", name: "ClaseNueva" }));
});

test("todo filo esperado por una clase pertenece al reino Animalia", () => {
  for (const [className, phylum] of Object.entries(PHYLUM_BY_CLASS)) {
    assert.ok(PHYLA_BY_KINGDOM.Animalia.includes(phylum), `${className} -> ${phylum}`);
    assert.equal(expectedPhylumForClass(className), phylum);
  }
});

test("los filos de la jerarquía coinciden con TAXON_PHYLUM del formulario", () => {
  const source = readFileSync(new URL("../types/fonoteca.ts", import.meta.url), "utf8");
  const block = source.match(/export const TAXON_PHYLUM = \{([\s\S]*?)\} as const/)[1];
  const formPhyla = [...block.matchAll(/:\s*'([^']+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual([...PHYLA_BY_KINGDOM.Animalia].sort(), formPhyla);
});
