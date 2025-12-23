import * as React from 'react';
import { Wallet, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const NotFoundPage = () => {
  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl mb-6 shadow-lg">
              <Wallet size={48} color="white" />
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
              Page Not Found
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
              Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleGoHome}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  size="lg"
                >
                  <Home size={20} />
                  Go to Homepage
                </Button>
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  size="lg"
                >
                  <ArrowLeft size={20} />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>If you believe this is an error, please contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
