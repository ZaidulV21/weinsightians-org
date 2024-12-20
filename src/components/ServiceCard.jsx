import React from 'react';


const services = [
    {
        title: 'Web Design',
        description: "We don't believe in one-size-fits-all solutions. Our design process starts with understanding your brand's unique identity, goals, and target audience. We then create a custom design."
    },
    {
        title: 'Graphic Design',
        description: "In a world where mobile devices dominate, having a well-designed app is essential for engaging customers and growing your business.",
        active: true
    },
    {
        title: 'Motion Graphic',
        description: "Whether you're looking to enhance your marketing videos, create stunning visual content for social media, or develop compelling animations for your website."
    },
    {
        title: 'Illustration',
        description: "We specialize in crafting unique, eye-catching illustrations that elevate your brand and engage your audience. Whether you need custom artwork for your marketing."
    }
];

const ServiceCard = ({ title, description, active }) => {
    return (
        <div className={` rounded-lg p-6 bg-[#F8F7FA] w-full max-w-xl ${active ? 'border-purple-500' : 'border-gray-300'} bg-white flex`}>
            <div className="w-1/3">
                <div className='flex flex-col '>
                    <h3 className="text-lg font-semibold border-2 border-zinc-400  rounded-full px-2 py-2 text-gray-800">{title}  <img className='h-10' src="../../public/diagonal-arrow-right-down.png" alt="" /></h3>
                   
                </div>
            </div>
            <div className="w-2/3">
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <>
            {services.map((service, index) => (
                <ServiceCard
                    key={index}
                    title={service.title}
                    description={service.description}
                    active={service.active}
                />
            ))}
        </>
    );
};

export default App;
