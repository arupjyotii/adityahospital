import * as React from 'react';
import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    department: '',
    doctor: '',
    reason: '',
    insurance: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Oncology',
    'Surgery',
    'Emergency Medicine',
    'Diagnostic Imaging',
    'General Medicine'
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', date: '', time: '',
        department: '', doctor: '', reason: '', insurance: '', notes: ''
      });
    }, 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const benefits = [
    'Easy online booking system',
    'Flexible appointment scheduling',
    'Reminder notifications',
    'Quick rescheduling options',
    'Digital health records',
    'Secure patient portal'
  ];

  return (
    <div className="bg-white">
      <SEO 
        title="Book Appointment - Aditya Hospital Nagaon"
        description="Book your medical appointment online at Aditya Hospital. Schedule consultations with our specialist doctors for quality healthcare services in Nagaon, Assam. Easy online booking available."
        keywords="book appointment nagaon, online appointment hospital, medical consultation nagaon, doctor appointment assam, healthcare booking"
        url="https://adityahospitalnagaon.com/appointments"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Appointment</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Schedule your appointment with our expert medical team. 
            We offer flexible scheduling and personalized care for all your healthcare needs.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Form */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-blue-100/90">
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Schedule Appointment</h2>
                      <p className="text-gray-600">
                        Fill out the form below to book your appointment. We'll confirm your booking within 24 hours.
                      </p>
                    </div>

                    {isSubmitted ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-green-800 mb-2">Appointment Booked!</h3>
                        <p className="text-green-700 mb-4">
                          Thank you for booking your appointment. We've sent a confirmation email with details.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                          <h4 className="font-semibold text-green-800 mb-2">Appointment Details:</h4>
                          <p className="text-green-700 text-sm">
                            <strong>Date:</strong> {formData.date}<br />
                            <strong>Time:</strong> {formData.time}<br />
                            <strong>Department:</strong> {formData.department}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                              First Name *
                            </Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              required
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="Enter your first name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                              Last Name *
                            </Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              required
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Enter your last name"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              placeholder="Enter your email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                              Phone Number *
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                              Preferred Date *
                            </Label>
                            <Input
                              id="date"
                              name="date"
                              type="date"
                              required
                              value={formData.date}
                              onChange={handleChange}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                              Preferred Time *
                            </Label>
                            <Select value={formData.time} onValueChange={(value) => handleSelectChange('time', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                              Department *
                            </Label>
                            <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="insurance" className="text-sm font-medium text-gray-700">
                              Insurance Provider
                            </Label>
                            <Input
                              id="insurance"
                              name="insurance"
                              value={formData.insurance}
                              onChange={handleChange}
                              placeholder="Enter insurance provider"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                            Reason for Visit *
                          </Label>
                          <Input
                            id="reason"
                            name="reason"
                            required
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Brief description of your symptoms or reason for visit"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                            Additional Notes
                          </Label>
                          <Input
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any additional information you'd like us to know"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 text-white"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Booking Appointment...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Book Appointment</span>
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <Card className="border-0 shadow-lg bg-blue-100/90">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">+91 8638559875 / +91 8099983875</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">info@adityahospitalnagaon.com</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Mon-Fri: 8AM-8PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="border-0 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-800">Emergency?</h3>
                    </div>
                    <p className="text-red-700 text-sm mb-3">
                      For medical emergencies, call our 24/7 emergency line immediately.
                    </p>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Emergency
                    </Button>
                  </CardContent>
                </Card>

                {/* What to Bring */}
                <Card className="border-0 shadow-lg bg-blue-100/90">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Bring</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Photo ID</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Insurance card</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>List of medications</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Medical records</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Have Questions About Your Appointment?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our friendly staff is here to help you with any questions or concerns 
              about scheduling, preparation, or your visit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                <a href="/contact">Contact Us</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                <a href="tel:+91 8638559875">Call Now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
