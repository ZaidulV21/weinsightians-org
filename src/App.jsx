import React from "react"
import { Routes,Route } from "react-router-dom"

import Home from "./Page/Home"
import Services from "./Page/Services"
import About from "./Page/About"


export default function App() {
  return (
    <div className="bg-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
      </Routes>
    
    </div>
  )
}