import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}

      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="absolute w-96 h-96 rounded-full -top-48 -left-48 bg-blue-400/10 blur-3xl animate-float"></div>

        <div
          className="absolute w-64 h-64 rounded-full top-1/4 right-10 bg-purple-400/10 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 mb-8 border rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200/50 animate-scale-in">
              <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full animate-pulse"></div>

              <span className="text-sm font-medium text-slate-600">
                Reimagining Urban Parking
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-slide-up">
              <span className="text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text">
                Find Parking
              </span>
              <br />
              <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text">
                Anywhere
              </span>
            </h1>

            <p
              className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              Connect with parking space owners around you. Book instantly or
              list your own space to earn money. It's so simple!
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <Link
                href="/map"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:from-blue-700 hover:to-purple-700"
              >
                Find Parking Now
              </Link>
              <Link
                href="/list"
                className="bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-white hover:text-blue-600"
              >
                List Your Space
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Background Elements */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-1/3 w-96 h-96 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-full blur-3xl"></div>

        <div className="absolute right-1/4 bottom-1/3 w-96 h-96 bg-gradient-to-r from-purple-300/5 to-indigo-300/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
