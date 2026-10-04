'use strict';

/**
 * Loads `content/default-content.json` (the content that used to be hardcoded in the
 * Next.js components) into Strapi. Images are read from the Next.js `public/` folder
 * and uploaded to the Media Library.
 *
 * Usage: npm run seed            (skips if the landing page already exists)
 *        npm run seed -- --force (recreates landing page, global and flavors)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const mime = require('mime-types');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const ROOT_DIR = path.join(__dirname, '..', '..');
const NEXT_PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const content = require(path.join(ROOT_DIR, 'content', 'default-content.json'));
const FORCE = process.argv.includes('--force');

async function uploadImage(strapi, { src, alt }) {
  const fileName = path.basename(src);

  const existing = await strapi.query('plugin::upload.file').findOne({ where: { name: fileName } });
  if (existing) return existing;

  // The upload service may consume the temp file, so never hand it the original asset.
  const tmpCopy = path.join(os.tmpdir(), `gigi-seed-${Date.now()}-${fileName}`);
  fs.copyFileSync(path.join(NEXT_PUBLIC_DIR, src), tmpCopy);

  const [file] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: {
        filepath: tmpCopy,
        originalFilename: fileName,
        mimetype: mime.lookup(fileName) || 'application/octet-stream',
        size: fs.statSync(tmpCopy).size,
      },
      data: { fileInfo: { name: fileName, alternativeText: alt, caption: alt } },
    });

  return file;
}

const isImageRef = (value) => value !== null && typeof value === 'object' && typeof value.src === 'string';

/** Deep-copies `value`, replacing every `{ src, alt }` image reference with its uploaded file id. */
async function withUploadedImages(strapi, value) {
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => withUploadedImages(strapi, item)));
  }
  if (isImageRef(value)) {
    return (await uploadImage(strapi, value)).id;
  }
  if (value !== null && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, child]) => [key, await withUploadedImages(strapi, child)]),
    );
    return Object.fromEntries(entries);
  }
  return value;
}

async function deleteAll(strapi, uid) {
  const docs = await strapi.documents(uid).findMany({ status: 'draft' });
  for (const doc of docs) await strapi.documents(uid).delete({ documentId: doc.documentId });
}

async function seed(strapi) {
  const existingPage = await strapi.documents('api::landing-page.landing-page').findFirst({ status: 'draft' });
  if (existingPage && !FORCE) {
    console.log('Landing page already exists, skipping seed. Use `npm run seed -- --force` to recreate it.');
    return;
  }

  if (FORCE) {
    await deleteAll(strapi, 'api::landing-page.landing-page');
    await deleteAll(strapi, 'api::global.global');
    await deleteAll(strapi, 'api::flavor.flavor');
  }

  const documentIdBySlug = {};
  for (const flavor of content.flavors) {
    const doc = await strapi.documents('api::flavor.flavor').create({
      data: await withUploadedImages(strapi, flavor),
      status: 'published',
    });
    documentIdBySlug[flavor.slug] = doc.documentId;
  }

  await strapi.documents('api::global.global').create({
    data: await withUploadedImages(strapi, content.global),
  });

  const blocks = content.landingPage.blocks.map((block) =>
    block.__component === 'blocks.flavor-carousel'
      ? { ...block, flavors: block.flavors.map((slug) => documentIdBySlug[slug]) }
      : block,
  );

  await strapi.documents('api::landing-page.landing-page').create({
    data: await withUploadedImages(strapi, { ...content.landingPage, blocks }),
    status: 'published',
  });

  console.log(`Seeded ${content.flavors.length} flavors, global settings and the landing page.`);
}

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  try {
    await seed(app);
  } finally {
    await app.destroy();
  }
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
