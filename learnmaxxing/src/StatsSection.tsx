
function StatsSection(){
    const stats = [
        { number: "50K+", label: "Active Learners" },
        { number: "1M+", label: "Cards Studied" },
        { number: "95%", label: "Pass Rate" },
        { number: "4.9★", label: "User Rating" }
    ];

    return (
        <section className="px-6 py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
                <div key={index} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-purple-200">{stat.label}</div>
                </div>
            ))}
            </div>
        </div>
        </section>
    );
};
export default StatsSection;
