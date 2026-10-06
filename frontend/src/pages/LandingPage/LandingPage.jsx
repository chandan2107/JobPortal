import React from 'react'
import Hero from './components/Hero'
import Features from './components/Features'
import Analytics from './components/Analytics'
import Header from './components/Header'
import Footer from './components/Footer'



const LandingPage = () => {
  return (
    <div className='min-h-screen'>
      <Header/>
      <Hero/>
      <Features/>
      <Analytics/>
      <Footer/>
    </div>
  )
}

export default LandingPage
