import * as React from 'react';
import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91 6001394372 / +91 8099983875'],
      color: 'text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@adityahospitalnagaon.com', 'adityahospital123@gmail.com'],
      color: 'text-green-600'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: ['Medical College Road, Diphalu, Nagaon - 782003'],
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['Monday - Friday: 8:00 AM - 8:00 PM', 'Saturday: 9:00 AM - 6:00 PM', 'Sunday: 10:00 AM - 4:00 PM'],
      color: 'text-orange-600'
    }
  ];

  const departments = [
    'Emergency Department',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Oncology',
    'Surgery',
    'Diagnostic Imaging'
  ];

  return (
    <div className="bg-white">
      <SEO 
        title="Contact Us - Aditya Hospital Nagaon"
        description="Contact Aditya Hospital for appointments, inquiries, or emergency care. Located at Medical College Road, Diphalu, Nagaon - 782003. Call +91 6001394372 for immediate assistance."
        keywords="contact aditya hospital, hospital nagaon contact, emergency care nagaon, medical appointment nagaon, hospital address diphalu"
        url="https://adityahospitalnagaon.com/contact"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to help and answer any questions you might have.
            Reach out to us and we'll respond as soon as we can.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-blue-100/90">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <info.icon className={`w-8 h-8 ${info.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-sm text-gray-600">{detail}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {isSubmitted ? (
                <Card className="border-0 bg-green-50">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-700">
                      Thank you for contacting us. We'll get back to you soon.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full text-black"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full text-black"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full text-black"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full text-black"
                        placeholder="What is this about?"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Message *
                    </Label>
                    <Input
                      id="message"
                      name="message"
                      type="textarea"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full min-h-[120px] text-black"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending Message...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-white">
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              <div className="bg-gray-200 rounded-2xl h-80 flex items-center justify-center  overflow-hidden">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3574.7736141963383!2d92.7020405751273!3d26.36618328336437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x374521be8c90644d%3A0x2bba5ac314e101fe!2zQURJVFlBIEhPU1BJVEFMKOCmhuCmpuCmv-CmpOCnjeCmryDgprngprjgp43gpqrgpr_gpqTgpr7gprIp!5e0!3m2!1sen!2sin!4v1756729031684!5m2!1sen!2sin" 
              className="w-full h-full rounded-2xl"  style={{border:0}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
               {/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3574.7736141963383!2d92.7020405751273!3d26.36618328336437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x374521be8c90644d%3A0x2bba5ac314e101fe!2zQURJVFlBIEhPU1BJVEFMKOCmhuCmpuCmv-CmpOCnjeCmryDgprngprjgp43gpqrgpr_gpqTgpr7gprIp!5e0!3m2!1sen!2sin!4v1756729031684!5m2!1sen!2sin" 
              width="500" height="450"  style={{border:0}} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe> */}
              </div>

              {/* Emergency Contact */}
              <Card className="border-0 bg-red-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-red-800 mb-3">Emergency Contact</h3>
                  <p className="text-red-700 mb-4">
                    For medical emergencies, please call our 24/7 emergency line immediately.
                  </p>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-semibold">+91 6001394372 / +91 8099983875</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-0 bg-blue-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    <a href="/appointments" className="block text-blue-700 hover:text-blue-800 text-sm">
                      Book an Appointment
                    </a>
                    <a href="/departments" className="block text-blue-700 hover:text-blue-800 text-sm">
                      View Departments
                    </a>
                    <a href="/doctors" className="block text-blue-700 hover:text-blue-800 text-sm">
                      Meet Our Doctors
                    </a>
                    <a href="/services" className="block text-blue-700 hover:text-blue-800 text-sm">
                      Our Services
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our services and policies.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-blue-100/90">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What are your operating hours?
                </h3>
                <p className="text-gray-600">
                  We're open Monday-Friday 8:00 AM - 8:00 PM, Saturday 9:00 AM - 6:00 PM,
                  and Sunday 10:00 AM - 4:00 PM. Emergency services are available 24/7.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-blue-100/90">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I schedule an appointment?
                </h3>
                <p className="text-gray-600">
                  You can schedule an appointment by calling us, using our online booking system,
                  or visiting our appointments page. We also offer same-day appointments for urgent cases.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-blue-100/90">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you accept insurance?
                </h3>
                <p className="text-gray-600">
                  Yes, we accept most major insurance plans. Please contact our billing department
                  to verify your specific coverage and benefits.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-blue-100/90">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What should I bring to my appointment?
                </h3>
                <p className="text-gray-600">
                  Please bring your ID, insurance card, list of current medications,
                  and any relevant medical records or test results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Contact us today to schedule your appointment or learn more about our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                <a href="/appointments">Book Appointment</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                <a href="tel:+91 6001394372">Call Now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
