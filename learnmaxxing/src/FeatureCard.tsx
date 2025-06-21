import { CheckCircle } from 'lucide-react';

type FeatureCardProps = {
    icon: React.ElementType;
    title: string;
    description: string;
    features: string[];
    gradient: string;
};

function FeatureCard({ icon: Icon, title, description, features, gradient }: FeatureCardProps) {
    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <div className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center mb-6`}>
            <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-inter text-2xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="font-inter text-gray-600 mb-6 text-lg leading-relaxed">
        {description}
        </p>
        <ul className="space-y-3">
        {features.map((feature, index) => (
            <li key={index} className="font-inter flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-inter text-gray-700">{feature}</span>
            </li>
        ))}
        </ul>
    </div>
);
}
export default FeatureCard;