import type { Attribute, Schema } from '@strapi/strapi';

export interface ResourcesLink extends Schema.Component {
  collectionName: 'components_resources_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    label: Attribute.String;
    url: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'resources.link': ResourcesLink;
    }
  }
}
