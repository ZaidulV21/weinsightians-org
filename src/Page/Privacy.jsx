import React from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';

const LAST_UPDATED = '26 September 2026';

const SECTIONS = [
  {
    id: 'introduction',
    number: '1',
    title: 'Introduction',
    paragraphs: [
      'This Privacy Policy explains how We Insightians collects, uses, and protects information when you visit https://weinsightian.tech or choose to contact us. We built this page to be read, not to be skipped, so it is written in plain language and organised section by section.',
      'By using this website you are agreeing to the handling of your information as described here. If you have any question about anything below, email us at support@weinsightian.tech and we will explain it in plain terms.',
    ],
  },
  {
    id: 'information-we-collect',
    number: '2',
    title: 'Information We Collect',
    intro:
      'We keep the amount of information we hold deliberately small. In practice, that falls into two groups: what you choose to send us, and what the technical setup of the website records automatically.',
    blocks: [
      {
        heading: 'Information you provide directly',
        paragraphs: [
          'When you submit our contact form, we receive the details you type into it. As the form is currently built, that means:',
        ],
        list: [
          'Your name.',
          'Your email address, so we can reply to you.',
          'A description of your project, in your own words.',
          'The services you select as being of interest, if you select any.',
        ],
        after:
          'We only ask for the fields the form actually contains. If the form changes in future, this section will be updated to match it.',
      },
      {
        heading: 'Information collected automatically',
        paragraphs: [
          'Like almost all websites, our hosting infrastructure records basic request data so the site can be delivered and kept running. This typically includes your IP address, the browser and operating system you are using, the page you requested, the page you came from, and the date and time of the request.',
          'We also use Google Search Console, which we employ to check that the site is indexed correctly by search engines and to monitor site performance. It is a search and indexing tool, not a general visitor-tracking or behavioural analytics system.',
        ],
      },
    ],
  },
  {
    id: 'how-we-use-information',
    number: '3',
    title: 'How We Use Information',
    paragraphs: [
      'We use the information described above for ordinary, necessary business purposes:',
    ],
    list: [
      'Responding to enquiries and answering your questions.',
      'Communicating with you about a project or service you have asked about.',
      'Discussing the services you are interested in and providing the information you have requested.',
      'Delivering the website and keeping it secure and available.',
      'Maintaining internal business records where we need to, for example invoices or project agreements.',
      'Improving the content and structure of the website based on how it performs in search results.',
    ],
    after:
      'We do not use your information for anything unrelated to running our business and our website, and we do not sell your personal information.',
  },
  {
    id: 'contact-forms',
    number: '4',
    title: 'Contact Forms and Communications',
    paragraphs: [
      'Our contact form is optional. We collect nothing from you until you choose to fill it in and submit it.',
      'When you submit the form, the details you entered are transmitted to a third-party email delivery service that we have configured to deliver your message to our business inbox. That provider processes the message on our behalf so that we can receive and answer it.',
      'If you ask us to keep you updated about our services, we will contact you by email for that purpose. Every email we send is practical and business-related, and you can ask us to stop at any time.',
    ],
  },
  {
    id: 'cookies',
    number: '5',
    title: 'Cookies and Similar Technologies',
    paragraphs: [
      'A cookie is a small text file placed on your device by a website. Cookies and similar technologies can be used for many different purposes, and it is worth being specific about which ones this website relies on.',
      'At present this website depends only on the essential technologies required for it to load and function correctly. We are not running Google Analytics, and no analytics cookies are being set on this site today.',
      'We may introduce analytics or marketing technologies in a future phase. If we do, we will update this section to name them, explain what each one is used for, and configure them properly, including any consent mechanism that turns out to be required, before they start collecting anything.',
      'You can also control or delete cookies through your own browser settings at any time. Because the site currently relies on only essential technologies, blocking cookies should not prevent you from reading any page.',
    ],
  },
  {
    id: 'third-party-services',
    number: '6',
    title: 'Third-Party Services',
    paragraphs: [
      'Some parts of this website depend on external providers. They process information only to the extent needed to deliver the part of the service they provide, and they do so under their own terms and privacy policies:',
    ],
    list: [
      'Our hosting and file-delivery provider, which stores the website and serves its pages to visitors.',
      'Our email delivery provider, which relays contact form submissions to our inbox.',
      'Google Search Console, which we use for search indexing and site performance monitoring.',
    ],
  },
  {
    id: 'data-sharing',
    number: '7',
    title: 'Data Sharing',
    paragraphs: [
      'We do not sell, rent, or trade your personal information. We also do not hand it over to third parties for their own marketing purposes.',
      'We share information with a service provider only where that provider needs it to perform a function for us, as described in the section above. We may also disclose information where we are legally required to do so, or where disclosure is necessary to protect our rights, our clients, or the safety of the site.',
    ],
  },
  {
    id: 'data-retention',
    number: '8',
    title: 'Data Retention',
    paragraphs: [
      'We keep personal information only for as long as it is useful for the purpose it was collected, or as long as we are required to keep it.',
      'In practice, that means correspondence with a prospective or existing client is retained while the conversation is active and for a reasonable period afterwards, so we have a record of what was agreed. Enquiries that do not become projects are not kept indefinitely. If you ask us to delete your information, we will do so, subject to any record-keeping we are legally obliged to maintain.',
    ],
  },
  {
    id: 'data-security',
    number: '9',
    title: 'Data Security',
    paragraphs: [
      'We take reasonable and appropriate measures to protect the information on this site. The website is served over HTTPS, access to the business email account that receives contact form submissions is restricted, and we do not store payment card details on this website at all.',
      'No online system can be described as completely risk-free, and we will not claim otherwise. What we can say is that we treat the information you send us as confidential, we limit who has access to it, and we review the services we rely on.',
    ],
  },
  {
    id: 'your-rights',
    number: '10',
    title: 'Your Privacy Rights',
    paragraphs: [
      'You stay in control of the information you have given us, and you can ask us to act on it. Depending on where you live, you may also have rights under the privacy laws that apply to you.',
      'Where it applies to information we hold about you, you can ask us to:',
    ],
    list: [
      'Tell you what information we hold about you, and provide a copy.',
      'Correct anything that is inaccurate or out of date.',
      'Delete information we no longer have a reason to keep.',
      'Restrict or object to how we are using your information.',
      'Withdraw consent, where you gave it, for any future processing.',
    ],
    after:
      'To make any of these requests, email support@weinsightian.tech. We will respond, and we will ask for enough information to identify you and your request before we act on it. If a request is straightforward we will handle it as quickly as we can; if we need to check something with a service provider first, we will tell you that.',
  },
  {
    id: 'childrens-privacy',
    number: '11',
    title: "Children's Privacy",
    paragraphs: [
      'This website is a business website and is not directed at children. We do not knowingly collect personal information from anyone under the age of 18, and we do not knowingly offer services to children.',
      'If you believe a child has sent us personal information through the contact form, email support@weinsightian.tech and we will delete it.',
    ],
  },
  {
    id: 'changes',
    number: '12',
    title: 'Changes to This Privacy Policy',
    paragraphs: [
      'We will update this page from time to time, and the "Last updated" date at the top will always reflect the current version.',
      'The most likely reason for a change is that the website itself changes, for example if we add analytics tools or change how the contact form delivers mail. Whenever a material change affects how information is handled, we will update this policy to describe it accurately.',
    ],
  },
  {
    id: 'contact-us',
    number: '13',
    title: 'Contact Us',
    paragraphs: [
      'If anything in this policy is unclear, or if you would like to exercise one of the rights described above, get in touch.',
    ],
    contact: true,
  },
];

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | We Insightians</title>
        <meta
          name="description"
          content="How We Insightians collects, uses, and protects information when you visit our website or contact us, and the rights you have over that information."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://weinsightian.tech/privacy" />
        <meta property="og:title" content="Privacy Policy - We Insightians" />
        <meta
          property="og:description"
          content="How We Insightians collects, uses, and protects information when you interact with our website."
        />
        <meta property="og:url" content="https://weinsightian.tech/privacy" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="We Insightians" />
        <meta name="twitter:card" content="summary" />
      </Helmet>

      <div className="flex min-h-screen w-full flex-col bg-white px-5 font-[gilroy] text-[#242424] md:px-10 lg:px-16">
        <section className="w-full pt-12 sm:pt-16 lg:pt-24" aria-labelledby="privacy-title">
          <p className="font-[heligthon] text-xl text-[#a380ed] sm:text-2xl">We Insightians</p>
          <h1
            id="privacy-title"
            className="mt-3 text-5xl font-[larken] leading-[1.05] tracking-tight text-[#242424] sm:text-6xl lg:text-7xl"
          >
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
            How We Insightians collects, uses, and protects information when you interact with our
            website.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Last updated: <span className="text-gray-700">{LAST_UPDATED}</span>
          </p>
          <div className="mt-8 h-px w-16 bg-[#a380ed]" aria-hidden="true" />
        </section>

        <section className="w-full flex-1 py-12 sm:py-16" aria-label="Privacy Policy sections">
          <div className="max-w-3xl">
            {SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-28 border-t border-zinc-200 py-8 first:border-t-0 first:pt-0 sm:py-10"
              >
                <h2
                  id={`${section.id}-title`}
                  className="flex items-baseline gap-3 text-xl leading-snug text-[#242424] sm:text-2xl"
                >
                  <span className=" text-xl text-[#a380ed] sm:text-2xl">
                    {section.number}
                  </span>
                  {' '}
                  <span className="font-[larken]">{section.title}</span>
                </h2>

                {section.intro ? (
                  <p className="mt-4 text-base leading-[1.85] text-gray-700 sm:text-[1.0625rem]">
                    {section.intro}
                  </p>
                ) : null}

                {section.paragraphs
                  ? section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="mt-4 text-base leading-[1.85] text-gray-700 sm:text-[1.0625rem]"
                      >
                        {paragraph}
                      </p>
                    ))
                  : null}

                {section.blocks
                  ? section.blocks.map((block) => (
                      <div key={block.heading} className="mt-6">
                        <h3 className="text-base font-bold text-[#242424] sm:text-lg">{block.heading}</h3>
                        {block.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph.slice(0, 40)}
                            className="mt-3 text-base leading-[1.85] text-gray-700 sm:text-[1.0625rem]"
                          >
                            {paragraph}
                          </p>
                        ))}
                        {block.list ? (
                          <ul className="mt-4 space-y-2.5 border-l-2 border-[#a380ed]/30 pl-5">
                            {block.list.map((item) => (
                              <li
                                key={item}
                                className="text-base leading-[1.8] text-gray-700 sm:text-[1.0625rem]"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {block.after ? (
                          <p className="mt-4 text-base leading-[1.85] text-gray-700 sm:text-[1.0625rem]">
                            {block.after}
                          </p>
                        ) : null}
                      </div>
                    ))
                  : null}

                {section.list ? (
                  <ul className="mt-5 space-y-2.5 border-l-2 border-[#a380ed]/30 pl-5">
                    {section.list.map((item) => (
                      <li key={item} className="text-base leading-[1.8] text-gray-700 sm:text-[1.0625rem]">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.after ? (
                  <p className="mt-5 text-base leading-[1.85] text-gray-700 sm:text-[1.0625rem]">
                    {section.after}
                  </p>
                ) : null}

                {section.contact ? (
                  <div className="mt-6 max-w-xl rounded-2xl border border-zinc-200 bg-[#a380ed]/[0.04] p-6 sm:p-7">
                    <dl className="space-y-4 text-base">
                      <div>
                        <dt className="text-sm text-gray-500">Email</dt>
                        <dd className="mt-1">
                          <a
                            href="mailto:support@weinsightian.tech"
                            className="rounded-sm font-bold text-[#6B50A2] underline decoration-[#a380ed]/50 underline-offset-4 transition-colors duration-300 hover:text-[#4a2fa8] hover:decoration-[#a380ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a380ed] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                          >
                            support@weinsightian.tech
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Website</dt>
                        <dd className="mt-1">
                          <a
                            href="https://weinsightian.tech"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-sm font-bold text-[#6B50A2] underline decoration-[#a380ed]/50 underline-offset-4 transition-colors duration-300 hover:text-[#4a2fa8] hover:decoration-[#a380ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a380ed] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                          >
                            weinsightian.tech
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Business address</dt>
                        <dd className="mt-1 text-gray-700">
                          Matiyari, Lucknow, Uttar Pradesh - 226028, India
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </section>

        <div className="mt-auto w-full pb-6">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Privacy;
