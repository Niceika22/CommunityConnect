import { Phone, AlertTriangle } from 'lucide-react';

export default function Emergency() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r shadow-sm mb-8">
        <div className="flex items-start">
          <AlertTriangle size={32} className="text-red-500 mr-4 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">EMERGENCY ASSISTANCE</h2>
            <p className="text-red-700 font-medium">
              IMPORTANT: This platform does NOT replace official emergency services. 
              If you or someone else is in immediate physical danger, experiencing a medical emergency, or needs police assistance, please contact your local authorities immediately.
            </p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Dial Numbers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'Police / General Emergency', number: '112 / 911' },
          { name: 'Ambulance / Medical', number: '102' },
          { name: 'Fire Department', number: '101' },
          { name: 'Women Helpline', number: '1091' }
        ].map((contact, idx) => (
          <div key={idx} className="bg-white p-6 rounded shadow flex items-center justify-between border border-gray-100">
            <div>
              <h4 className="font-bold text-gray-700">{contact.name}</h4>
              <p className="text-2xl font-bold text-red-600">{contact.number}</p>
            </div>
            <a href={`tel:${contact.number.split(' / ')[0]}`} className="bg-red-100 p-4 rounded-full text-red-600 hover:bg-red-200">
              <Phone size={24} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
