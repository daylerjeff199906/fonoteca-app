import React, { useEffect, useState } from 'react';
import { type translations } from '../../i18n/data';
import { motion, animate } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

interface StatsChartProps {
    statsContent: typeof translations.es.stats;
    chartContent: typeof translations.es.chart;
    lang: string;
    classData?: any[];
}

const CountUp: React.FC<{ value: number }> = ({ value }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 2,
            ease: "easeOut",
            onUpdate: (latest) => setCount(Math.floor(latest))
        });
        return () => controls.stop();
    }, [value]);

    return <span>{count}</span>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050514]/90 border border-indigo-500/30 p-4 rounded-xl shadow-2xl backdrop-blur-md z-50">
        <p className="text-[10px] font-mono text-indigo-400 mb-1 uppercase tracking-widest leading-none">Category</p>
        <p className="text-white font-medium text-lg mb-2">
          {payload[0].name}
        </p>
        <div className="flex items-end gap-2">
            <span className="text-2xl font-light text-white">{payload[0].value}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Records</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Legend
const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-col gap-3">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-300 font-medium">{entry.value}</span>
            </div>
            <span className="text-white font-mono">{entry.payload.value}</span>
        </li>
      ))}
    </ul>
  );
};

export const StatsChart: React.FC<StatsChartProps> = ({ statsContent, chartContent, lang, classData = [] }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const statsList = [
        { ...statsContent.s1, value: parseInt(statsContent.s1.count) || 0 },
        { ...statsContent.s2, value: parseInt(statsContent.s2.count) || 0 },
        { ...statsContent.s3, value: parseInt(statsContent.s3.count) || 0 },
        { ...statsContent.s4, value: parseInt(statsContent.s4.count) || 0 },
        { ...statsContent.s5, value: parseInt(statsContent.s5.count) || 0 },
    ];

    const chartData = classData.map((item, index) => ({
        name: lang === 'en' ? item.title_en : lang === 'pt' ? item.title_pt : item.title_es,
        value: item.count,
        color: COLORS[index % COLORS.length]
    })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

    if (!isMounted) return <div className="h-[450px] w-full bg-[#050515]/50 animate-pulse rounded-3xl" />;

    return (
        <div className="w-full mx-auto container py-24 px-6 relative z-10">
            <div className="bg-[#050514] border border-[#1e1b4b]/50 p-8 md:p-16 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col xl:flex-row gap-12 xl:gap-8 items-center lg:items-center">
                
                {/* Decorative Glowing Orbs - Improved for App Aesthetic */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-green/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none"></div>

                {/* Left Side: Presentation and Big Stats */}
                <div className="w-full xl:w-5/12 flex flex-col justify-center relative z-10 lg:pr-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-accent-green font-black text-[10px] uppercase tracking-[0.4em] mb-6 block">
                            {chartContent.title_sm}
                        </span>
                        <h2 className="text-5xl md:text-6xl text-white font-bold tracking-tighter leading-[0.95] mb-8">
                            {chartContent.title}
                        </h2>
                        <p className="text-gray-400 text-lg font-light max-w-md mb-12 leading-relaxed">
                            {chartContent.desc}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-x-12 gap-y-10 mb-12">
                        {statsList.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="flex flex-col space-y-1"
                            >
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
                                        <CountUp value={stat.value} />
                                    </span>
                                    <span className="text-accent-green font-bold">+</span>
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.a 
                        href={`/${lang}/species`} 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        className="self-start px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-accent-green hover:border-accent-green hover:text-white transition-all cursor-pointer inline-block"
                    >
                        {chartContent.button}
                    </motion.a>
                </div>

                {/* Right Side: 3D Tilted Pie Chart */}
                <div className="h-[500px] md:h-[600px] w-full xl:w-7/12 relative z-10 flex items-center justify-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="w-full h-full relative perspective-[1000px]"
                        style={{ perspective: '1200px' }}
                    >
                        <div 
                            className="w-full h-full transform-gpu transition-transform duration-700 hover:rotate-y-[-5deg] hover:rotate-x-[5deg]"
                            style={{ 
                                transform: 'rotateX(20deg) rotateY(-15deg)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="45%"
                                        cy="50%"
                                        innerRadius={130}
                                        outerRadius={190}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={500}
                                        animationDuration={1500}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color} 
                                                className="hover:opacity-80 transition-opacity outline-none cursor-pointer"
                                                style={{ filter: `drop-shadow(0 0 20px ${entry.color}44)` }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        content={renderLegend} 
                                        layout="vertical" 
                                        verticalAlign="middle" 
                                        align="right" 
                                        wrapperStyle={{ 
                                            paddingRight: '0px',
                                            transform: 'translateZ(50px)' 
                                        }} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center text for Doughnut with 3D depth */}
                            <div 
                                className="absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                                style={{ transform: 'translateZ(80px)' }}
                            >
                                <span className="block text-6xl font-bold text-white tracking-tighter">
                                    <CountUp value={statsList[0].value} />
                                </span>
                                <span className="block text-[10px] text-accent-green font-black uppercase tracking-[0.3em] mt-2">
                                    {lang === 'es' ? 'Total Audio' : lang === 'pt' ? 'Áudio Total' : 'Total Audio'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
