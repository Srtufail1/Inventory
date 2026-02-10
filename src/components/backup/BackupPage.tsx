"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DatabaseBackup, Download, CheckCircle, AlertCircle } from "lucide-react";
import DarkModeToggle from '@/components/DarkModeToggle';
import { signOut } from "next-auth/react";

const BackupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBackup = async () => {
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/backup');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create backup');
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `zamzam-backup-${new Date().toISOString().split('T')[0]}.json`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('success');
    } catch (error: any) {
      console.error('Backup error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-gray-100/40 px-6">
        <div className="flex items-center gap-3 w-full"></div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-center justify-between pt-3 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Database Backup
          </h1>
        </div>

        <div className="max-w-xl">
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <DatabaseBackup className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Export Database</h2>
                <p className="text-sm text-gray-500">
                  Download a complete JSON backup of all data
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This will export all Users (without passwords), Inward records, and Outward records 
              as a single JSON file.
            </p>

            <Button
              onClick={handleBackup}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              {isLoading ? 'Preparing backup...' : 'Download Backup'}
            </Button>

            {status === 'success' && (
              <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Backup downloaded successfully!</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;