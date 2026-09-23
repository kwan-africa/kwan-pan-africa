import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const serverEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(serverEnvPath)) dotenv.config({ path: serverEnvPath });
else if (fs.existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '6aafb1c000071a227cda';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = 'kwan_db';

if (!APPWRITE_API_KEY) {
  console.error('❌ Error: APPWRITE_API_KEY is not set.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': APPWRITE_PROJECT_ID,
  'X-Appwrite-Key': APPWRITE_API_KEY,
};

async function api(endpoint, method = 'GET', body = null) {
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${APPWRITE_ENDPOINT}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SEED_HOSTS = [
  {
    id: 'host_01',
    name: 'Nana Kwesi Mensah',
    role: 'Ancestral Roots Guide & Castle Historian',
    guild: 'Cape Coast Castle Guild',
    theme_tags: ['heritage_spiritual'],
    anchor_site: 'Cape Coast Castle (Door of No Return)',
    momo_number: '024 *** 6621',
    momo_network: 'mtn',
    verified: true,
    price_usd: 50.0,
    price_ghs: 760.0,
    photo_url: '/ghana_guide_kwesi.jpg',
    active: true,
  },
  {
    id: 'host_02',
    name: 'Joshua Clottey',
    role: 'Boxing Coach and Ga-Mashie Walking Host',
    guild: 'Bukom Boxing Guild',
    theme_tags: ['adventure'],
    anchor_site: 'Bukom Boxing Academies',
    momo_number: '024 *** 8912',
    momo_network: 'mtn',
    verified: true,
    price_usd: 50.0,
    price_ghs: 760.0,
    photo_url: '/ghana_guide_kwesi.jpg',
    active: true,
  },
  {
    id: 'host_03',
    name: 'Naa Densua Addy',
    role: 'Master Bead Maker & Cultural Host',
    guild: 'Ga-Mashie Heritage Bead Guild',
    theme_tags: ['art', 'food'],
    anchor_site: 'Jamestown Arts Compound',
    momo_number: '020 *** 4410',
    momo_network: 'telecel',
    verified: true,
    price_usd: 45.0,
    price_ghs: 684.0,
    photo_url: '/kwan_logo_square_white_bg.png',
    active: true,
  },
];

async function createCollectionIfMissing(collectionId, name, permissions) {
  console.log(`Checking collection [${collectionId}]...`);
  const check = await api(`/databases/${DATABASE_ID}/collections/${collectionId}`);
  if (check.ok) {
    console.log(`  ✓ Collection [${collectionId}] already exists.`);
    return check.data;
  }

  console.log(`  Creating collection [${collectionId}] with permissions:`, permissions);
  const created = await api(`/databases/${DATABASE_ID}/collections`, 'POST', {
    collectionId,
    name,
    permissions,
  });

  if (!created.ok) {
    console.error(`  ❌ Failed to create collection [${collectionId}]:`, created.data);
    throw new Error(created.data.message || 'Collection creation failed');
  }

  console.log(`  ✓ Collection [${collectionId}] created successfully.`);
  return created.data;
}

async function addAttributeIfMissing(collectionId, type, attrConfig) {
  const existingAttrs = await api(`/databases/${DATABASE_ID}/collections/${collectionId}/attributes`);
  const exists = existingAttrs.data?.attributes?.some((a) => a.key === attrConfig.key);
  if (exists) {
    return;
  }

  console.log(`  Adding attribute [${attrConfig.key}] (${type}) to [${collectionId}]...`);
  const res = await api(`/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${type}`, 'POST', attrConfig);
  if (!res.ok) {
    console.warn(`    ⚠️ Warning adding attribute ${attrConfig.key}:`, res.data.message);
  }
}

async function setupSchema() {
  console.log('\n======================================================');
  console.log('🚀 Kwan AI: Provisioning Appwrite Database & Schema');
  console.log(`Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`Project:  ${APPWRITE_PROJECT_ID}`);
  console.log(`Database: ${DATABASE_ID}`);
  console.log('======================================================\n');

  // 1. Verify Database
  const dbCheck = await api(`/databases/${DATABASE_ID}`);
  if (!dbCheck.ok) {
    console.log(`Database [${DATABASE_ID}] not found. Creating...`);
    const dbRes = await api('/databases', 'POST', { databaseId: DATABASE_ID, name: 'Kwan Cultural Travel' });
    if (!dbRes.ok) throw new Error(`Could not create database: ${JSON.stringify(dbRes.data)}`);
    console.log(`✓ Database [${DATABASE_ID}] created.`);
  } else {
    console.log(`✓ Database [${DATABASE_ID}] confirmed.`);
  }

  // 2. Collection 1: hosts (Public read)
  await createCollectionIfMissing('hosts', 'Verified Cultural Hosts', ['read("any")']);
  await addAttributeIfMissing('hosts', 'string', { key: 'name', size: 255, required: true });
  await addAttributeIfMissing('hosts', 'string', { key: 'role', size: 255, required: true });
  await addAttributeIfMissing('hosts', 'string', { key: 'guild', size: 255, required: false });
  await addAttributeIfMissing('hosts', 'string', { key: 'theme_tags', size: 100, required: true, array: true });
  await addAttributeIfMissing('hosts', 'string', { key: 'anchor_site', size: 255, required: true });
  await addAttributeIfMissing('hosts', 'string', { key: 'momo_number', size: 50, required: true });
  await addAttributeIfMissing('hosts', 'string', { key: 'momo_network', size: 50, required: true });
  await addAttributeIfMissing('hosts', 'boolean', { key: 'verified', required: true });
  await addAttributeIfMissing('hosts', 'float', { key: 'price_usd', required: true, min: 0, max: 10000 });
  await addAttributeIfMissing('hosts', 'float', { key: 'price_ghs', required: true, min: 0, max: 200000 });
  await addAttributeIfMissing('hosts', 'string', { key: 'photo_url', size: 500, required: false });
  await addAttributeIfMissing('hosts', 'boolean', { key: 'active', required: true });

  // 3. Collection 2: bookings (Server-only)
  await createCollectionIfMissing('bookings', 'Escrow Bookings', []);
  await addAttributeIfMissing('bookings', 'string', { key: 'traveler_name', size: 255, required: false });
  await addAttributeIfMissing('bookings', 'string', { key: 'contact', size: 255, required: false });
  await addAttributeIfMissing('bookings', 'string', { key: 'host_id', size: 100, required: false });
  await addAttributeIfMissing('bookings', 'string', { key: 'theme_matched', size: 100, required: false });
  await addAttributeIfMissing('bookings', 'float', { key: 'total_usd', required: false, min: 0, max: 10000 });
  await addAttributeIfMissing('bookings', 'float', { key: 'total_ghs', required: false, min: 0, max: 200000 });
  await addAttributeIfMissing('bookings', 'float', { key: 'platform_fee_usd', required: false, min: 0, max: 10000 });
  await addAttributeIfMissing('bookings', 'float', { key: 'host_payout_usd', required: false, min: 0, max: 10000 });
  await addAttributeIfMissing('bookings', 'string', { key: 'status', size: 50, required: false });
  await addAttributeIfMissing('bookings', 'string', { key: 'paystack_reference', size: 100, required: false });
  await addAttributeIfMissing('bookings', 'string', { key: 'release_pin', size: 10, required: false });
  await addAttributeIfMissing('bookings', 'string', { key: 'pin_generated_at', size: 100, required: false });
  await addAttributeIfMissing('bookings', 'string', { key: 'auto_release_at', size: 100, required: false });
  await addAttributeIfMissing('bookings', 'string', { key: 'disbursed_at', size: 100, required: false });

  // 4. Collection 3: escrow_ledgers (Server-only)
  await createCollectionIfMissing('escrow_ledgers', 'Escrow Ledgers', []);
  await addAttributeIfMissing('escrow_ledgers', 'string', { key: 'booking_id', size: 100, required: true });
  await addAttributeIfMissing('escrow_ledgers', 'string', { key: 'event_type', size: 100, required: true });
  await addAttributeIfMissing('escrow_ledgers', 'float', { key: 'amount_usd', required: true, min: 0, max: 10000 });
  await addAttributeIfMissing('escrow_ledgers', 'float', { key: 'amount_ghs', required: true, min: 0, max: 200000 });
  await addAttributeIfMissing('escrow_ledgers', 'float', { key: 'levy_amount', required: true, min: 0, max: 10000 });
  await addAttributeIfMissing('escrow_ledgers', 'string', { key: 'actor', size: 50, required: true });
  await addAttributeIfMissing('escrow_ledgers', 'string', { key: 'timestamp', size: 100, required: true });

  console.log('\n⏳ Waiting 3 seconds for Appwrite attribute indexes to settle...');
  await sleep(3000);

  // 5. Seed Verified Hosts
  console.log('\n🌱 Seeding Verified Host Roster...');
  for (const host of SEED_HOSTS) {
    const { id, ...data } = host;
    const docCheck = await api(`/databases/${DATABASE_ID}/collections/hosts/documents/${id}`);
    if (docCheck.ok) {
      console.log(`  ✓ Host [${id}] (${data.name}) already exists. Updating...`);
      await api(`/databases/${DATABASE_ID}/collections/hosts/documents/${id}`, 'PATCH', { data });
    } else {
      console.log(`  + Inserting Host [${id}] (${data.name})...`);
      const createDoc = await api(`/databases/${DATABASE_ID}/collections/hosts/documents`, 'POST', {
        documentId: id,
        data,
      });
      if (createDoc.ok) {
        console.log(`  ✓ Host [${id}] inserted.`);
      } else {
        console.error(`  ❌ Failed to insert host [${id}]:`, createDoc.data);
      }
    }
  }

  // 6. Verify by reading from hosts collection
  console.log('\n🔍 Verifying hosts collection retrieval from Appwrite...');
  const verifyRes = await api(`/databases/${DATABASE_ID}/collections/hosts/documents`);
  if (verifyRes.ok && verifyRes.data?.documents?.length > 0) {
    console.log(`🎉 SUCCESS: Found ${verifyRes.data.documents.length} verified host documents in Appwrite.`);
    for (const d of verifyRes.data.documents) {
      console.log(`   - [${d.$id}] ${d.name} (${d.anchor_site}) -> Price: $${d.price_usd}`);
    }
  } else {
    console.warn('⚠️ Verification check returned 0 documents:', verifyRes.data);
  }

  console.log('\n======================================================');
  console.log('✅ Appwrite Schema & Seed Provisioning Complete!');
  console.log('======================================================\n');
}

setupSchema().catch((err) => {
  console.error('Fatal error during Appwrite setup:', err);
  process.exit(1);
});
