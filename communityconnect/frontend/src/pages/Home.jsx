import { Link } from 'react-router-dom';
import { HeartHandshake, Shield, MapPin, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <HeartHandshake size={64} className="mx-auto text-blue-600 mb-6" />
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          CommunityConnect
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          Help is closer than you think. Connect with nearby service providers, volunteers, and neighbors when you need them most.
        </p>
        <div className="space-x-4">
          <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700">
            Get Started
          </Link>
          <Link to="/login" className="bg-gray-100 text-gray-800 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-200">
            Sign In
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <MapPin size={40} className="mx-auto text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Location Based</h3>
              <p className="text-gray-600">Find help or offer services in your immediate neighborhood using real-time geolocation matching.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Zap size={40} className="mx-auto text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Instant Connection</h3>
              <p className="text-gray-600">Chat with providers instantly, coordinate requirements, and track request statuses in real-time.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Shield size={40} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Verified & Secure</h3>
              <p className="text-gray-600">Trust your community. Our rating and review system ensures reliable and quality assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
