'use strict';

/**
 *  course controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController("api::course.course", ({ strapi }) => ({
  async findOne(ctx) {
    const { id: slug } = ctx.params;
    const { query } = ctx;
    if (!query.filters) query.filters = {};
    query.filters.slug = { $eq: slug };

    const chaptersPopulate = {
      chapters: {
        sort: ["order:asc"],
      },
    };

    if (Array.isArray(query.populate)) {
      const newPopulate = {};
      query.populate.forEach((field) => (newPopulate[field] = true));
      query.populate = { ...newPopulate, ...chaptersPopulate };
    } else {
      query.populate = { ...query.populate, ...chaptersPopulate };
    }

    const entity = await strapi.service("api::course.course").find(query);
    const { results } = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(results[0]);
  },
}));
