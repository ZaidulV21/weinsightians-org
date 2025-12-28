import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectDescription: "",
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
  const [error, setError] = useState("");

  // ✅ YOUR GOOGLE SCRIPT URL
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwAYtpbVfwewZuWpB7-4vSJ5iUOFeeJ2wXfZ3ym7poYRGKjn9h354-4MVZ8ehIlG_My/exec";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        services: {
          ...prev.services,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.projectDescription) {
      setError("Please fill all required fields.");
      return;
    }

    const selectedServices = Object.keys(formData.services)
      .filter((key) => formData.services[key])
      .join(", ");

    const payload = {
      name: formData.name,
      email: formData.email,
      projectDescription: formData.projectDescription,
      services: selectedServices,
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // ✅ THIS FIXES CORS
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // ✅ Success (even though response is opaque)
      setIsSubmitted(true);

      setFormData({
        name: "",
        email: "",
        projectDescription: "",
        services: {
          websiteDesign: false,
          uxDesign: false,
          userResearch: false,
          contentCreation: false,
          strategyConsulting: false,
          other: false,
        },
      });
    } catch (err) {
      setError("Submission failed. Please try again later.");
    }
  };

  return (
    <div className="h-full font-[gilroy] w-full md:w-[60%] rounded-2xl p-10 form-top">
      {isSubmitted ? (
        <div className="md:h-[60vh] flex items-center text-center font-medium text-2xl text-black">
          Thanks for sharing your awesome ideas! We'll be in touch shortly.
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <h2 className="text-base mb-6">
            Tell us more about yourself and what you’ve got in mind.
          </h2>

          <input
            type="text"
            name="name"
            placeholder="What's your name?"
            value={formData.name}
            onChange={handleChange}
            className="outline-none text-sm p-2 bg-inherit text-black placeholder-black border-b-2 border-[#adadad]"
          />

          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            value={formData.email}
            onChange={handleChange}
            className="outline-none text-sm p-2 bg-inherit text-black placeholder-black border-b-2 border-[#adadad]"
          />

          <textarea
            name="projectDescription"
            placeholder="Tell us a little about the project..."
            value={formData.projectDescription}
            onChange={handleChange}
            className="outline-none text-sm p-2 bg-inherit text-black placeholder-black border-b-2 border-[#adadad] h-24"
          />

          <h3 className="mt-4">How can we help?</h3>

          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <label>
                <input type="checkbox" name="websiteDesign" checked={formData.services.websiteDesign} onChange={handleChange} /> Website design
              </label>
              <label>
                <input type="checkbox" name="uxDesign" checked={formData.services.uxDesign} onChange={handleChange} /> UX design
              </label>
              <label>
                <input type="checkbox" name="userResearch" checked={formData.services.userResearch} onChange={handleChange} /> User research
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label>
                <input type="checkbox" name="contentCreation" checked={formData.services.contentCreation} onChange={handleChange} /> Content creation
              </label>
              <label>
                <input type="checkbox" name="strategyConsulting" checked={formData.services.strategyConsulting} onChange={handleChange} /> Strategy & consulting
              </label>
              <label>
                <input type="checkbox" name="other" checked={formData.services.other} onChange={handleChange} /> Other
              </label>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button className="mt-6 bg-zinc-900 text-white py-2 rounded transition-all duration-500 hover:bg-zinc-700">
            Let’s get started!
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
