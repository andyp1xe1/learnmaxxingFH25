type WorkStepProps = {
    number: string;
    title: string;
    description: string;
    gradient: string;
};

function WorksStep({ number, title, description, gradient }: WorkStepProps) {
    return (
        <div className="font-inter text-center">
        <div className={`w-20 h-20 ${gradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <span className="text-2xl font-bold text-white">{number}</span>
        </div>
        <h3 className="font-playfair text-2xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 text-lg">{description}</p>
        </div>
    );
}
export default WorksStep;