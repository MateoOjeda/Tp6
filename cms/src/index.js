const PUBLIC_READ_ACTIONS = [
  'api::flavor.flavor.find',
  'api::flavor.flavor.findOne',
  'api::global.global.find',
  'api::landing-page.landing-page.find',
];

async function grantPublicReadAccess(strapi) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) return;

  const permissionQuery = strapi.query('plugin::users-permissions.permission');

  for (const action of PUBLIC_READ_ACTIONS) {
    const existing = await permissionQuery.findOne({ where: { action, role: publicRole.id } });
    if (!existing) {
      await permissionQuery.create({ data: { action, role: publicRole.id } });
    }
  }
}

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    await grantPublicReadAccess(strapi);
  },
};
