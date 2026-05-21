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
  about: {
    title: 'About Medi Sheba | Healthcare Platform in Bangladesh',
    description: 'Learn about Medi Sheba, our mission, and how we make healthcare services easier to access across Bangladesh.',
    keywords: 'about Medi Sheba, healthcare platform, Bangladesh healthcare, medical services',
    ogUrl: 'https://medisheba.bd/about'
  },
  doctors: {
    title: 'Find Doctors | Medi Sheba - Healthcare Platform',
    description: 'Search and connect with qualified doctors in Bangladesh. View profiles, specializations, and book appointments online.',
    keywords: 'doctors, specialists, medical professionals, Bangladesh, healthcare',
    ogUrl: 'https://medisheba.bd/doctors'
  },
  doctorDetail: {
    title: 'Doctor Profile | Medi Sheba',
    description: 'View doctor profile details, specialties, consultation information, reviews, and appointment options on Medi Sheba.',
    keywords: 'doctor profile, doctor appointment, specialist doctor, Medi Sheba',
    ogUrl: 'https://medisheba.bd/doctors'
  },
  hospitals: {
    title: 'Find Hospitals | Medi Sheba - Healthcare Platform',
    description: 'Discover hospitals and medical centers in Bangladesh. View services, contact information, and book appointments.',
    keywords: 'hospitals, medical centers, healthcare facilities, Bangladesh, health services',
    ogUrl: 'https://medisheba.bd/hospitals'
  },
  hospitalDetail: {
    title: 'Hospital Profile | Medi Sheba',
    description: 'View hospital details, available services, doctors, beds, emergency support, and contact information on Medi Sheba.',
    keywords: 'hospital profile, hospital details, hospital doctors, emergency hospital, Medi Sheba',
    ogUrl: 'https://medisheba.bd/hospitals'
  },
  appointments: {
    title: 'My Care Services | Medi Sheba - Healthcare Platform',
    description: 'Manage doctor appointments, E-Doctor consultations, ambulance requests, and medicine orders in one patient dashboard.',
    keywords: 'patient services, appointments, e-doctor, ambulance requests, medicine orders, healthcare dashboard',
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
  contact: {
    title: 'Contact Us | Medi Sheba',
    description: 'Contact Medi Sheba for healthcare platform support, questions, service help, and feedback.',
    keywords: 'contact Medi Sheba, healthcare support, customer support, medical platform help',
    ogUrl: 'https://medisheba.bd/contact'
  },
  contactSales: {
    title: 'Contact Sales | Medi Sheba',
    description: 'Contact Medi Sheba sales for admin plans, subscriptions, enterprise pricing, and healthcare service onboarding.',
    keywords: 'Medi Sheba sales, healthcare subscription, admin plans, enterprise healthcare platform',
    ogUrl: 'https://medisheba.bd/contact-sales'
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
  },
  forgotPassword: {
    title: 'Forgot Password | Medi Sheba',
    description: 'Request a password reset link for your Medi Sheba account.',
    keywords: 'forgot password, reset password, Medi Sheba account',
    ogUrl: 'https://medisheba.bd/forgot-password'
  },
  resetPassword: {
    title: 'Reset Password | Medi Sheba',
    description: 'Set a new password and regain access to your Medi Sheba account.',
    keywords: 'reset password, new password, Medi Sheba account recovery',
    ogUrl: 'https://medisheba.bd/reset-password'
  },
  privacy: {
    title: 'Privacy Policy | Medi Sheba',
    description: 'Read how Medi Sheba collects, uses, and protects personal, medical, and account information.',
    keywords: 'privacy policy, data protection, medical data, Medi Sheba privacy',
    ogUrl: 'https://medisheba.bd/privacy'
  },
  terms: {
    title: 'Terms of Service | Medi Sheba',
    description: 'Read the Medi Sheba terms of service, platform rules, user responsibilities, and service conditions.',
    keywords: 'terms of service, Medi Sheba terms, healthcare platform rules',
    ogUrl: 'https://medisheba.bd/terms'
  },
  paymentSuccess: {
    title: 'Payment Successful | Medi Sheba',
    description: 'Your Medi Sheba payment was completed successfully. View payment details and download your receipt.',
    keywords: 'payment success, payment receipt, Medi Sheba payment',
    ogUrl: 'https://medisheba.bd/payment/success'
  },
  paymentFailed: {
    title: 'Payment Failed | Medi Sheba',
    description: 'Your Medi Sheba payment was not completed. Review the payment status and try again.',
    keywords: 'payment failed, payment cancelled, Medi Sheba payment',
    ogUrl: 'https://medisheba.bd/payment/failed'
  },
  hospitalAdmin: {
    title: 'Hospital Admin Dashboard | Medi Sheba',
    description: 'Manage hospital doctors, e-doctors, appointments, consultations, revenue review, and hospital profile information.',
    keywords: 'hospital admin dashboard, hospital management, appointments, revenue review',
    ogUrl: 'https://medisheba.bd/hospital-admin'
  },
  hospitalCreate: {
    title: 'Create Hospital Profile | Medi Sheba',
    description: 'Set up your hospital profile, complete subscription access, and start managing hospital services on Medi Sheba.',
    keywords: 'create hospital, hospital setup, hospital admin subscription, Medi Sheba',
    ogUrl: 'https://medisheba.bd/hospital-create'
  },
  pharmacyAdmin: {
    title: 'Pharmacy Admin Dashboard | Medi Sheba',
    description: 'Manage pharmacy medicines, orders, revenue review, and pharmacy profile information on Medi Sheba.',
    keywords: 'pharmacy admin dashboard, medicine orders, pharmacy management, revenue review',
    ogUrl: 'https://medisheba.bd/pharmacy-admin'
  },
  pharmacyCreate: {
    title: 'Create Pharmacy Profile | Medi Sheba',
    description: 'Set up your pharmacy profile, complete subscription access, and start managing medicine orders on Medi Sheba.',
    keywords: 'create pharmacy, pharmacy setup, pharmacy admin subscription, Medi Sheba',
    ogUrl: 'https://medisheba.bd/pharmacy-create'
  },
  ambulanceAdmin: {
    title: 'Ambulance Admin Dashboard | Medi Sheba',
    description: 'Manage ambulance service details, booking requests, fares, status updates, and revenue review.',
    keywords: 'ambulance admin dashboard, ambulance requests, ambulance revenue, service management',
    ogUrl: 'https://medisheba.bd/ambulance-admin'
  },
  superAdmin: {
    title: 'Super Admin Dashboard | Medi Sheba',
    description: 'Control admins, healthcare services, appointments, payments, subscriptions, orders, and requests across Medi Sheba.',
    keywords: 'super admin dashboard, platform management, payments, subscriptions, healthcare services',
    ogUrl: 'https://medisheba.bd/super-admin'
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
