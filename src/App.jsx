import Page1 from "./Page/Page1"
import Page2 from "./Page/Page2"
import Page3 from "./Page/Page3"
import Page4 from "./Page/Page4"
import Page5 from "./Page/Page5"
import Footer from "./components/Footer"

export default function App() {
  return (
    <div className="bg-white">
      <Page1/>
      <Page2/>
      <Page3/>
      <Page4/>
      <Page5/>
      <Footer/>
    </div>
  )
}