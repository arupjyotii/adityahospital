import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SEO, createHospitalSchema } from '@/components/SEO';
import { usePublicDoctors } from '@/hooks/usePublicDoctors';
import { usePublicDepartments } from '@/hooks/usePublicDepartments';
import { usePublicServices } from '@/hooks/usePublicServices';
import {
  Heart,
  Shield,
  Users,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { doctors } = usePublicDoctors();
  const { departments } = usePublicDepartments();
  const { services } = usePublicServices();
  const features = [
    {
      icon: Heart,
      title: 'Patient-Centered Care',
      description: 'We prioritize your health and comfort with personalized treatment plans.'
    },
    {
      icon: Shield,
      title: 'Advanced Technology',
      description: 'State-of-the-art medical equipment and cutting-edge treatment methods.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Experienced healthcare professionals dedicated to your well-being.'
    },
    {
      icon: Clock,
      title: '24/7 Emergency Care',
      description: 'Round-the-clock emergency services when you need them most.'
    }
  ];

  const stats = [
    { number: `${doctors.length}+`, label: 'Specialist Doctors' },
    { number: '10000+', label: 'Happy Patients' },
    { number: '8+', label: 'Years Experience' },
    { number: `${departments.length}+`, label: 'Medical Departments' }
  ];

  const serviceNames = services.slice(0, 8).map(service => service.name);

  return (
    <div className="bg-white">
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-500/20 to-purple-500/20"></div>
        </div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
                <Star className="w-4 h-4 mr-2" />
                Trusted by 10,000+ Patients
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                #1 Hospital
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  {' '}
                </span>
                {' '}in Nagaon Assam
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Experience exceptional medical care with our team of expert doctors,
                state-of-the-art facilities, and compassionate patient care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 text-white">
                  <Link to="/appointments">
                    Book Appointment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-white text-black">
                  <Link to="/departments">Our Departments</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Emergency Contact</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5" />
                      <span>+91 8638559875 / +91 8099983875</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5" />
                      <span>info@adityahospitalnagaon.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5" />
                      <span>Medical College Road, Diphalu, Nagaon - 782003</span>
                    </div>
                  </div>
                  <Button className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30">
                    Call Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Aditya Hospital?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine medical excellence with compassionate care to provide you
              with the best healthcare experience possible.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-blue-100/90">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-shrink-0 flex justify-center md:justify-start w-full md:w-1/3">
            <img
              src="/director.jpg"
              alt="Managing Director of Aditya Hospital"
              className="w-96 h-96 rounded-full object-cover shadow-lg border-4 border-blue-600"
            />
          </div>
          <div className="w-full md:w-2/3">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 text-justify">
              <span className="block text-center">Welcome to Aditya Hospital</span>
            </h2>
            <p className="text-xl text-gray-700 mb-4 text-justify">
              Where your health and well-being are our top priorities.
              Our dedicated team of medical professionals is committed to providing compassionate,
              high-quality care using the latest advancements in healthcare. We believe in treating
              every patient with respect, empathy, and personalized attention.
            </p>
            <p className="text-lg text-gray-600 mb-6 text-justify">
              Thank you for trusting us with your healthcare needs. We look forward to serving you
              and your family with excellence and integrity.
            </p>
            <div>
              <span className="block font-semibold text-blue-700 text-lg">Dr. Joyprakash Nath</span>
              <span className="block text-gray-500">Managing Director(C.M.D), Aditya Hospital</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Comprehensive Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From emergency care to specialized treatments, we offer a wide range
              of medical services to meet all your healthcare needs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {serviceNames.map((service, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center gap-6 bg-white rounded-lg">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">{service}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Book your appointment today and take the first step towards
              better health with our expert medical team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                <Link to="/appointments">Book Appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
