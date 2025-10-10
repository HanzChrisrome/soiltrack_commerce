import { useState } from "react";
import Navbar from "../../widgets/Navbar";
import { Plus, Minus, MapPin, Phone, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { inquiryService } from "../../services/inquiryService";

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInquireClick = () => {
    const inquirySection = document.getElementById("inquiry");
    if (inquirySection) {
      inquirySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setSubmitError("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await inquiryService.submitInquiry({
        user_name: formData.name,
        user_email: formData.email,
        user_inquiry: formData.message,
      });

      setSubmitSuccess(true);
      setFormData({ name: "", email: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setSubmitError("Failed to submit inquiry. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="mb-96 z-10 mt-5">
          <h1 className="text-4xl md:text-6xl font-semibold max-w-3xl leading-loose too-tight-text">
            Grow More and Waste less with{" "}
            <span className="bg-gradient-to-t from-primary to-secondary text-white px-3 py-1 rounded-xl font-bold inline-block">
              Soiltrack
            </span>
          </h1>

          <p className="mt-6 text-lg font-medium text-gray-600 max-w-3xl">
            SoilTrack is a smart farming system designed to help farmers monitor
            soil moisture and nutrient levels (NPK). With IoT-powered sensors
            and a mobile app, you’ll always know exactly what your soil needs—no
            more guesswork, no more waste.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleInquireClick}
              className="btn bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700"
            >
              Inquire Now
            </button>
            <Link to="/shop">
              <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
                View Soiltrack Shop
              </button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 w-full flex justify-center z-0">
          <img
            src="../public/BG.png"
            alt="Gradient Background"
            className="w-full h-auto"
          />
        </div>

        <div className="absolute bottom-0 w-full flex justify-center">
          <img
            src="../public/landing_image.png"
            alt="Soiltrack App Preview"
            className="w-[400px] md:w-[750px] h-auto"
          />
        </div>
      </section>

      <section className="overflow-hidden bg-gray-50 py-16">
        <div className="flex flex-col items-center mb-8">
          <span className="uppercase text-sm text-gray-500 tracking-widest">
            In partnership with
          </span>
        </div>

        {/* Infinite scrolling partners */}
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set of logos */}
            <div className="flex items-center gap-12 px-8 flex-shrink-0">
              <img
                src="../public/partners/otis.png"
                alt="Partner 1"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/appcon.png"
                alt="Partner 2"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/agriculturist.png"
                alt="Partner 3"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/otis.png"
                alt="Partner 4"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/appcon.png"
                alt="Partner 5"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>

            {/* Second set - exact duplicate */}
            <div className="flex items-center gap-12 px-8 flex-shrink-0">
              <img
                src="../public/partners/otis.png"
                alt="Partner 1"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/appcon.png"
                alt="Partner 2"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/agriculturist.png"
                alt="Partner 3"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/otis.png"
                alt="Partner 4"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/appcon.png"
                alt="Partner 5"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>

            {/* Third set - exact duplicate */}
            <div className="flex items-center gap-12 px-8 flex-shrink-0">
              <img
                src="../public/partners/otis.png"
                alt="Partner 1"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/appcon.png"
                alt="Partner 2"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/agriculturist.png"
                alt="Partner 3"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/otis.png"
                alt="Partner 4"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
              <img
                src="../public/partners/appcon.png"
                alt="Partner 5"
                className="h-12 grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Soiltrack Features Section */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-2">
              [ Soiltrack Features ]
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Everything you need to Grow
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold text-green-700">
              with Confidence
            </h2>
          </div>

          {/* Features Grid - 2x2 Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Real-Time Monitoring */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Real-Time Monitoring
                </h3>
                <p className="text-gray-600 text-sm">
                  Track soil moisture and nutrients anytime, anywhere.
                </p>
              </div>

              {/* Chart Placeholder - Replace with your actual chart image */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl mb-6 h-56 flex items-center justify-center">
                <img
                  src="../public/first_card.png"
                  alt="NPK Analytics Chart"
                  className="h-full w-full object-cover rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap gap-2 rounded-xl">
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Tracks soil nutrients in real time
                </span>
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Sends instant updates straight to phone
                </span>
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Removes guesswork in soil & crop management
                </span>
              </div>
            </div>

            {/* Automated Irrigation */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Automated Irrigation
                </h3>
                <p className="text-gray-600 text-sm">
                  Track soil moisture and nutrients anytime, anywhere.
                </p>
              </div>

              {/* Irrigation System Illustration */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl mb-6 h-56 flex items-center justify-center">
                <img
                  src="../public/second_card.png"
                  alt="NPK Analytics Chart"
                  className="h-full w-full object-cover rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap gap-2 rounded-xl">
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Activates depending on moisture threshold
                </span>
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Saves water and reduces manual labor
                </span>
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Customizable per crop type and condition
                </span>
              </div>
            </div>

            {/* AI Driven Insights */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  AI Driven Insights
                </h3>
                <p className="text-gray-600 text-sm">
                  Get personalized fertilizer and care recommendations powered
                  by AI.
                </p>
              </div>

              {/* AI Bot Illustration */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl mb-6 h-56 flex items-center justify-center">
                <img
                  src="../public/third_card.png"
                  alt="NPK Analytics Chart"
                  className="h-full w-full object-cover rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap gap-2 rounded-xl">
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Activates depending on moisture threshold
                </span>
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Saves water and reduces manual labor
                </span>
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Customizable per crop type and condition
                </span>
              </div>
            </div>

            {/* Farmer Friendly Application */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Farmer Friendly Application
                </h3>
                <p className="text-gray-600 text-sm">
                  Track soil moisture and nutrients anytime, anywhere.
                </p>
              </div>

              {/* Mobile App Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl mb-6 h-56 flex items-center justify-center">
                <img
                  src="../public/fourth_card.png"
                  alt="NPK Analytics Chart"
                  className="h-full w-full object-cover rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap gap-2 rounded-xl">
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Simple dashboard with easy visuals
                </span>
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Accessible for all farmers
                </span>
                <span className="inline-block bg-green-100 border border-green-600 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Available anytime through mobile
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Soiltrack Shop - Product Carousel */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-2">
                [ Soiltrack Shop ]
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Everything your farm needs,
              </h2>
              <h2 className="text-4xl md:text-5xl font-bold text-green-700">
                all in one place.
              </h2>
            </div>
            <Link to="/shop">
              <button className="mt-6 md:mt-0 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                View all products
              </button>
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
            {/* Product 1 */}
            <div className="bg-white border border-gray-200 p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6 items-center text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Scaffolding & Support System
                </h3>
                <p className="text-gray-600 text-sm">
                  Reliable and safe scaffolding rentals for your construction
                  needs.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <img
                  src="/images/scaffolding.jpg"
                  alt="Scaffolding & Support System"
                  className="h-56 object-contain"
                />
              </div>
            </div>

            {/* Product 2 */}
            <div className="bg-white border border-gray-200 p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6 items-center text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Demolition and Drilling Equipment
                </h3>
                <p className="text-gray-600 text-sm">
                  High-performance demolition and drilling equipment for
                  efficient project execution.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <img
                  src="/images/drilling.jpg"
                  alt="Demolition and Drilling Equipment"
                  className="h-56 object-contain"
                />
              </div>
            </div>

            {/* Product 3 */}
            <div className="bg-white border border-gray-200 p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6 items-center text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Cutting and Grinding Equipment
                </h3>
                <p className="text-gray-600 text-sm">
                  Precision cutting and grinding equipment rentals for any
                  construction task.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <img
                  src="/images/cutting.jpg"
                  alt="Cutting and Grinding Equipment"
                  className="h-56 object-contain"
                />
              </div>
            </div>

            {/* Product 4 */}
            <div className="bg-white border border-gray-200 p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6 items-center text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Welding and Metal Equipment
                </h3>
                <p className="text-gray-600 text-sm">
                  Precision cutting and grinding equipment rentals for any
                  construction task.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <img
                  src="/images/welding.jpg"
                  alt="Welding and Metal Equipment"
                  className="h-56 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12 items-center text-center">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">
              Have Question About{" "}
              <span className="bg-gradient-to-t from-primary to-secondary text-transparent bg-clip-text font-bold">
                Soiltrack?
              </span>
            </h3>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {[
              {
                question: "What is SoilTrack and how does it work?",
                answer:
                  "SoilTrack is an IoT-powered smart farming system that monitors soil moisture and nutrient levels (NPK) in real-time. Using advanced sensors placed in your fields, the system collects data and sends it directly to your mobile app, helping you make informed decisions about irrigation and fertilization.",
              },
              {
                question: "What crops can benefit from using SoilTrack?",
                answer:
                  "SoilTrack is designed to work with a wide variety of crops including rice, corn, vegetables, and other agricultural products. The system can be customized with specific moisture thresholds and nutrient requirements for different crop types, making it versatile for various farming needs.",
              },
              {
                question: "How do I install the SoilTrack sensors in my field?",
                answer:
                  "Our team provides comprehensive installation support. The sensors are designed for easy deployment and can be strategically placed throughout your fields. We'll guide you through the placement process to ensure optimal coverage and accurate readings. Professional installation services are also available upon request.",
              },
              {
                question:
                  "Can I access SoilTrack data when I'm away from my farm?",
                answer:
                  "Yes! The SoilTrack mobile application allows you to monitor your fields from anywhere with an internet connection. You'll receive real-time updates, alerts, and recommendations directly on your smartphone, so you can manage your farm even when you're not physically present.",
              },
              {
                question:
                  "What kind of support is available for SoilTrack users?",
                answer:
                  "We provide comprehensive support including installation guidance, technical assistance, and regular system updates. Our customer support team is available to help with any questions or issues you may encounter. We also offer training sessions to help you maximize the benefits of the SoilTrack system.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openFaq === index ? (
                      <Minus className="h-5 w-5 text-green-700" />
                    ) : (
                      <Plus className="h-5 w-5 text-green-700" />
                    )}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Inquiry Section */}
      <section id="inquiry" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Contact Information */}
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wider mb-2">
                [ CONTACT US ]
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Get in Touch
              </h2>

              <div className="space-y-6">
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      Get in Touch
                    </h3>
                    <p className="text-gray-600">
                      #263 Bunsuran III, Pandi, Bulacan
                    </p>
                  </div>
                </div>

                {/* Office Contact */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      Our Office
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        [ Check Below For Exact Location ]
                      </span>
                    </h3>
                    <p className="text-gray-600">0966-933-0521</p>
                    <p className="text-gray-600">0956-234-3156</p>
                    <p className="text-gray-600">soiltrack@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Logo or Brand */}
              <div className="mb-6">
                <img
                  src="../public/DARK HORIZONTAL.png"
                  alt="SoilTrack Logo"
                  className="h-8 mb-6"
                />
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Success Message */}
                {submitSuccess && (
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Your inquiry has been submitted successfully! We'll get
                      back to you soon.
                    </span>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <span className="text-sm font-medium">{submitError}</span>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <img
                src="../public/DARK HORIZONTAL.png"
                alt="SoilTrack Logo"
                className="h-8 mb-4 brightness-0 invert"
              />
              <p className="text-sm text-gray-400 mb-4 max-w-md">
                SoilTrack is a smart farming system designed to help farmers
                monitor soil moisture and nutrient levels. Grow more and waste
                less with confidence.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <span className="text-xl">f</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <span className="text-xl">𝕏</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <span className="text-xl">📷</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Shop
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Installation Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-500 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2024 SoilTrack. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Made with 💚 for Filipino Farmers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
