'use strict';

/**
 * cron-chapter router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::cron-chapter.cron-chapter');
