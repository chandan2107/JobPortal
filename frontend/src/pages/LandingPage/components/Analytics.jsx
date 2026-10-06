import {motion } from 'framer-motion';
import { TrendingUp, Users, Briefcase, Target } from 'lucide-react';


const Analytics = () => {

const stats = [
{
  icon: Users,
  title: 'Active Users',
  value: '2.4M+',
  growth: '+15%',
  color: 'blue'
},
{
  icon: Briefcase,
  title: 'Jobs Posted',
  value: '150K+',
  growth: '+22%',
  color: 'purple'
},
{
  icon: Target,
  title: 'Successful Hires',
  value: '850K+',
  growth: '+30%',
  color: 'green'
},
{
    icon: TrendingUp,
    title: 'Match Rate',
    value: '75%',
    growth: '+5%',
    color: 'orange'
}
];

return (
    <section className='py-20 bg-white'>  
    <div className='container mx-auto px-4'>
        <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{opacity:1, y:0}}
        transition={{ duration:0.8}}
        viewport={{ once: true}}
        className='text-center max-w-3xl mx-auto mb-16'
        ><h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Platform <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'>Analytics</span> </h2>
        <p className='text-lg text-gray-600'>Real time and data driven results that showcase the power of our platform</p>
        </motion.div>

        {/* stats cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {stats.map((stat, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{opacity:1, y:0}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true}}
                className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
                >
                    <div className='flex flex-col items-center text-center'>
                        <div className={`w-14 h-14 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                        </div>
                        <span className='text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-4'>{stat.growth}</span>
                        <h3 className='text-3xl font-bold text-gray-900 mb-2'>{stat.value}</h3>
                        <p className='text-gray-500 font-medium'>{stat.title}</p>
                    </div>
                </motion.div>
            ))}

        </div>
    </div>
    </section>
);
};

export default Analytics;