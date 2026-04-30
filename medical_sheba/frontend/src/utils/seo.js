/**
 * SEO Utility Functions
 * Used to dynamically update meta tags for each page
 */

export const updateMetaTags = ({
  title,
  description,
  keywords,
  ogImage = 'https://medisheba.bd/og-image.png',
  ogUrl = 'https://medisheba.bd/',
  twitterHandle = '@MediSheba'
} = {}) => {
  // Update document title
  if (title) {
    document.title = title;
  }

  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  } else {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = description;
    document.head.appendChild(metaDescription);
  }

  // Update or create meta keywords
  if (keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      metaKeywords.content = keywords;
      document.head.appendChild(metaKeywords);
    }
  }

  // Update Open Graph tags
  updateMetaProperty('og:title', title);
  updateMetaProperty('og:description', description);
  updateMetaProperty('og:image', ogImage);
  updateMetaProperty('og:url', ogUrl);

  // Update Twitter Card tags
  updateMetaProperty('twitter:title', title);
  updateMetaProperty('twitter:description', description);
  updateMetaProperty('twitter:image', ogImage);
  if (twitterHandle) {
    updateMetaProperty('twitter:creator', twitterHandle);
  }

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', ogUrl);
  } else {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = ogUrl;
    document.head.appendChild(canonical);
  }
};

/**
 * Helper function to update or create meta property tags
 */
const updateMetaProperty = (property, content) => {
  if (!content) return;

  let element = document.querySelector(`meta[property="${property}"]`);
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

/**
 * Page-specific metadata configurations
 */
export const pageMetadata = {
  home: {
    title: 'Medi Sheba - Healthcare Management Platform in Bangladesh',
    description: 'Connect with qualified doctors and hospitals in Bangladesh. Book appointments, find blood donors, and access healthcare services online.',
    keywords: 'healthcare, doctors, hospitals, appointments, Bangladesh, medical services',
    ogUrl: 'https://medisheba.bd/'
  },
  doctors: {
    title: 'Find Doctors | Medi Sheba - Healthcare Platform',
    description: 'Search and connect with qualified doctors in Bangladesh. View profiles, specializations, and book appointments online.',
    keywords: 'doctors, specialists, medical professionals, Bangladesh, healthcare',
    ogUrl: 'https://medisheba.bd/doctors'
  },
  hospitals: {
    title: 'Find Hospitals | Medi Sheba - Healthcare Platform',
    description: 'Discover hospitals and medical centers in Bangladesh. View services, contact information, and book appointments.',
    keywords: 'hospitals, medical centers, healthcare facilities, Bangladesh, health services',
    ogUrl: 'https://medisheba.bd/hospitals'
  },
  appointments: {
    title: 'Book Appointments | Medi Sheba - Healthcare Platform',
    description: 'Book and manage your medical appointments with doctors in Bangladesh. Easy online scheduling.',
    keywords: 'appointments, book doctor, medical appointments, healthcare scheduling',
    ogUrl: 'https://medisheba.bd/appointments'
  },
  blood: {
    title: 'Blood Donation | Medi Sheba - Healthcare Platform',
    description: 'Find blood donors and request blood in Bangladesh. Connect with the community for blood donation services.',
    keywords: 'blood donation, blood bank, blood request, healthcare, Bangladesh',
    ogUrl: 'https://medisheba.bd/blood'
  },
  ambulance: {
    title: 'Ambulance Services | Medi Sheba - Healthcare Platform',
    description: 'Emergency ambulance services available 24/7 in Bangladesh. Request ambulance for medical emergencies.',
    keywords: 'ambulance, emergency services, medical transport, healthcare, Bangladesh',
    ogUrl: 'https://medisheba.bd/ambulance'
  },
  emedicine: {
    title: 'E-Medicine | Medi Sheba - Healthcare Platform',
    description: 'Order medicines online with home delivery. Access trusted online pharmacies in Bangladesh.',
    keywords: 'e-medicine, online pharmacy, medicine delivery, healthcare, Bangladesh',
    ogUrl: 'https://medisheba.bd/emedicine'
  },
  edoctor: {
    title: 'E-Doctor | Medi Sheba - Healthcare Platform',
    description: 'Consult with experienced doctors online. Schedule video consultations with qualified medical professionals.',
    keywords: 'e-doctor, online doctor, telemedicine, doctor consultation, healthcare, Bangladesh',
    ogUrl: 'https://medisheba.bd/edoctor'
  },
  login: {
    title: 'Login | Medi Sheba - Healthcare Platform',
    description: 'Sign in to your Medi Sheba account. Access your healthcare information and appointments.',
    keywords: 'login, sign in, account, healthcare platform',
    ogUrl: 'https://medisheba.bd/login'
  },
  register: {
    title: 'Register | Medi Sheba - Healthcare Platform',
    description: 'Create your Medi Sheba account. Join the healthcare community in Bangladesh.',
    keywords: 'register, sign up, create account, healthcare platform',
    ogUrl: 'https://medisheba.bd/register'
  }
};

/**
 * Hook to set metadata on component mount
 * Usage in components: useSEO(pageMetadata.doctors);
 */
import { useEffect } from 'react';

export const useSEO = (metadata) => {
  useEffect(() => {
    updateMetaTags(metadata);
  }, [metadata]);
};
