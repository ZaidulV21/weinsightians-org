import React from 'react'

const Page4 = () => {
  return (
    <div className='h-screen bg-white px-16'>
        {/* Top Content */}
        <div className='w-full h-1/3 bg-teal-500 flex flex-col justify-center items-center space-y-4'>
            <h1 className='text-xl font-semibold'>See from our client</h1>
            <h1 className='text-6xl font-semibold font-[gilroy]'>What our</h1>
            <h1 className='text-6xl font-semibold font-[gilroy] flex '><img className='h-[4vw]' src="/circle-design.png" alt="" /> Clients say</h1>
        </div>

        {/* Bottom Content */}
        <div className='w-full h-2/3 bg-amber-500 flex '>

        </div>

    </div>
  )
}

export default Page4