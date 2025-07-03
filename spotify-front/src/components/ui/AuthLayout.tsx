import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-black fill-current"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.615c-.2.323-.65.426-.973.227-2.665-1.627-6.018-1.994-9.968-1.093-.383.088-.77-.191-.858-.574-.088-.383.191-.77.574-.858 4.292-.98 8.096-.557 11.11 1.264.322.2.426.65.227.973zm1.389-3.085c-.251.404-.787.531-1.191.28-3.052-1.877-7.703-2.42-11.313-1.326-.481.146-.99-.127-1.136-.608-.146-.481.127-.99.608-1.136 4.151-1.258 9.37-.651 12.771 1.522.404.251.531.787.28 1.191zm.12-3.213c-3.662-2.175-9.709-2.375-13.204-1.313-.577.175-1.186-.151-1.361-.728-.175-.577.151-1.186.728-1.361 4.013-1.22 10.647-.981 14.832 1.517.491.293.652.927.359 1.418-.293.491-.927.652-1.418.359z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-sm animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
