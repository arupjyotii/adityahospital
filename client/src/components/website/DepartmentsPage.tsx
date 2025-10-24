import * as React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicDepartments } from '@/hooks/usePublicDepartments';
import { 
  Users, 
  Stethoscope, 
  Building2, 
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { departments, loading, error } = usePublicDepartments();

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading departments...</p>
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
            <div className="text-red-600 text-lg mb-4">Error loading departments</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SEO 
        title="Medical Departments - Aditya Hospital Nagaon"
        description="Explore our comprehensive medical departments at Aditya Hospital. From cardiology to neurology, emergency care to pediatrics - we offer specialized healthcare services in Nagaon, Assam."
        keywords="medical departments nagaon, hospital specialties assam, cardiology nagaon, emergency care, pediatrics nagaon, neurology assam, orthopedics nagaon"
        url="https://adityahospitalnagaon.com/departments"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Departments</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our specialized medical departments, each staffed with expert healthcare 
            professionals dedicated to providing exceptional care in their respective fields.
          </p>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {departments.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Departments Available</h3>
              <p className="text-gray-600">Check back later for updates on our medical departments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {departments.map((department) => (
                <Card key={department._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-blue-100/90">
                  <CardContent className="p-0">
                    {/* Department Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <Building2 className="w-8 h-8" />
                        <div className="text-right">
                          <div className="text-sm opacity-90">Doctors</div>
                          <div className="text-2xl font-bold">0</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{department.name}</h3>
                      <div className="flex items-center text-sm opacity-90">
                        <Stethoscope className="w-4 h-4 mr-2" />
                        <span>0 Services</span>
                      </div>
                    </div>
                    
                    {/* Department Content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {department.description || 'Our dedicated team provides comprehensive care and specialized treatments in this department.'}
                      </p>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">0</div>
                          <div className="text-sm text-gray-600">Doctors</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">0</div>
                          <div className="text-sm text-gray-600">Services</div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>+91 6001394372 / +91 8099983875</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{department.name.toLowerCase().replace(/\s+/g, '')}@adityahospitalnagaon.com</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>Medical College Road, Diphalu, Nagaon - 782003</span>
                        </div>
                      </div>  

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                          <a href="/appointments">
                            Book Appointment
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </a>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                          <a href="/contact">Contact</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Need Help Choosing a Department?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our patient care coordinators are here to help you find the right department 
              and specialist for your healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                <a href="/contact">Contact Us</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                <a href="/appointments">Book Consultation</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};