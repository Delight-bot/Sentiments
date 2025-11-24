import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/feed');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 right-0 z-50 p-6">
        <div className="text-2xl font-bold">
          <span className="text-yellow-400">Sentiments</span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-black"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Bold Statement */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tight leading-none">
              <span className="text-white">STOP</span>
              <br />
              <span className="text-yellow-400">
                DOOMSCROLLING
              </span>
            </h1>
            <div className="h-2 w-40 bg-yellow-400 mx-auto mb-8"></div>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start Your Day with Purpose
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">
            Get personalized motivational videos powered by AI, tailored to your journey.
            Replace mindless scrolling with mindful growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              onClick={() => navigate('/signup')}
              className="bg-yellow-400 text-black px-10 py-4 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl hover:shadow-yellow-500/50"
            >
              Start Your Transformation
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-white hover:text-black transition"
            >
              Login
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Light at the End of the Tunnel Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/tunnel-light.png"
                  alt="Light at the end of tunnel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-5xl font-bold mb-6">
                <span className="text-white">There's Always</span>
                <br />
                <span className="text-yellow-400">Light At The End</span>
              </h2>
              <p className="text-xl text-white mb-6 leading-relaxed">
                No matter how dark things seem, your breakthrough is closer than you think.
                Let our AI-powered motivation guide you through the tunnel.
              </p>
              <ul className="space-y-4 text-lg">
                <li className="text-white">Personalized daily motivation</li>
                <li className="text-white">AI analyzes your unique journey</li>
                <li className="text-white">Short videos that actually matter</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Transformation Section */}
      <section className="py-24 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            <span className="text-white">Train Your</span> <span className="text-yellow-400">Mind</span> <span className="text-white">Like a Muscle</span>
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Mental fitness is the new physical fitness. Watch your mindset transform through consistent daily motivation.
          </p>
        </div>

        {/* Progress stages - Brain in the gym concept */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Stage 1 - Starting mental training */}
            <div className="relative group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/images/brain-day1.png"
                  alt="Mental clarity begins"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-yellow-400 font-bold mb-1">Day 1</div>
                  <div className="text-white text-sm">Mental Clarity</div>
                </div>
              </div>
            </div>

            {/* Stage 2 - Mindfulness & focus */}
            <div className="relative group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/images/brain-day30.png"
                  alt="Building focus"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-yellow-400 font-bold mb-1">Day 30</div>
                  <div className="text-white text-sm">Building Focus</div>
                </div>
              </div>
            </div>

            {/* Stage 3 - Mental strength */}
            <div className="relative group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/images/brain-day90.png"
                  alt="Mental resilience"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-yellow-400 font-bold mb-1">Day 90</div>
                  <div className="text-white text-sm">Mental Resilience</div>
                </div>
              </div>
            </div>

            {/* Stage 4 - Peak mindset */}
            <div className="relative group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-4 border-yellow-400">
                <img
                  src="/images/brain-day180.png"
                  alt="Peak mindset"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-yellow-400 font-bold mb-1">Day 180+</div>
                  <div className="text-white text-sm">Peak Mindset</div>
                </div>
                <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                  YOU
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate('/signup')}
            className="bg-yellow-400 text-black px-12 py-5 rounded-full font-bold text-2xl hover:scale-105 transition-transform shadow-2xl hover:shadow-yellow-500/50"
          >
            Begin Your Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black border-t border-yellow-400/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-2 text-white font-semibold">Sentiments - AI-Powered Motivation</p>
          <p className="text-sm text-yellow-400">Stop doomscrolling. Start growing.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
