#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BACKEND = path.resolve(ROOT, '../petoriashop-nestjs/apps/petoria-api/src/libs');

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function read(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Extract values from a TypeScript enum by name.
 * Handles both `FOO = 'FOO'` and `FOO = "FOO"` styles.
 */
function extractEnum(src, enumName) {
  const match = src.match(new RegExp(`enum\\s+${enumName}\\s*\\{([^}]+)\\}`));
  if (!match) return null;
  return match[1]
    .split('\n')
    .map((l) => l.replace(/\/\/.*/, '').trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(\w+)\s*=/);
      return m ? m[1] : null;
    })
    .filter(Boolean);
}

/**
 * Extract values from a JS/TS array literal assigned to `name`.
 * Works for both `const name = [...]` and `export const name = [...]`.
 */
function extractArray(src, varName) {
  const match = src.match(new RegExp(`(?:export\\s+)?const\\s+${varName}\\s*=\\s*\\[([^\\]]+)\\]`));
  if (!match) return null;
  return match[1]
    .split(/[\n,]/)
    .map((v) => v.replace(/\/\/.*/, '').replace(/['"`]/g, '').trim())
    .filter(Boolean);
}

function compare(label, backendVals, frontendVals) {
  if (!backendVals)  { console.log(`⚠️  ${label} — backend file not found or enum missing`); return; }
  if (!frontendVals) { console.log(`⚠️  ${label} — frontend file not found or enum missing`); return; }

  const bSet = new Set(backendVals);
  const fSet = new Set(frontendVals);
  const inSync = backendVals.every((v) => fSet.has(v)) && frontendVals.every((v) => bSet.has(v));

  if (inSync) {
    console.log(`✅  ${label} — IN SYNC  [${backendVals.join(', ')}]`);
  } else {
    console.log(`❌  ${label} — MISMATCH`);
    console.log(`    Backend:  ${backendVals.join(', ')}`);
    console.log(`    Frontend: ${frontendVals.join(', ')}`);
    const onlyBack = backendVals.filter((v) => !fSet.has(v));
    const onlyFront = frontendVals.filter((v) => !bSet.has(v));
    if (onlyBack.length)  console.log(`    Only in backend:  ${onlyBack.join(', ')}`);
    if (onlyFront.length) console.log(`    Only in frontend: ${onlyFront.join(', ')}`);
  }
}

/* ─── load files ──────────────────────────────────────────────────────────── */

const bProductSrc  = read(path.join(BACKEND, 'enums/product.enum.ts'));
const bMemberSrc   = read(path.join(BACKEND, 'enums/member.enum.ts'));
const bConfigSrc   = read(path.join(BACKEND, 'config.ts'));

const fProductSrc  = read(path.join(ROOT, 'libs/enums/product.enum.ts'));
const fMemberSrc   = read(path.join(ROOT, 'libs/enums/member.enum.ts'));
const fFilterSrc   = read(path.join(ROOT, 'libs/components/product/ShopFilter.tsx'));

/* ─── run comparisons ────────────────────────────────────────────────────── */

console.log('\n══════════════════════════════════════════');
console.log('  Petoria — Backend ↔ Frontend Enum Sync');
console.log('══════════════════════════════════════════\n');

compare('ProductType',     extractEnum(bProductSrc, 'ProductType'),     extractEnum(fProductSrc, 'ProductType'));
compare('ProductStatus',   extractEnum(bProductSrc, 'ProductStatus'),   extractEnum(fProductSrc, 'ProductStatus'));
compare('ProductCategory', extractEnum(bProductSrc, 'ProductCategory'), extractEnum(fProductSrc, 'ProductCategory'));
compare('MemberType',      extractEnum(bMemberSrc,  'MemberType'),      extractEnum(fMemberSrc,  'MemberType'));
compare('MemberStatus',    extractEnum(bMemberSrc,  'MemberStatus'),    extractEnum(fMemberSrc,  'MemberStatus'));
compare('availableBrands', extractArray(bConfigSrc, 'availableBrands'), extractArray(fFilterSrc, 'BRANDS'));

console.log('\n══════════════════════════════════════════\n');
