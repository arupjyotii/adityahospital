import * as React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePublicDoctors } from '@/hooks/usePublicDoctors';
import { 
  User, 
  Stethoscope, 
  Building2, 
  Mail, 
  Phone, 
  Clock, 
  ArrowRight,
  Star,
  Award,
  Calendar
} from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const { doctors, loading, error } = usePublicDoctors();

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
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
            <div className="text-red-600 text-lg mb-4">Error loading doctors</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SEO 
        title="Our Doctors - Aditya Hospital Nagaon"
        description="Meet our experienced team of specialist doctors at Aditya Hospital. Our medical professionals provide expert care in various specialties including cardiology, neurology, and surgery in Nagaon, Assam."
        keywords="doctors nagaon, specialist doctors assam, cardiologist nagaon, neurologist assam, surgeon nagaon, medical specialists, expert doctors"
        url="https://adityahospitalnagaon.com/doctors"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Doctors</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our team of experienced and dedicated healthcare professionals is committed 
            to providing you with the highest quality medical care and personalized treatment.
          </p>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {doctors.length === 0 ? (
            <div className="text-center py-20">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Doctors Available</h3>
              <p className="text-gray-600">Check back later for updates on our medical team.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor) => (
                <Card key={doctor._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group bg-blue-100/90">
                  <CardContent className="p-0">
                    {/* Doctor Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          {/* Doctor Photo */}
                          {doctor.image ? (
                            <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-white/30">
                              <img
                                src={doctor.image}
                                alt={doctor.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
                                        <span class="text-white font-semibold text-lg">
                                          ${doctor.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {doctor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Rating */}
                          <div className="text-right">
                            <div className="flex items-center text-sm">
                              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300 mr-1" />
                              <span className="font-semibold">4.9</span>
                            </div>
                            <div className="text-xs opacity-90">Patient Rating</div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">{doctor.name}</h3>
                        <div className="flex items-center text-sm opacity-90">
                          <Stethoscope className="w-4 h-4 mr-2" />
                          <span>{doctor.specialization}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Doctor Content */}
                    <div className="p-6">
                      {/* Department */}
                      {doctor.department?.name && (
                        <div className="flex items-center text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                          <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium">{doctor.department.name} Department</span>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">{doctor.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{doctor.phone}</span>
                        </div>
                        {doctor.schedule && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{doctor.schedule}</span>
                          </div>
                        )}
                      </div>

                      {/* Credentials */}
                      <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{doctor.qualification}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                          <span>{doctor.experience} Years</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center ">
                        <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-700 text-white">
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

      {/* Doctor Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Specialties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our doctors specialize in various medical fields to provide comprehensive 
              healthcare coverage for all your medical needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'general-medicine', icon: Stethoscope, title: 'General Medicine', count: doctors.filter(d => d.specialization.toLowerCase().includes('general')).length },
              { id: 'cardiology', icon: User, title: 'Cardiology', count: doctors.filter(d => d.specialization.toLowerCase().includes('cardio')).length },
              { id: 'neurology', icon: User, title: 'Neurology', count: doctors.filter(d => d.specialization.toLowerCase().includes('neuro')).length },
              { id: 'pediatrics', icon: User, title: 'Pediatrics', count: doctors.filter(d => d.specialization.toLowerCase().includes('pediatric')).length },
              { id: 'orthopedics', icon: User, title: 'Orthopedics', count: doctors.filter(d => d.specialization.toLowerCase().includes('ortho')).length },
              { id: 'dermatology', icon: User, title: 'Dermatology', count: doctors.filter(d => d.specialization.toLowerCase().includes('derm')).length },
              { id: 'ophthalmology', icon: User, title: 'Ophthalmology', count: doctors.filter(d => d.specialization.toLowerCase().includes('ophthal')).length },
              { id: 'surgery', icon: User, title: 'Surgery', count: doctors.filter(d => d.specialization.toLowerCase().includes('surg')).length }
            ].map((specialty) => (
              <Card key={specialty.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-blue-100/90">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <specialty.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{specialty.title}</h3>
                  <div className="text-2xl font-bold text-blue-600">{specialty.count}</div>
                  <div className="text-sm text-gray-600">Doctors</div>
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
              Ready to Meet Your Doctor?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Schedule an appointment with one of our expert doctors and take the first step 
              towards better health and well-being.
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