import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, User, Stethoscope, Award, Heart, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SEO, createHospitalSchema } from '@/components/SEO';
import { usePublicDepartments } from '@/hooks/usePublicDepartments';
import { usePublicServices } from '@/hooks/usePublicServices';

// Custom hook for counting animation
const useCountAnimation = (targetNumber: number) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            let start = 0;
            const duration = 2000; // 2 seconds
            const increment = targetNumber / (duration / 16); // 60fps approximation
            
            const timer = setInterval(() => {
              start += increment;
              if (start >= targetNumber) {
                setCount(targetNumber);
                clearInterval(timer);
              } else {
                setCount(Math.floor(start));
              }
            }, 16); // ~60fps
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [targetNumber]);

  return { count, elementRef };
};

export const HomePage: React.FC = () => {
  const { departments } = usePublicDepartments();
  const { services } = usePublicServices();

  // Top 16 doctors data
  const topDoctors = [
    {
      id: '1',
      name: 'Dr. Niyor Hazarika',
      specialization: 'MD',
      experience: 15,
      image: '/doctors/niyor.png'
    },
    {
      id: '2',
      name: 'Dr. Hriday Haloi',
      specialization: 'MS, MCH',
      experience: 12,
      image: '/doctors/hriday.png'
    },
    {
      id: '3',
      name: 'Dr. Dipankar Das',
      specialization: 'MD',
      experience: 10,
      image: '/doctors/dipankar.png'
    },
    {
      id: '4',
      name: 'Dr. Bhaskar Jyoti Malakar',
      specialization: 'MS',
      experience: 8,
      image: '/doctors/bhaskar.png'
    },
    {
      id: '5',
      name: 'Dr. Nizamuddin Khan',
      specialization: 'MS',
      experience: 14,
      image: '/doctors/niza.png'
    },
    {
      id: '6',
      name: 'Dr. Shafique Ahmed',
      specialization: 'MS',
      experience: 9,
      image: '/doctors/safi.png'
    },
    {
      id: '7',
      name: 'Dr. Pallabi Bhattacharjee',
      specialization: 'MS',
      experience: 16,
      image: '/doctors/pallabi.png'
    },
    {
      id: '8',
      name: 'Dr. Shahadat Hussain',
      specialization: 'RMO',
      experience: 11,
      image: '/doctors/shah.png'
    },
    {
      id: '9',
      name: 'Dr. Arup Choudhury',
      specialization: 'GASTROENTEROLOGY',
      experience: 13,
      image: '/doctors/arup.jpg'
    },
    {
      id: '10',
      name: 'Dr. Arjun Dey',
      specialization: 'MS',
      experience: 17,
      image: '/doctors/arjun.jpg'
    },
    {
      id: '11',
      name: 'Dr. Diganta Das',
      specialization: 'MD, DM',
      experience: 7,
      image: '/doctors/diganta.jpg'
    },
    {
      id: '12',
      name: 'Dr. Areendam barua',
      specialization: 'MS, MCH',
      experience: 12,
      image: '/doctors/areen.jpg'
    },
    {
      id: '13',
      name: 'Dr. Kishore Sarma',
      specialization: 'MS, MCH',
      experience: 15,
      image: '/doctors/kishor.jpg'
    },
    {
      id: '14',
      name: 'Dr. Surajit Hazarika',
      specialization: 'MS, MCH(Ahmedabad)',
      experience: 9,
      image: '/doctors/surajit.jpg'
    },
    {
      id: '15',
      name: 'Dr. Bijumoni Das',
      specialization: 'PHYSIOTHERAPY',
      experience: 18,
      image: '/doctors/bijumoni.jpg'
    },
    {
      id: '16',
      name: 'Dr. Siyum Ganguly',
      specialization: 'CONSULTANT PATHOLOGIST',
      experience: 11,
      image: '/doctors/siyum.png'
    }
  ];

  const stats = [
    { number: 27, label: 'Specialist Doctors' },
    { number: 20000, label: 'Happy Patients' },
    { number: 8, label: 'Years Experience' },
    { number: departments.length, label: 'Medical Departments' }
  ];

  const serviceNames = services.slice(0, 8).map(service => service.name);

  return (
    <div className="bg-amber-50">
      <SEO 
        title="Aditya Hospital - Best Multispeciality Hospital in Nagaon, Assam"
        description="Aditya Hospital is the leading multispeciality hospital in Nagaon, Assam. We provide world-class healthcare services with 24/7 emergency care, expert doctors, and advanced medical technology."
        keywords="best hospital in nagaon, best multispeciality hospital in assam, best emergency care nagaon, best doctors in nagaon, healthcare assam, medical treatment nagaon, aditya hospital, best hospital nagaon"
        url="https://adityahospitalnagaon.com"
        schema={createHospitalSchema()}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.7) contrast(1.1)' }}
          >
            <source src="/videos/medical-background.mp4" type="video/mp4" />
          </video>
          {/* Fallback gradient background if video doesn't load */}

          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-indigo-500/20 to-orange-500/20"></div>
        </div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-full text-sm font-medium border border-stone-800">
                <Star className="w-4 h-4 mr-2 text-yellow-400"/>
                Trusted by 20000+ Patients
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                #1 Hospital
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700">
                  {' '}
                </span>
                {' '}in Nagaon, Assam
              </h1>
              <p className="text-xl text-white leading-relaxed">
                Experience exceptional medical care with our team of expert doctors,
                state-of-the-art facilities, and compassionate patient care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="outline" size="lg" className="bg-white hover:bg-indigo-600 text-lg px-8 py-6 text-black border-2 border-green-700">
                  <Link to="/appointments">
                    Book Appointment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white hover:bg-indigo-600 text-lg px-8 py-6 text-black border-2 border-stone-700">
                  <Link to="/departments">Our Departments
                  <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white border-y-4 border-amber-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const { count, elementRef } = useCountAnimation(stat.number);
              return (
                <div key={index} ref={elementRef} className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold mb-2 text-yellow-400" style={{ WebkitTextStroke: '1px black' }}>
                    {count}{stat.label === 'Happy Patients' || stat.label === 'Specialist Doctors' ? '+' : ''}
                  </div>
                  <div className="text-gray-700 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Doctors Section */}
      <section className="py-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4">
              Our Expert Doctors
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-700 max-w-3xl mx-auto">
              Meet our team of highly qualified and experienced doctors.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {topDoctors.map((doctor, index) => (
              // Show all 16 doctors on desktop (4x4 grid)
              // Show only first 8 doctors on mobile (4x2 grid)
              <Card key={doctor.id} className={`border-2 border-indigo-500 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg ${index >= 8 ? 'hidden md:block' : ''}`}>
                <CardContent className="p-3 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="relative">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-transparent shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/doctors/default-doctor.jpg';
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-black mb-1">{doctor.name}</h3>
                  <p className="text-gray-700 font-medium mb-2 text-xs uppercase tracking-wider">{doctor.specialization}</p>
                  <div className="inline-block bg-amber-100 text-black px-2 py-1 rounded-full text-xs font-semibold">
                    {doctor.experience} years exp
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white border-y-4 border-amber-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-shrink-0 flex justify-center md:justify-start w-full md:w-1/3">
            <img
              src="/director.jpg"
              alt="Managing Director of Aditya Hospital"
              className="w-48 h-48 md:w-96 md:h-96 rounded-full object-cover shadow-lg border-4 border-indigo-500"
            />
          </div>
          <div className="w-full md:w-2/3">
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4 text-justify" style={{ WebkitTextStroke: '0.5px #6b7280' }}>
              <span className="block text-center">Welcome to Aditya Hospital</span>
            </h2>
            <p className="text-md text-gray-700 mb-4 text-justify">
              Where your health and well-being are our top priorities.
              Our dedicated team of medical professionals is committed to providing compassionate,
              high-quality care using the latest advancements in healthcare. We believe in treating
              every patient with respect, empathy, and personalized attention.
            </p>
            <p className="text-md text-gray-600 mb-6 text-justify">
              Thank you for trusting us with your healthcare needs. We look forward to serving you
              and your family with excellence and integrity.
            </p>
            <div>
              <span className="block font-semibold text-black text-lg">Dr. Joyprakash Nath</span>
              <span className="block text-gray-600">Managing Director(C.M.D), Aditya Hospital</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Gallery Section */}
      <section className="py-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-lg text-black max-w-3xl mx-auto">
              Take a tour of our facilities and comfortable environment designed for your well-being.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/extras/p1.webp" 
                alt="Hospital Exterior" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/extras/p2.webp" 
                alt="Emergency Room" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/extras/p3.webp" 
                alt="Operation Theater" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/extras/p5.webp" 
                alt="Diagnostic Lab" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/extras/p6.webp" 
                alt="Waiting Area" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/extras/p7.webp" 
                alt="Waiting Area" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-indigo-400 to-orange-400 rounded-3xl p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-black" style={{ WebkitTextStroke: '0.3px white' }}>
              Experience Better Healthcare
            </h2>
            <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
              Book your appointment today and take the first step towards
              better health with our expert medical team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg" className="bg-white hover:bg-indigo-600 text-lg px-8 py-6 text-black border-2 border-green-700">
                <Link to="/appointments">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white hover:bg-indigo-600 text-lg px-8 py-6 text-black border-2 border-stone-700">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};