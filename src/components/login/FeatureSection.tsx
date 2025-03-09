
export const FeatureSection = () => {
  return (
    <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl h-[600px] shadow-2xl">
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
          M2P Forex DB Ops
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          The DB Ops Portal streamlines card issuance with detailed review processes for Makers and Checkers, integrating with Prepaid systems for automated updates and notifications.
        </p>
        <div className="flex flex-col gap-4 mt-8">
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p>Streamlined Card Issuance</p>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p>Automated System Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};
