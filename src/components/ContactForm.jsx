import React, { useState } from 'react';
import emailjs from 'emailjs-com';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        projectDescription: '',
        services: {
            websiteDesign: false,
            uxDesign: false,
            userResearch: false,
            contentCreation: false,
            strategyConsulting: false,
            other: false,
        },
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData((prevData) => ({
                ...prevData,
                services: {
                    ...prevData.services,
                    [name]: checked,
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) {
            newErrors.name = 'Name is required.';
        }
        if (!formData.email) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email address is invalid.';
        }
        if (!formData.projectDescription) {
            newErrors.projectDescription = 'Project description is required.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Prepare the email data
        const servicesList = Object.entries(formData.services)
            .filter(([key, value]) => value)
            .map(([key]) => key)
            .join(', ');

        const emailData = {
            from_name: formData.name,
            from_email: formData.email,
            project_description: formData.projectDescription,
            services: servicesList,
        };

        // Send the email
        emailjs.send('service_pq5vuj7', 'template_urpnauj', emailData, 'gpseXxvd4rf_VugoR')
            .then((response) => {
                // console.log('Email sent successfully!', response.status, response.text);
                setFormData({
                    name: '',
                    email: '',
                    projectDescription: '',
                    services: {
                        websiteDesign: false,
                        uxDesign: false,
                        userResearch: false,
                        contentCreation: false,
                        strategyConsulting: false,
                        other: false,
                    },
                });
                setIsSubmitted(true);
                setErrors({});
            })
            .catch((err) => {
                console.error('Failed to send email. Error:', err);
            });
    };

    return (
        <div className='h-full font-[gilroy] w-full md:w-2/3 bg-[#6B50A2] rounded-2xl p-10'>
            <h1 className='text-5xl mt-10 mb-4'>Got ideas? We’ve got <br /> the skills. Let’s team up.</h1>
            <h2 className='text-base mb-6'>Tell us more about yourself and what you’ve got in mind.</h2>

            {isSubmitted ? (
                <div className='md:h-[60vh] flex items-center text-center font-medium text-5xl text-black'>
                    Thanks for sharing your awesome ideas! We'll be in touch shortly.
                </div>
            ) : (
                <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                    <input
                        type='text'
                        name='name'
                        placeholder="What's your name?"
                        value={formData.name}
                        onChange={handleChange}
                        className='outline-none text-sm p-2 bg-inherit text-black placeholder-black border-b-2 border-black'
                    />
                    {errors.name && <span className='text-red-500'>{errors.name}</span>}

                    <input
                        type='email'
                        name='email'
                        placeholder='you@email.com'
                        value={formData.email}
                        onChange={handleChange}
                        className='outline-none text-sm p-2 bg-inherit text-black placeholder-black border-b-2 border-black'
                    />
                    {errors.email && <span className='text-red-500'>{errors.email}</span>}

                    <textarea
                        name='projectDescription'
                        placeholder='Tell us a little about the project...'
                        value={formData.projectDescription}
                        onChange={handleChange}
                        className='outline-none text-sm p-2 bg-inherit text-black placeholder-black border-b-2 border-black h-24'
                    />
                    {errors.projectDescription && <span className='text-red-500'>{errors.projectDescription}</span>}

                    <h3 className='mt-4'>How can we help?</h3>
                    <div className='flex gap-10'>
                        <div className='flex flex-col gap-2'>
                            <label>
                                <input type='checkbox' name='websiteDesign' checked={formData.services.websiteDesign} onChange={handleChange} /> Website design
                            </label>
                            <label>
                                <input type='checkbox' name='uxDesign' checked={formData.services.uxDesign} onChange={handleChange} /> UX design
                            </label>
                            <label>
                                <input type='checkbox' name='userResearch' checked={formData.services.userResearch} onChange={handleChange} /> User research
                            </label>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label>
                                <input type='checkbox' name='contentCreation' checked={formData.services.contentCreation} onChange={handleChange} /> Content creation
                            </label>
                            <label>
                                <input type='checkbox' name='strategyConsulting' checked={formData.services.strategyConsulting} onChange={handleChange} /> Strategy & consulting
                            </label>
                            <label>
                                <input type='checkbox' name='other' checked={formData.services.other} onChange={handleChange} /> Other
                            </label>
                        </div>
                    </div>

                    <button className='mt-6 bg-zinc-900 text-white py-2 rounded transition-all duration-500 hover:bg-zinc-700'>
                        Let’s get started!
                    </button>
                </form>
            )}
        </div>
    );
};

export default ContactForm;