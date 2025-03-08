import { Link } from 'react-router-dom';

function MainHeading() {
  return (
    <div 
    className="relative h-[600px] -mx-4 mb-12 flex items-center justify-center bg-cover bg-center bg-fixed"
    style={{
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=1920")'
    }}
  >
    <div className="text-center text-white max-w-4xl mx-auto px-4">
      <h1 className="text-5xl font-bold mb-6">Transform Your Dog's Behavior, Transform Your Life</h1>
      <p className="text-xl mb-8">Experience the joy of a well-trained companion. Our proven methods create lasting bonds and happy, obedient dogs that make family life even more wonderful.</p>
      <Link 
        to="/programs" 
        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Explore Our Programs
      </Link>
    </div>
  </div>
  )
}

export default MainHeading;