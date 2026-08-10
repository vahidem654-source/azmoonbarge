import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800"
        >
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              خطایی در اجرا یا بارگذاری برنامه‌ساز رخ داده است
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              احتمالاً حافظه مرورگر با داده‌های قبلی تداخل دارد یا مشکلی در خواندن اطلاعات پیش آمده است.
            </p>
            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-left text-[11px] font-mono text-slate-600 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
              >
                تلاش مجدد و بارگذاری صفحه
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                بازنشانی حافظه موقت (تنظیم مجدد)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
