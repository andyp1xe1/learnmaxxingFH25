function CTASection(){
    return (
        <section className="px-6 py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Maximize Your Learning?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
            Join thousands of students who have already transformed their study habits with LEARNMAXXING.
            </p>
            <button className="px-10 py-4 bg-white text-purple-600 rounded-xl font-bold text-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl">
            Get Started for Free
            </button>
            <p className="text-purple-200 mt-4">No credit card required • 14-day free trial</p>
        </div>
        </section>
    );
};
export default CTASection;