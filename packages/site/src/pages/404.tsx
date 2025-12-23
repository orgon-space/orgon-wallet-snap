import * as React from 'react';
import { Wallet, Home, ArrowLeft, Sparkles, Search, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-500/30 rounded-full animate-bounce"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-500/30 rounded-full animate-bounce animate-delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-indigo-500/30 rounded-full animate-bounce animate-delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce animate-delay-1500"></div>
        <div className="absolute top-1/3 right-1/2 w-2 h-2 bg-purple-400/30 rounded-full animate-bounce animate-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero section with animated logo */}
          <div className="mb-16 wallet-animate-in">
            <div className="relative inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl mb-8 shadow-2xl hover:scale-110 transition-transform duration-300 group">
              <Wallet size={64} color="white" className="group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            </div>

            {/* Large 404 with gradient text */}
            <div className="relative mb-6">
              <h1 className="text-8xl sm:text-9xl lg:text-[12rem] font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-none mb-4 animate-pulse">
                404
              </h1>
              <div className="absolute inset-0 text-8xl sm:text-9xl lg:text-[12rem] font-black text-gray-200 dark:text-gray-800 opacity-20 blur-sm">
                404
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Oops! Page Not Found
            </h2>

            <div className="flex items-center justify-center gap-2 mb-8 text-blue-600 dark:text-blue-400">
              <Search size={24} className="animate-pulse" />
              <p className="text-xl sm:text-2xl font-medium">
                This page seems to have wandered off...
              </p>
            </div>
          </div>

          {/* Description card with glass effect */}
          <Card className="glass-card border-0 shadow-2xl max-w-2xl mx-auto mb-12 wallet-animate-in animate-delay-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles size={24} className="text-yellow-500 animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  What happened?
                </h3>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                The page you're looking for might have been moved, deleted, or you might have mistyped the URL.
                Don't worry though - let's get you back on track!
              </p>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 wallet-animate-in animate-delay-400">
            <Button
              onClick={handleGoHome}
              className="group relative w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-3">
                <Home size={24} />
                <span>Go to Homepage</span>
                <Zap size={20} className="group-hover:animate-pulse" />
              </div>
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="group w-full sm:w-auto h-14 px-8 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              size="lg"
            >
              <div className="flex items-center justify-center gap-3">
                <ArrowLeft size={24} />
                <span>Go Back</span>
              </div>
            </Button>
          </div>

          {/* Footer message */}
          <div className="text-center wallet-animate-in animate-delay-600">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-slate-700/50">
              <Sparkles size={16} className="text-yellow-500 animate-pulse" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                If you believe this is an error, please contact our support team
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 dark:from-slate-900/20 to-transparent"></div>
    </div>
  );
};

export default NotFoundPage;
