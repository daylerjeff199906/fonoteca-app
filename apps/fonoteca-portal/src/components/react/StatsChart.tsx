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

const data = [
    { name: 'Anfibios', value: 485, color: '#3b82f6' },      // Blue
    { name: 'Aves', value: 132, color: '#8b5cf6' },          // Purple
    { name: 'Murciélagos', value: 100, color: '#ec4899' },   // Pink
    { name: 'Grillos', value: 56, color: '#14b8a6' },        // Teal
    { name: 'Reptiles', value: 42, color: '#6366f1' },       // Indigo
];

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

export const StatsChart: React.FC<StatsChartProps> = ({ statsContent, chartContent, lang }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const statsList = [
        { ...statsContent.s1, value: parseInt(statsContent.s1.count) || 0 },
        { ...statsContent.s2, value: parseInt(statsContent.s2.count) || 0 },
        { ...statsContent.s3, value: parseInt(statsContent.s3.count) || 0 },
    ];

    if (!isMounted) return <div className="h-[450px] w-full bg-[#050515]/50 animate-pulse rounded-3xl" />;

    return (
        <div className="w-full mx-auto container py-16 px-6 relative z-10">
            <div className="bg-[#050514] border border-[#1e1b4b] p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col xl:flex-row gap-12 xl:gap-8 items-center lg:items-start">
                
                {/* Decorative Glowing Orbs behind the chart */}
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Left Side: Presentation and Big Stats */}
                <div className="w-full xl:w-5/12 flex flex-col justify-between relative z-10 lg:pr-8">
                    <div>
                        <span className="text-indigo-400 font-semibold text-xs uppercase tracking-[0.2em] mb-4 block">
                            {chartContent.title_sm}
                        </span>
                        <h2 className="text-4xl md:text-5xl text-white font-light tracking-tight leading-tight mb-6">
                            {chartContent.title}
                        </h2>
                        <p className="text-indigo-200/60 text-lg font-light max-w-md mb-10">
                            {chartContent.desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-8 mb-10">
                        {statsList.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.2 }}
                                className="flex flex-col"
                            >
                                <span className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-1">
                                    <CountUp value={stat.value} />
                                    <span className="text-accent-green">+</span>
                                </span>
                                <p className="text-sm md:text-base text-gray-400 font-light leading-snug">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <a href={`/${lang}/species`} className="self-start px-6 py-3 bg-[#11112b] border border-[#2e2b6b] text-white rounded-full text-sm font-medium hover:bg-white hover:text-black transition-colors cursor-pointer inline-block">
                        {chartContent.button}
                    </a>
                </div>

                {/* Right Side: Pie Chart */}
                <div className="h-[400px] md:h-[450px] w-full xl:w-7/12 relative z-10 flex">
                    <div className="w-full h-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="40%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={140}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color} 
                                            className="hover:opacity-80 transition-opacity outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={renderLegend} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingRight: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text for Doughnut */}
                        <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="block text-4xl font-light text-white">
                                <CountUp value={statsList[0].value} />+
                            </span>
                            <span className="block text-xs text-gray-400 uppercase tracking-widest mt-1">{lang === 'es' ? 'Total Audio' : lang === 'pt' ? 'Áudio Total' : 'Total Audio'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
