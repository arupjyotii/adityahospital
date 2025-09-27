import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  schema?: object;
}

const defaultProps: SEOProps = {
  title: 'Aditya Hospital - Best Multispeciality Hospital in Nagaon, Assam',
  description: 'Aditya Hospital is the leading multispeciality hospital in Nagaon, Assam. We provide world-class healthcare services with 24/7 emergency care, expert doctors, and advanced medical technology.',
  keywords: 'hospital nagaon, multispeciality hospital assam, emergency care nagaon, doctors nagaon, healthcare assam, medical treatment nagaon, aditya hospital',
  image: 'https://adityahospitalnagaon.com/hospital-og-image.jpg',
  url: 'https://adityahospitalnagaon.com',
  type: 'website',
  author: 'Aditya Hospital'
};

export const SEO: React.FC<SEOProps> = (props) => {
  const {
    title = defaultProps.title,
    description = defaultProps.description,
    keywords = defaultProps.keywords,
    image = defaultProps.image,
    url = defaultProps.url,
    type = defaultProps.type,
    author = defaultProps.author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    schema
  } = props;

  const fullTitle = title.includes('Aditya Hospital') ? title : `${title} | Aditya Hospital`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Aditya Hospital" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:site" content="@AdityaHospital" />
      
      {/* Additional Open Graph for Articles */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Schema.org Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

// Hospital Schema Generator
export const createHospitalSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Hospital",
    "name": "Aditya Hospital",
    "alternateName": "Aditya Multispeciality Hospital",
    "description": "Leading multispeciality hospital in Nagaon, Assam providing world-class healthcare services with 24/7 emergency care.",
    "url": "https://adityahospitalnagaon.com",
    "logo": "https://adityahospitalnagaon.com/logo.png",
    "image": "https://adityahospitalnagaon.com/hospital-og-image.jpg",
    "telephone": "+91-8638559875",
    "email": "info@adityahospitalnagaon.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Medical College Road, Diphalu",
      "addressLocality": "Nagaon",
      "addressRegion": "Assam",
      "postalCode": "782003",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.3489",
      "longitude": "92.6739"
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "priceRange": "$$",
    "currenciesAccepted": "INR",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Insurance"],
    "availableService": [
      {
        "@type": "MedicalTherapy",
        "name": "Emergency Care"
      },
      {
        "@type": "MedicalTherapy", 
        "name": "General Medicine"
      },
      {
        "@type": "MedicalTherapy",
        "name": "General Surgery"
      },
      {
        "@type": "MedicalTherapy",
        "name": "Ophthalmology"
      },
      {
        "@type": "MedicalTherapy",
        "name": "ICU Care"
      },
      {
        "@type": "MedicalTherapy",
        "name": "Laboratory Services"
      }
    ],
    "hasMap": "https://maps.google.com/?q=Aditya+Hospital,+Medical+College+Road,+Diphalu,+Nagaon,+Assam",
    "sameAs": [
      "https://www.facebook.com/adityahospitalnagaon/",
    ]
  };
};

// Medical Organization Schema for Doctors
export const createDoctorSchema = (doctor: {
  name: string;
  specialty: string;
  experience: string;
  qualifications?: string;
  image?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": doctor.name,
    "jobTitle": `${doctor.specialty} Specialist`,
    "worksFor": {
      "@type": "Hospital",
      "name": "Aditya Hospital",
      "url": "https://adityahospitalnagaon.com"
    },
    "hasOccupation": {
      "@type": "Occupation",
      "name": doctor.specialty,
      "occupationLocation": {
        "@type": "City",
        "name": "Nagaon, Assam"
      }
    },
    "alumniOf": doctor.qualifications,
    "image": doctor.image,
    "description": `${doctor.specialty} specialist with ${doctor.experience} of experience at Aditya Hospital, Nagaon.`
  };
};

// Medical Service Schema
export const createServiceSchema = (service: {
  name: string;
  description: string;
  category?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalTherapy",
    "name": service.name,
    "description": service.description,
    "category": service.category,
    "provider": {
      "@type": "Hospital",
      "name": "Aditya Hospital",
      "url": "https://adityahospitalnagaon.com"
    }
  };
};