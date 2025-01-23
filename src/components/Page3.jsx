import React from 'react'

const Page3 = () => {
  const cardData = [
    { src: "/img/bitbar.png", brandName: "BitBar", workName: "UI/UX Design" },
    { src: "/img/code3.png", brandName: "Code3", workName: "Crypto Website Design" },
    { src: "/img/creacy.png", brandName: "Creacy", workName: "Medicine Commerce Design" },
    { src: "/img/wellplus.png", brandName: "WellPlus", workName: "Health Website Design" }
  ];

  return (
    <div className='h-screen p-5 sm:px-16'>
      <div className='w-full h-1/3 flex '>
        {/* Left Side  */}
        <div className='font-[gilroy] mt-5 w-full md:w-1/2 flex flex-col items-center md:items-start'>
          <h1 className='text-xl font-bold'>See Our Portfolio Reels</h1>
          <h1 className='text-5xl md:text-6xl mt-3'>Awesome</h1>
         <div className='flex gap-3'> 
         <img className='h-10 md:h-12' src="/circle-design.png" alt="" />
          <h1 className='text-5xl md:text-6xl '>works</h1>
         </div>
        </div>
        {/* Right Side  */}
        <div className='hidden md:flex flex-col font-[gilroy] justify-center w-full'>
          <p className='text-end mb-4'>We crafted detailed botanical illustrations to highlight the <br />natural ingredients used in the products. Each design was <br />carefully integrated into the packaging layout.</p>
          <div className='flex justify-end'>
            <button className='px-10 py-2 text-[#231746] font-semibold transition-transform-all duration-500 rounded-full border-2 bg-[#fff] hover:bg-[#534277] '>Learn More</button>
            <div className='h-12 w-12 rounded-full flex transition-all duration-500 items-center justify-center p-2 border-2 hover:rotate-45'><img src="/right-arrow-black.png" alt="" /></div>
          </div>
        </div>
      </div>

      {/* Bottom Card Content */}
      <div className='w-full h-auto flex flex-wrap justify-center mt-10 items-center font-[gilroy]'>
        <div className="h-auto w-full p-0 flex flex-nowrap overflow-x-auto scroll-snap-x mandatory gap-8">
          {cardData.map((card, index) => (
            <div className="card overflow-x-hidden h-[450px] w-full max-w-[290px] flex-shrink-0 flex-grow-0 mx-[10px] scroll-snap-start flex flex-col" key={index}>
              <div className="card1">
                <img src={card.src} alt="" className="w-full h-auto" />
              </div>
              <div className="card2 px-4 bg-[#E3E7ED]">
                <h2 className='text-[#6B50A2] font-bold text-base font-[larken]'>{card.brandName}</h2>
                <hr className="border-t border-white w-full my-4" />
                <p className="text-sm">{card.workName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Page3