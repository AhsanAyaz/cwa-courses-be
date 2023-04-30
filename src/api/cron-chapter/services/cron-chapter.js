'use strict';

/**
 * cron-chapter service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cron-chapter.cron-chapter');
