import React, { useState } from 'react'

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqData = [
    {
      question: "What services do you offer as a web development agency?",
      answer: "We offer a comprehensive range of services including website design, web application development, e-commerce solutions, UI/UX design, responsive development, and ongoing maintenance and support."
    },
    {
      question: "How long does it typically take to complete a website project?",
      answer: "Project timelines vary based on complexity and requirements. A basic website may take 4-6 weeks, while larger custom projects can take 3-6 months. We'll provide a detailed timeline during our initial consultation."
    },
    {
      question: "What is your development process like?",
      answer: "Our process includes discovery & planning, design, development, testing, and launch phases. We maintain clear communication throughout and involve clients in key decision points."
    },
    {
      question: "Do you provide website maintenance after launch?",
      answer: "Yes, we offer ongoing maintenance packages that include regular updates, security patches, backups, performance monitoring, and technical support to keep your website running smoothly."
    },
    {
      question: "What technologies do you work with?",
      answer: "We work with modern technologies including React, Node.js, PHP, WordPress, and various other frameworks and CMS platforms. We choose the best technology stack based on your specific needs."
    },
    {
      question: "What makes your agency different from others?",
      answer: "We focus on creating custom solutions tailored to each client's unique needs, emphasize clear communication, and provide ongoing support. Our experienced team stays current with the latest web technologies and best practices."
    },
      
  ]

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className='flex items-center justify-center font-[gilroy]'>
    <div className="my-16 px-8 w-2/3 bg-teal-40">
      <h2 className="text-3xl font-bold mb-10 text-center">FREQUENTLY ASKED QUESTIONS</h2>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div key={index} className="border-b border-gray-300 pb-10">
            <button
              className="w-full text-left text-lg font-semibold flex justify-between items-center"
              onClick={() => toggleAccordion(index)}
            >
              {faq.question}
              <span className="transform transition-all duration-500">
                {activeIndex === index ? '−' : '+'}
              </span>
            </button>
            <div className={`mt-2 text-gray-700 overflow-hidden transition-all duration-500 ${activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              {faq.answer}
            </div>
            
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}

export default Faq
