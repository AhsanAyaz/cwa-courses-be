import type { Schema, Struct } from '@strapi/strapi';

export interface ResourcesLink extends Struct.ComponentSchema {
  collectionName: 'components_resources_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'resources.link': ResourcesLink;
    }
  }
}
