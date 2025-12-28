import React from "react"
import { Routes,Route } from "react-router-dom"

import Home from "./Page/Home"
import Services from "./Page/Services"
import About from "./Page/About"
import Contact from "./Page/Contact"
import Blog from "./Page/Blog"
import Privacy from "./Page/privacy"
import Sitemap from "./Page/Sitemap"

export default function App() {
  return (
    <div className="bg-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/sitemap" element={<Sitemap />} />
      </Routes>
    
    </div>
  )
}