function WhyUs() {
  return (
    <section className="bg-teal-600 rounded-lg shadow-lg mt-8 p-8">
    <h2 className="text-3xl font-bold text-white mb-6">Why Us</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-white">
        <h3 className="text-xl font-semibold mb-2">Expert Training</h3>
        <p>Professional trainers with years of experience in dog behavior and training techniques.</p>
      </div>
      <div className="text-white">
        <h3 className="text-xl font-semibold mb-2">Personalized Approach</h3>
        <p>Customized training programs tailored to your dog's specific needs and personality.</p>
      </div>
      <div className="text-white">
        <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
        <p>Successful track record of helping dogs and their owners achieve their training goals.</p>
      </div>
    </div>
  </section>
  )
}

export default WhyUs;