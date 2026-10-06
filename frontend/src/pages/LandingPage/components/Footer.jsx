import { Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='bg-white border-t border-gray-100 pt-16 pb-8'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          {/* main footer content */}
          <div className='flex flex-col md:flex-row justify-between items-center md:items-start gap-8'>
            {/*brand logo*/}
            <div className='text-center md:text-left'>
              <Link to="/" className='inline-flex items-center justify-center md:justify-start gap-3 mb-4 group cursor-pointer'>
                <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform'>
                  <Briefcase className='w-6 h-6' />
                </div>
                <h3 className='text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>JobPortal</h3>
              </Link>
              <p className={'text-sm text-gray-600 max-w-md mx-auto'}>
                connecting talented professionals with innovative companies worldwide. Your gateway to endless career opportunities.</p>
            </div>
            {/*copyright*/}
            <div className='mt-8 md:mt-0 text-center md:text-right space-y-2'>
              <p className='text-sm text-gray-600'>
                <Link
                  to='/admin-login'
                  className='text-gray-600 hover:text-blue-600 cursor-pointer transition-colors font-medium'
                  title='Admin Portal'
                >
                  &copy;
                </Link>
                {' '}{new Date().getFullYear()} Time To Program
              </p>
              <p className={'text-sm text-gray-500'}>Made With ❤️... Happy Coding</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
