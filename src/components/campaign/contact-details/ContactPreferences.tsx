import React from 'react';
import { MapPin, Clock, Globe, Bell } from 'lucide-react';
import type { ContactDetails } from '../../../types/contact';

interface ContactPreferencesProps {
  details: ContactDetails;
}

export function ContactPreferences({ details }: ContactPreferencesProps) {
  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-600">
          Location & Preferences
        </h3>
      </div>

      <div className="px-6 pt-1 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Information */}
        <div className="space-y-6">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 dark:text-dark-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400">Location</h4>
              <p className="mt-1 text-base text-gray-900 dark:text-dark-600">
                {details.city && details.state 
                  ? `${details.city}, ${details.state}`
                  : 'Location not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <Globe className="w-5 h-5 text-gray-400 dark:text-dark-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400">Language</h4>
              <p className="mt-1 text-base text-gray-900 dark:text-dark-600">
                {details.preferred_language === 'en-us' ? 'English (US)' : details.preferred_language}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <Clock className="w-5 h-5 text-gray-400 dark:text-dark-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400">Time Zone</h4>
              <p className="mt-1 text-base text-gray-900 dark:text-dark-600">
                {details.time_zone}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="space-y-4">
          <div className="flex items-start">
            <Bell className="w-5 h-5 text-gray-400 dark:text-dark-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400">Contact Status</h4>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  details.do_not_contact
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                }`}>
                  {details.do_not_contact ? 'Do Not Contact' : 'Available for Contact'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400 mb-2">Contact Windows</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-dark-400">Call Window</span>
                <p className="text-sm text-gray-900 dark:text-dark-600">
                  {details.call_contact_window.join(', ')}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-dark-400">SMS Window</span>
                <p className="text-sm text-gray-900 dark:text-dark-600">
                  {details.sms_contact_window.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}