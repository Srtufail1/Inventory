"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { DatabaseBackup, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import DarkModeToggle from '@/components/DarkModeToggle';
import { signOut } from "next-auth/react";

const loadingMessages = [
  "Connecting to database...",
  "Discovering collections...",
  "Reading documents...",
  "Packaging data...",
  "Preparing download...",
];

const BackupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      setElapsedSeconds(0);
      return;
    }

    const messageInterval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 2500);

    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(timerInterval);
    };
  }, [isLoading]);

  const handleBackup = async () => {
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');
    setLoadingStep(0);
    setElapsedSeconds(0);

    try {
      const response = await fetch('/api/backup');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create backup');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `zamzam-backup-${new Date().toISOString().split('T')[0]}.json`;

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}m ${secs.toString().padStart(2, '0')}s`
      : `${secs}s`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
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
          <div className="bg-muted/50 rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <DatabaseBackup className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Export Database</h2>
                <p className="text-sm text-muted-foreground">
                  Download a complete JSON backup of all data
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              This will export every collection and document in the MongoDB database
              as a single JSON file.
            </p>

            <Button
              onClick={handleBackup}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Backup
                </>
              )}
            </Button>

            {/* Loading Animation */}
            {isLoading && (
              <div className="mt-5 rounded-lg border bg-background p-5">
                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-in-out"
                    style={{
                      width: `${Math.min(((loadingStep + 1) / loadingMessages.length) * 90, 90)}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="space-y-2.5">
                  {loadingMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2.5 text-sm transition-opacity duration-500 ${
                        index > loadingStep
                          ? 'opacity-30'
                          : index === loadingStep
                          ? 'opacity-100'
                          : 'opacity-60'
                      }`}
                    >
                      {index < loadingStep ? (
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      ) : index === loadingStep ? (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <span
                        className={
                          index === loadingStep
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground'
                        }
                      >
                        {message}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Elapsed time */}
                <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
                  Elapsed: {formatTime(elapsedSeconds)}
                </div>
              </div>
            )}

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