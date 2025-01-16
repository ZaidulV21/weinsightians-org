import React from 'react';
import Page1 from "../components/Page1"
import Page2 from "../components/Page2"
import Page3 from "../components/Page3"
import Page4 from "../components/Page4"
import Page5 from "../components/Page5"
import Footer from "../components/Footer"

const Home = () => {
  return (
    <>
      <Page1/>
      <Page2/>
      <Page3/>
      <Page4/>
      <Page5/>
      <div className='px-4 md:px-16'>
        <Footer/>
        </div>
    </>
  );
};

export default Home;

