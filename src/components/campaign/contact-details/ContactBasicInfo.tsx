import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { formatPhoneNumber } from '../../../utils/phone';
import type { ContactDetails } from '../../../types/contact';

interface ContactBasicInfoProps {
  details: ContactDetails;
}

export function ContactBasicInfo({ details }: ContactBasicInfoProps) {
  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-600">
          Contact Information
        </h3>
      </div>

      <div className="px-6 pt-1 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Information */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400">Full Name</h4>
            <p className="mt-1 text-base text-gray-900 dark:text-dark-600">
              {`${details.first_name} ${details.last_name}`.trim()}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400">Preferred Name</h4>
            <p className="mt-1 text-base text-gray-900 dark:text-dark-600">
              {details.preferred_name}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-start">
            <Phone className="w-5 h-5 text-gray-400 dark:text-dark-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400">Phone Number</h4>
              <p className="mt-1 text-base text-gray-900 dark:text-dark-600">
                {formatPhoneNumber(details.phone_number)}
              </p>
            </div>
          </div>

          {details.email && (
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-gray-400 dark:text-dark-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-dark-400">Email</h4>
                <p className="mt-1 text-base text-gray-900 dark:text-dark-600">
                  {details.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}