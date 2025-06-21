import WorksStep from "./WorkStep";
function HowItWorksSection() {
    const steps = [
        {
        number: "1",
        title: "Upload Your Material",
        description: "Import your study materials or create custom flashcards. Our AI automatically generates questions and answers.",
        gradient: "bg-gradient-to-r from-purple-500 to-pink-500"
        },
        {
        number: "2",
        title: "Choose Your Mode",
        description: "Switch between Learn Mode for comprehensive understanding and Exam Mode for test preparation.",
        gradient: "bg-gradient-to-r from-blue-500 to-indigo-500"
        },
        {
        number: "3",
        title: "Track & Improve",
        description: "Monitor your progress with detailed analytics and let our AI optimize your learning path.",
        gradient: "bg-gradient-to-r from-indigo-500 to-purple-500"
        }
    ];

    return (
        <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            How LEARNMAXXING Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our intelligent learning system adapts to your pace and style, ensuring maximum retention and understanding.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
            <WorksStep
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                gradient={step.gradient}
            />
            ))}
        </div>
        </section>
    );
    };
export default HowItWorksSection;