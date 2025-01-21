/**
 * This file was automatically generated by Strapi.
 * Any modifications made will be discarded.
 */
import documentation from "@strapi/plugin-documentation/strapi-admin";
import i18N from "@strapi/plugin-i18n/strapi-admin";
import usersPermissions from "@strapi/plugin-users-permissions/strapi-admin";
import oembed from "strapi-plugin-oembed/strapi-admin";
import vercelDeploy from "strapi-plugin-vercel-deploy/strapi-admin";
import { renderAdmin } from "@strapi/strapi/admin";

import customisations from "../../src/admin/app.js";

renderAdmin(document.getElementById("strapi"), {
  customisations,

  plugins: {
    documentation: documentation,
    i18n: i18N,
    "users-permissions": usersPermissions,
    oembed: oembed,
    "vercel-deploy": vercelDeploy,
  },
});
