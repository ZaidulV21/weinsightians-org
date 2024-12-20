import React from "react";

const Card = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div
                className="relative bg-white rounded-[30px] shadow-lg p-8 w-[400px] curved"

            >
                {/* Card Content */}
                <h2 className="text-purple-600 text-2xl font-semibold mb-4">Qualified team</h2>
                <p className="text-gray-600 leading-relaxed">
                    We delve deep into your business target audience, and competitive landscape. Armed with this
                </p>

                {/* Arrow Button */}
                <div className="absolute bottom-4 right-4">
                    <div className="h-12 w-12 bg-white rounded-full border-2 flex items-center justify-center shadow-md hover:rotate-45 transition-transform duration-300">
                        <img
                            src="/right-arrow.png"
                            alt="Arrow"
                            className="h-6 w-6"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
