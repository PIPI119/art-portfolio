// ─── Artwork ────────────────────────────────────────────────────────────────

export interface Artwork {
  id: string;
  title: string;
  year: number;
  dimensions: string;
  technique: string;
  image_url: string;
  description: string;
  category: string;
  sold: boolean;
  price: number | null;
  sort_order: number;
  created_at?: string;
}

// ─── Site Settings ───────────────────────────────────────────────────────────

export interface HeroSettings {
  heading: string;
  subheading: string;
  blurb: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export type StatIcon = 'package' | 'bar-chart' | 'award' | 'users';

export interface StatCounter {
  value: string;
  label: string;
  icon: StatIcon;
}

export interface ContactSettings {
  phone: string;
  email: string;
  facebook_url: string;
  instagram_url: string;
  address: string;
}

export interface FormLabels {
  name_label: string;
  name_placeholder: string;
  email_label: string;
  email_placeholder: string;
  message_label: string;
  message_placeholder: string;
  submit_label: string;
  success_message: string;
}

export interface BiographySettings {
  section_title: string;
  heading: string;
  paragraphs: string[];
  portrait_url: string;
}

export interface GallerySettings {
  section_title: string;
  heading: string;
  subheading: string;
  categories: string[];
}

export interface FooterSettings {
  copyright: string;
  links: { label: string; href: string }[];
}

export interface LogoSettings {
  text: string;
  font_size: string;
  image_url: string;
}

export interface ArtistSettings {
  first_name: string;
  last_name: string;
}

export interface SiteSettings {
  id?: string;
  logo: LogoSettings;
  artist: ArtistSettings;
  nav_links: NavLink[];
  hero: HeroSettings;
  biography: BiographySettings;
  stats: StatCounter[];
  gallery: GallerySettings;
  contact: ContactSettings;
  form_labels: FormLabels;
  footer: FooterSettings;
  updated_at?: string;
}

export interface UploadResult {
  url: string;
  path: string;
}
