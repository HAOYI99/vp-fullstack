import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type EntityNames = {
  route: string;
  fileBase: string;
  table: string;
  pluralCamel: string;
  singularCamel: string;
  singularPascal: string;
};

const root = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const help = args.includes("--help") || args.includes("-h");
const entityArg = args.find((arg) => !arg.startsWith("-"));

if (help || !entityArg) {
  console.log(`Usage: vp run -w entity:add <entity> [--dry-run]

Examples:
  vp run -w entity:add users
  vp run -w entity:add projects -- --dry-run

Use a plural, kebab-case entity name such as "users", "projects", or "billing-plans".`);
  process.exit(help ? 0 : 1);
}

const names = createNames(entityArg);

const files = new Map<string, string>([
  [
    `packages/shared/src/${names.fileBase}/index.ts`,
    `export * from "./${names.fileBase}.contracts";\n`,
  ],
  [
    `packages/shared/src/${names.fileBase}/${names.fileBase}.contracts.ts`,
    `import { z } from "zod";

export const ${names.singularCamel}Schema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
});

export const create${names.singularPascal}Schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
});

export const update${names.singularPascal}Schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
});

export type ${names.singularPascal} = z.infer<typeof ${names.singularCamel}Schema>;
export type Create${names.singularPascal}Input = z.infer<typeof create${names.singularPascal}Schema>;
export type Update${names.singularPascal}Input = z.infer<typeof update${names.singularPascal}Schema>;
`,
  ],
  [
    `packages/db/src/schema/${names.fileBase}.ts`,
    `import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const ${names.pluralCamel} = pgTable("${names.table}", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ${names.singularPascal} = typeof ${names.pluralCamel}.$inferSelect;
export type New${names.singularPascal} = typeof ${names.pluralCamel}.$inferInsert;
`,
  ],
  [
    `apps/api/src/modules/${names.fileBase}/${names.fileBase}.service.ts`,
    `import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { ${names.pluralCamel}, type Database } from "@template/db";
import type { Create${names.singularPascal}Input, ${names.singularPascal}, Update${names.singularPascal}Input } from "@template/shared";

export function create${names.singularPascal}Service(db: Database | null) {
  // In-memory fallback if no database is connected
  const inMemoryStore = new Map<string, ${names.singularPascal}>();

  return {
    async list(): Promise<${names.singularPascal}[]> {
      if (!db) {
        return Array.from(inMemoryStore.values()).sort((a, b) => b.createdAt - a.createdAt);
      }
      const records = await db.select().from(${names.pluralCamel}).orderBy(desc(${names.pluralCamel}.createdAt));
      return records.map((r) => ({
        id: r.id,
        name: r.name,
        createdAt: r.createdAt.getTime(),
      }));
    },

    async create(input: Create${names.singularPascal}Input): Promise<${names.singularPascal}> {
      const id = randomUUID();
      const createdAt = Date.now();

      if (!db) {
        const item: ${names.singularPascal} = { id, name: input.name, createdAt };
        inMemoryStore.set(id, item);
        return item;
      }

      const [record] = await db
        .insert(${names.pluralCamel})
        .values({
          id,
          name: input.name,
          createdAt: new Date(createdAt),
        })
        .returning();

      return {
        id: record.id,
        name: record.name,
        createdAt: record.createdAt.getTime(),
      };
    },

    async update(id: string, input: Update${names.singularPascal}Input): Promise<${names.singularPascal} | null> {
      if (!db) {
        const existing = inMemoryStore.get(id);
        if (!existing) return null;
        const updated: ${names.singularPascal} = { ...existing, name: input.name };
        inMemoryStore.set(id, updated);
        return updated;
      }

      const [record] = await db
        .update(${names.pluralCamel})
        .set({ name: input.name })
        .where(eq(${names.pluralCamel}.id, id))
        .returning();

      if (!record) return null;

      return {
        id: record.id,
        name: record.name,
        createdAt: record.createdAt.getTime(),
      };
    },
  };
}
`,
  ],
  [
    `apps/api/src/modules/${names.fileBase}/${names.fileBase}.routes.ts`,
    `import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Database } from "@template/db";
import { create${names.singularPascal}Schema, update${names.singularPascal}Schema } from "@template/shared";
import { create${names.singularPascal}Service } from "./${names.fileBase}.service";

type ${names.singularPascal}RoutesOptions = {
  db: Database | null;
};

export function create${names.singularPascal}Routes({ db }: ${names.singularPascal}RoutesOptions) {
  const ${names.singularCamel}Service = create${names.singularPascal}Service(db);

  return new Hono()
    .get("/", async (c) => {
      const ${names.pluralCamel} = await ${names.singularCamel}Service.list();
      return c.json(${names.pluralCamel});
    })
    .post("/", zValidator("json", create${names.singularPascal}Schema), async (c) => {
      const input = c.req.valid("json");
      const ${names.singularCamel} = await ${names.singularCamel}Service.create(input);
      return c.json(${names.singularCamel}, 201);
    })
    .patch("/:id", zValidator("json", update${names.singularPascal}Schema), async (c) => {
      const id = c.req.param("id");
      const input = c.req.valid("json");
      const ${names.singularCamel} = await ${names.singularCamel}Service.update(id, input);

      if (!${names.singularCamel}) {
        return c.json({ error: "${names.singularPascal} not found" }, 404);
      }

      return c.json(${names.singularCamel});
    });
}
`,
  ],
]);

await writeEntityFiles(files);
await updateBarrel("packages/shared/src/index.ts", `export * from "./${names.fileBase}/index";`);
await updateBarrel("packages/db/src/schema/index.ts", `export * from "./${names.fileBase}";`);
await updateAppRoutes(names);

console.log(`${dryRun ? "Would add" : "Added"} entity "${entityArg}".`);

async function writeEntityFiles(fileEntries: Map<string, string>) {
  for (const [relativePath, content] of fileEntries) {
    const absolutePath = path.join(root, relativePath);

    if (existsSync(absolutePath)) {
      throw new Error(`File already exists: ${relativePath}`);
    }

    if (dryRun) {
      console.log(`create ${relativePath}`);
      continue;
    }

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
  }
}

async function updateBarrel(relativePath: string, line: string) {
  const absolutePath = path.join(root, relativePath);
  const current = await readFile(absolutePath, "utf8");

  if (current.includes(line)) {
    return;
  }

  const next = `${current.trimEnd()}\n${line}\n`;

  if (dryRun) {
    console.log(`update ${relativePath}`);
    return;
  }

  await writeFile(absolutePath, next);
}

async function updateAppRoutes(entityNames: EntityNames) {
  const relativePath = "apps/api/src/app.ts";
  const absolutePath = path.join(root, relativePath);
  const current = await readFile(absolutePath, "utf8");
  const importLine = `import { create${entityNames.singularPascal}Routes } from "./modules/${entityNames.fileBase}/${entityNames.fileBase}.routes";`;
  const routeChain = `.route("/${entityNames.route}", create${entityNames.singularPascal}Routes({ db }))`;

  if (current.includes(importLine) || current.includes(routeChain)) {
    return;
  }

  const withImport = current.replace(
    /(import .+\.routes";\n)(?!import .+\.routes";)/,
    `$1${importLine}\n`,
  );
  const next = withImport.replace(
    /(const api = new Hono\(\)[\s\S]*?)(;\n\n  return app)/,
    `$1\n    ${routeChain}$2`,
  );

  if (next === current) {
    throw new Error(
      `Could not update ${relativePath}. Add this manually:\n${importLine}\n  ${routeChain}`,
    );
  }

  if (dryRun) {
    console.log(`update ${relativePath}`);
    return;
  }

  await writeFile(absolutePath, next);
}

function createNames(input: string): EntityNames {
  const route = toKebabCase(input);

  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(route)) {
    throw new Error(`Invalid entity name "${input}". Use plural kebab-case, e.g. "users".`);
  }

  const singular = singularize(route);

  return {
    route,
    fileBase: route,
    table: route.replaceAll("-", "_"),
    pluralCamel: toCamelCase(route),
    singularCamel: toCamelCase(singular),
    singularPascal: toPascalCase(singular),
  };
}

function toKebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

function toCamelCase(value: string) {
  return value.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

function toPascalCase(value: string) {
  const camel = toCamelCase(value);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function singularize(value: string) {
  if (value.endsWith("ies")) {
    return `${value.slice(0, -3)}y`;
  }
  if (value.endsWith("ses")) {
    return value.slice(0, -2);
  }
  if (value.endsWith("s")) {
    return value.slice(0, -1);
  }
  return value;
}
