import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksActivations extends Struct.ComponentSchema {
  collectionName: 'components_blocks_activations';
  info: {
    description: 'Brand activation cards';
    displayName: 'Activations';
    icon: 'rocket';
  };
  attributes: {
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    highlightedTitle: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.activation', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksFeaturesGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_features_grids';
  info: {
    description: 'Formula & benefits bento grid';
    displayName: 'Features grid';
    icon: 'grid';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.feature', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksFlavorCarousel extends Struct.ComponentSchema {
  collectionName: 'components_blocks_flavor_carousels';
  info: {
    description: 'Pick and order the flavors to showcase';
    displayName: 'Flavor carousel';
    icon: 'apps';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    flavors: Schema.Attribute.Relation<'oneToMany', 'api::flavor.flavor'>;
    highlightedTitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    description: 'Top section with product image';
    displayName: 'Hero';
    icon: 'star';
  };
  attributes: {
    benefits: Schema.Attribute.Component<'shared.tag', true>;
    eyebrow: Schema.Attribute.String;
    highlightedTitle: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    primaryCta: Schema.Attribute.Component<'shared.link', false>;
    secondaryCta: Schema.Attribute.Component<'shared.link', false>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksSocialFeed extends Struct.ComponentSchema {
  collectionName: 'components_blocks_social_feeds';
  info: {
    description: 'Instagram grid';
    displayName: 'Social feed';
    icon: 'picture';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.link', false>;
    eyebrow: Schema.Attribute.String;
    highlightedTitle: Schema.Attribute.String;
    posts: Schema.Attribute.Component<'elements.social-post', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsActivation extends Struct.ComponentSchema {
  collectionName: 'components_elements_activations';
  info: {
    description: 'Brand activation card';
    displayName: 'Activation';
    icon: 'rocket';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.link', false>;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Enumeration<
      [
        'zap',
        'flame',
        'brain',
        'sparkles',
        'dumbbell',
        'building',
        'calendar',
        'heart',
        'leaf',
        'rocket',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'sparkles'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsFeature extends Struct.ComponentSchema {
  collectionName: 'components_elements_features';
  info: {
    description: 'Formula & benefits card';
    displayName: 'Feature';
    icon: 'bulletList';
  };
  attributes: {
    accentColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#AFFF00'>;
    description: Schema.Attribute.String;
    icon: Schema.Attribute.Enumeration<
      [
        'zap',
        'flame',
        'brain',
        'sparkles',
        'dumbbell',
        'building',
        'calendar',
        'heart',
        'leaf',
        'rocket',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'zap'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsSocialPost extends Struct.ComponentSchema {
  collectionName: 'components_elements_social_posts';
  info: {
    description: 'Instagram tile';
    displayName: 'Social post';
    icon: 'picture';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    likes: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    description: '';
    displayName: 'Footer';
    icon: 'layout';
  };
  attributes: {
    copyright: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    highlightedTitle: Schema.Attribute.String;
    linkGroups: Schema.Attribute.Component<'layout.link-group', true>;
    newsletterButtonLabel: Schema.Attribute.String & Schema.Attribute.Required;
    newsletterNote: Schema.Attribute.String;
    newsletterPlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'your@email.com'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutLinkGroup extends Struct.ComponentSchema {
  collectionName: 'components_layout_link_groups';
  info: {
    description: 'Footer column';
    displayName: 'Link group';
    icon: 'bulletList';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    description: 'Label + href, used for CTAs and navigation';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'#'>;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedTag extends Struct.ComponentSchema {
  collectionName: 'components_shared_tags';
  info: {
    description: 'Short label (benefits, badges)';
    displayName: 'Tag';
    icon: 'priceTag';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'blocks.activations': BlocksActivations;
      'blocks.features-grid': BlocksFeaturesGrid;
      'blocks.flavor-carousel': BlocksFlavorCarousel;
      'blocks.hero': BlocksHero;
      'blocks.social-feed': BlocksSocialFeed;
      'elements.activation': ElementsActivation;
      'elements.feature': ElementsFeature;
      'elements.social-post': ElementsSocialPost;
      'layout.footer': LayoutFooter;
      'layout.link-group': LayoutLinkGroup;
      'shared.link': SharedLink;
      'shared.seo': SharedSeo;
      'shared.tag': SharedTag;
    }
  }
}
