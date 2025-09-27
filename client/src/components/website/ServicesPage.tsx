import * as React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicServices } from '@/hooks/usePublicServices';
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Baby, 
  Bone, 
  Eye, 
  Activity, 
  Microscope,
  ArrowRight,
  Building2,
  Clock,
  CheckCircle
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { services, loading, error } = usePublicServices();

  // Service icons mapping
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('cardio') || name.includes('heart')) return Heart;
    if (name.includes('neuro') || name.includes('brain')) return Brain;
    if (name.includes('pediatric') || name.includes('child')) return Baby;
    if (name.includes('ortho') || name.includes('bone')) return Bone;
    if (name.includes('eye') || name.includes('vision')) return Eye;
    if (name.includes('dental') || name.includes('tooth')) return Activity;
    if (name.includes('lab') || name.includes('test')) return Microscope;
    return Stethoscope;
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Error loading services</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SEO 
        title="Medical Services - Aditya Hospital Nagaon"
        description="Discover comprehensive medical services at Aditya Hospital. We offer emergency care, surgery, diagnostic imaging, laboratory services, and specialized treatments in Nagaon, Assam."
        keywords="medical services nagaon, hospital services assam, emergency care, surgery nagaon, diagnostic imaging, laboratory services, ICU care nagaon"
        url="https://adityahospitalnagaon.com/services"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive healthcare services delivered with expertise, compassion, 
            and the latest medical technology to ensure your optimal health and well-being.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {services.length === 0 ? (
            <div className="text-center py-20">
              <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Available</h3>
              <p className="text-gray-600">Check back later for updates on our medical services.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const ServiceIcon = getServiceIcon(service.name);
                return (
                  <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                    <CardContent className="p-0">
                      {/* Service Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                              <ServiceIcon className="w-6 h-6" />
                            </div>
                            {service.department_name && (
                              <div className="text-right">
                                <div className="text-sm opacity-90">Department</div>
                                <div className="text-sm font-semibold">{service.department_name}</div>
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                        </div>
                      </div>
                      
                      {/* Service Content */}
                      <div className="p-6">
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {service.description || 'Our specialized team provides comprehensive care and treatment for this service area.'}
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span>Expert medical professionals</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span>Advanced medical technology</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span>Personalized care plans</span>
                          </div>
                        </div>

                        {/* Department Info */}
                        {service.department_name && (
                          <div className="flex items-center text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-lg">
                            <Building2 className="w-4 h-4 mr-2" />
                            <span>Part of {service.department_name} Department</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-700">
                            <a href="/appointments">
                              Book Service
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </a>
                          </Button>
                          <Button asChild variant="outline" className="flex-1">
                            <a href="/contact">Learn More</a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Service Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a wide range of medical services across different specialties 
              to meet all your healthcare needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         {[
               { icon: Heart, title: 'Cardiology', description: 'Heart and cardiovascular care' },
               { icon: Brain, title: 'Neurology', description: 'Brain and nervous system treatment' },
               { icon: Baby, title: 'Pediatrics', description: 'Specialized care for children' },
               { icon: Bone, title: 'Orthopedics', description: 'Bone and joint health' },
               { icon: Eye, title: 'Ophthalmology', description: 'Eye care and vision services' },
               { icon: Activity, title: 'Dental Care', description: 'Oral health and dental services' },
               { icon: Microscope, title: 'Laboratory', description: 'Diagnostic testing and analysis' },
               { icon: Stethoscope, title: 'General Medicine', description: 'Primary healthcare services' }
             ].map((category, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-blue-100/90">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Access Our Services?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Book an appointment today and experience the highest quality healthcare 
              services delivered by our expert medical team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                <a href="/appointments">Book Appointment</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
