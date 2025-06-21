import WorksStep from "./WorkStep";
function HowItWorksSection() {
    const steps = [
        {
        number: "1",
        title: "Upload Your Material",
        description: "Import your study materials. Our AI automatically generates questions and answers.",
        gradient: "bg-[linear-gradient(to_bottom,#6a29ab,#fca95b)]"
        },
        {
        number: "2",
        title: "Choose Your Mode",
        description: "Switch between Learn Mode for comprehensive understanding and Exam Mode for test preparation.",
        gradient: "bg-[linear-gradient(to_left,#6a29ab,#fca95b)]"
        },
        {
        number: "3",
        title: "Track & Improve",
        description: "Monitor your progress with detailed analytics and let our AI optimize your learning path.",
        gradient: "bg-[linear-gradient(to_top,#6a29ab,#fca95b)]"
        }
    ];

    return (
        <section className="px-6 py-20 max-w-7xl mx-auto rounded-2xl">
        <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            How LEARNMAXXING Works
            </h2>
            <p className="font-inter text-xl text-gray-600 max-w-2xl mx-auto">
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