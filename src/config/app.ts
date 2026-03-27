import { getURL } from '@/lib/utils';

export const config = {
  name: 'Talendly',
  url: getURL(),
  navLinks: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Candidates', href: '#candidates' },
    { label: 'For Employers', href: '#employers' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
  ],
  footerLinks: [
    {
      title: 'Product',
      links: [
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'For Candidates', href: '#candidates' },
        { label: 'For Employers', href: '#employers' },
        { label: 'Pricing', href: '#pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '#blog' },
        { label: 'Careers', href: '#careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Accessibility', href: '/accessibility' },
      ],
    },
  ],
};
