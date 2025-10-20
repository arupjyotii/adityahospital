import * as React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Heart, 
  Shield,
  CheckCircle,
  Clock
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Compassion',
      description: 'We treat every patient with empathy, understanding, and genuine care.'
    },
    {
      icon: Shield,
      title: 'Excellence',
      description: 'We maintain the highest standards in medical care and patient safety.'
    },
    {
      icon: Users,
      title: 'Teamwork',
      description: 'Our multidisciplinary team works together for optimal patient outcomes.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We embrace new technologies and treatment methods to improve care.'
    }
  ];

  const milestones = [
    { year: '1999', title: 'Hospital Founded', description: 'Aditya Hospital established with 50 beds' },
    { year: '2005', title: 'Expansion', description: 'Added new wing with 100 additional beds' },
    { year: '2010', title: 'Technology Upgrade', description: 'Installed advanced medical imaging equipment' },
    { year: '2015', title: 'Recognition', description: 'Awarded Best Hospital in the region' },
    { year: '2020', title: 'Digital Transformation', description: 'Implemented electronic health records' },
    { year: '2024', title: 'Future Ready', description: 'Continuing to expand and innovate' }
  ];

  const team = [
    { name: 'Dr. Kishore Sarma', role: 'Neuro Surgeon', experience: '10+ years' },
    { name: 'Dr. Merazul Hazarika', role: 'OBS. & GYNAE', experience: '12+ years' },
    { name: 'Dr. Surajit Hazarika', role: 'Urology', experience: '7+ years' },
    { name: 'Dr. Debaraj Saikia', role: 'DIP,CARDIOLOGY', experience: '10+ years' }
  ];

  return (
    <div className="bg-white">
      <SEO 
        title="About Us - Aditya Hospital Nagaon"
        description="Learn about Aditya Hospital's 25+ years of excellence in healthcare. Discover our mission, vision, values, and commitment to providing world-class medical care in Nagaon, Assam."
        keywords="about aditya hospital, hospital history nagaon, healthcare excellence assam, medical care mission, hospital values nagaon"
        url="https://adityahospitalnagaon.com/about"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Aditya Hospital</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            For over 8 years, we have been at the forefront of healthcare innovation, 
            providing exceptional medical care with compassion and cutting-edge technology.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <Target className="w-4 h-4 mr-2" />
                Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                To provide world-class healthcare that improves lives
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We are committed to delivering exceptional medical care through innovation, 
                compassion, and excellence. Our mission is to ensure every patient receives 
                personalized, high-quality healthcare in a supportive and healing environment.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Patient-centered care approach</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Advanced medical technology</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Experienced medical professionals</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Our Vision</h3>
                  <p className="text-blue-100 leading-relaxed">
                    To be the leading healthcare institution, recognized for excellence in 
                    patient care, medical innovation, and community health improvement.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">8+</div>
                      <div className="text-sm text-blue-100">Years of Excellence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">27+</div>
                      <div className="text-sm text-blue-100">Specialist Doctors</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide everything we do and shape our culture of care.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-blue-100/90">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* History & Milestones */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Journey Through Time
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to becoming a leading healthcare institution, 
              our journey has been marked by continuous growth and innovation.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 to-purple-600"></div>
            <div className="space-y-12 ">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                    <Card className="border-0 shadow-lg bg-blue-100/90">
                      <CardContent className="p-6">
                        <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 break-words">{milestone.title}</h3>
                        <p className="text-sm sm:text-base text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our experienced leaders guide our mission to provide exceptional healthcare 
              and drive innovation in medical services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-blue-100/90">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{member.experience}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-indigo-400 to-orange-400 rounded-3xl p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-black" style={{ WebkitTextStroke: '0.3px white' }}>
              Join Us in Our Mission
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Experience the difference that 25+ years of healthcare excellence can make 
              in your life and the lives of your loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button  asChild variant="outline" size="lg" className="bg-white hover:bg-indigo-600 text-lg px-8 py-6 text-black border-2 border-green-700">
                <a href="/appointments">Book Appointment</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white hover:bg-indigo-600 text-lg px-8 py-6 text-black border-2 border-stone-700">
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
