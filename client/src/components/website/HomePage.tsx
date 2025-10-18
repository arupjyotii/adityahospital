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

  // Hardcoded top 6 doctors data
  const topDoctors = [
    {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      specialization: 'Cardiologist',
      experience: 15,
      image: '/doctors/doc1.png'
    },
    {
      id: '2',
      name: 'Dr. Priya Sharma',
      specialization: 'Orthopedic Surgeon',
      experience: 12,
      image: '/doctors/doc2.png'
    },
    {
      id: '3',
      name: 'Dr. Amit Das',
      specialization: 'General Physician',
      experience: 10,
      image: '/doctors/doc3.png'
    },
    {
      id: '4',
      name: 'Dr. Sunita Devi',
      specialization: 'Pediatrician',
      experience: 8,
      image: '/doctors/doc4.png'
    },
    {
      id: '5',
      name: 'Dr. Manoj Singh',
      specialization: 'Neurologist',
      experience: 14,
      image: '/images/doctors/default-doctor.jpg'
    },
    {
      id: '6',
      name: 'Dr. Nisha Patel',
      specialization: 'Gynecologist',
      experience: 9,
      image: '/images/doctors/default-doctor.jpg'
    }
  ];

  const stats = [
    { number: 25, label: 'Specialist Doctors' },
    { number: 10000, label: 'Happy Patients' },
    { number: 8, label: 'Years Experience' },
    { number: departments.length, label: 'Medical Departments' }
  ];

  const serviceNames = services.slice(0, 8).map(service => service.name);

  return (
    <div className="bg-amber-50">
      <SEO 
        title="Aditya Hospital - Best Multispeciality Hospital in Nagaon, Assam"
        description="Aditya Hospital is the leading multispeciality hospital in Nagaon, Assam. We provide world-class healthcare services with 24/7 emergency care, expert doctors, and advanced medical technology."
        keywords="hospital nagaon, multispeciality hospital assam, emergency care nagaon, doctors nagaon, healthcare assam, medical treatment nagaon, aditya hospital, best hospital nagaon"
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
              <div className="inline-flex items-center px-4 py-2 bg-indigo-500 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-stone-800">
                <Star className="w-4 h-4 mr-2 text-white" />
                Trusted by 10,000+ Patients
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                #1 Hospital
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700">
                  {' '}
                </span>
                {' '}in Nagaon Assam
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
      <section className="py-10 bg-white border-y-4 border-amber-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const { count, elementRef } = useCountAnimation(stat.number);
              return (
                <div key={index} ref={elementRef} className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold mb-2 text-black">
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
              Meet our team of highly qualified and experienced doctors dedicated to providing exceptional healthcare.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topDoctors.map((doctor) => (
              <Card key={doctor.id} className="border-2 border-indigo-500 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/doctors/default-doctor.jpg';
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-black mb-1">{doctor.name}</h3>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4 text-justify">
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
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-md text-gray-700 max-w-3xl mx-auto">
              Take a tour of our state-of-the-art facilities and comfortable environment designed for your well-being.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/images/hospital/hospital-exterior.jpg" 
                alt="Hospital Exterior" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/images/hospital/emergency-room.jpg" 
                alt="Emergency Room" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/images/hospital/operation-theater.jpg" 
                alt="Operation Theater" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/images/hospital/patient-room.jpg" 
                alt="Patient Room" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/images/hospital/diagnostic-lab.jpg" 
                alt="Diagnostic Lab" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="/images/hospital/waiting-area.jpg" 
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-black">
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