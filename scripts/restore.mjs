/**
 * MongoDB Restore Script
 *
 * Recreates the entire database from a backup JSON file exported by the backup API.
 *
 * Usage:
 *   npm install mongodb    (if not already installed)
 *   node restore.mjs <backup-file.json>
 *
 * Environment:
 *   MONGODB_URI  - MongoDB connection string (required)
 *                  e.g. mongodb+srv://user:pass@cluster.mongodb.net/zamzam
 *
 * Options:
 *   --drop       - Drop existing collections before restoring (destructive!)
 *   --dry-run    - Preview what would happen without writing anything
 *
 * Examples:
 *   MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/zamzam" node restore.mjs zamzam-backup-2026-02-17.json
 *   MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/zamzam" node restore.mjs zamzam-backup-2026-02-17.json --drop
 */

import { MongoClient, ObjectId } from "mongodb";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Helpers ───────────────────────────────────────────────

/**
 * Convert MongoDB Extended JSON values back to native BSON types.
 * Handles: $oid, $date, $numberLong, $numberInt, $numberDouble, $numberDecimal
 */
function reviveExtendedJSON(doc) {
  if (doc === null || doc === undefined) return doc;

  if (Array.isArray(doc)) {
    return doc.map(reviveExtendedJSON);
  }

  if (typeof doc === "object") {
    // { "$oid": "..." } → ObjectId
    if ("$oid" in doc && typeof doc.$oid === "string") {
      return new ObjectId(doc.$oid);
    }
    // { "$date": "..." } → Date
    if ("$date" in doc) {
      const val = doc.$date;
      if (typeof val === "string") return new Date(val);
      if (typeof val === "object" && "$numberLong" in val)
        return new Date(parseInt(val.$numberLong, 10));
      return new Date(val);
    }
    // { "$numberLong": "..." } → number or BigInt
    if ("$numberLong" in doc && typeof doc.$numberLong === "string") {
      const n = BigInt(doc.$numberLong);
      // Use regular number if it fits safely
      if (n >= Number.MIN_SAFE_INTEGER && n <= Number.MAX_SAFE_INTEGER) {
        return Number(n);
      }
      return n;
    }
    // { "$numberInt": "..." } → number
    if ("$numberInt" in doc && typeof doc.$numberInt === "string") {
      return parseInt(doc.$numberInt, 10);
    }
    // { "$numberDouble": "..." } → number
    if ("$numberDouble" in doc && typeof doc.$numberDouble === "string") {
      return parseFloat(doc.$numberDouble);
    }

    // Recurse into all object keys
    const result = {};
    for (const [key, value] of Object.entries(doc)) {
      result[key] = reviveExtendedJSON(value);
    }
    return result;
  }

  return doc;
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const flags = args.filter((a) => a.startsWith("--"));
  const positional = args.filter((a) => !a.startsWith("--"));

  const dropExisting = flags.includes("--drop");
  const dryRun = flags.includes("--dry-run");

  if (positional.length === 0) {
    console.error("Usage: node restore.mjs <backup-file.json> [--drop] [--dry-run]");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI environment variable is required.");
    console.error('Example: MONGODB_URI="mongodb+srv://user:pass@cluster/dbname" node restore.mjs backup.json');
    process.exit(1);
  }

  const backupPath = resolve(positional[0]);
  console.log(`Reading backup from: ${backupPath}`);

  let backup;
  try {
    const raw = readFileSync(backupPath, "utf-8");
    backup = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read/parse backup file: ${err.message}`);
    process.exit(1);
  }

  if (!backup.collections || typeof backup.collections !== "object") {
    console.error("Invalid backup format: missing 'collections' object.");
    process.exit(1);
  }

  const collectionNames = Object.keys(backup.collections);
  console.log(`\nBackup date: ${backup.exportDate}`);
  console.log(`Collections found: ${collectionNames.length}`);
  for (const name of collectionNames) {
    const count = backup.collections[name]?.length ?? 0;
    console.log(`  - ${name}: ${count} documents`);
  }

  if (dryRun) {
    console.log("\n[DRY RUN] No changes will be made.");
    console.log("Would perform the following:");
    if (dropExisting) {
      console.log(`  - Drop ${collectionNames.length} collections`);
    }
    for (const name of collectionNames) {
      const count = backup.collections[name]?.length ?? 0;
      if (count > 0) {
        console.log(`  - Insert ${count} documents into '${name}'`);
      }
    }
    process.exit(0);
  }

  // Connect to MongoDB
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // uses the database from the connection string
    console.log(`\nConnected to database: ${db.databaseName}`);

    if (dropExisting) {
      console.log("\n⚠️  --drop flag set: dropping existing collections...");
      for (const name of collectionNames) {
        try {
          await db.collection(name).drop();
          console.log(`  ✓ Dropped '${name}'`);
        } catch (err) {
          // Collection might not exist, that's fine
          if (err.codeName === "NamespaceNotFound") {
            console.log(`  - '${name}' did not exist, skipping`);
          } else {
            throw err;
          }
        }
      }
    }

    // Restore each collection
    console.log("\nRestoring collections...");
    let totalInserted = 0;

    for (const name of collectionNames) {
      const rawDocuments = backup.collections[name];
      if (!Array.isArray(rawDocuments) || rawDocuments.length === 0) {
        console.log(`  - '${name}': 0 documents, skipping`);
        continue;
      }

      // Convert Extended JSON back to native BSON types
      const documents = rawDocuments.map(reviveExtendedJSON);

      // Insert in batches of 500 to avoid hitting limits
      const BATCH_SIZE = 500;
      let inserted = 0;

      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        const result = await db.collection(name).insertMany(batch, {
          ordered: false, // continue on duplicate key errors
        });
        inserted += result.insertedCount;
      }

      console.log(`  ✓ '${name}': inserted ${inserted}/${rawDocuments.length} documents`);
      totalInserted += inserted;
    }

    console.log(`\n✅ Restore complete! Total documents inserted: ${totalInserted}`);
  } catch (err) {
    console.error(`\n❌ Restore failed: ${err.message}`);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
