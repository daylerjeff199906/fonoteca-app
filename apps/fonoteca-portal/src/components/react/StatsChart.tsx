import React, { useEffect, useState } from 'react';
import { type translations } from '../../i18n/data';
import { motion, animate } from 'framer-motion';
import { 
  RadialBarChart, 
  RadialBar, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  PolarAngleAxis
} from 'recharts';
import { Activity, BarChart3, Microscope, Database, Globe2, ArrowRight } from 'lucide-react';

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
            duration: 2.5,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (latest) => setCount(Math.floor(latest))
        });
        return () => controls.stop();
    }, [value]);

    return <span>{count.toLocaleString()}</span>;
}

const COLORS = [
    '#8DC63F', // accent-green
    '#4ADE80', 
    '#22C55E', 
    '#16A34A', 
    '#15803D', 
    '#166534', 
    '#14532D'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0c141d]/95 backdrop-blur-xl border border-accent-green/30 p-4 rounded-2xl shadow-2xl z-50">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: data.fill }}></div>
            <p className="text-[10px] font-black text-accent-green uppercase tracking-[0.2em]">{data.name}</p>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{data.value}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Species</span>
        </div>
      </div>
    );
  }
  return null;
};

export const StatsChart: React.FC<StatsChartProps> = ({ statsContent, chartContent, lang, classData = [] }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const metrics = [
        { ...statsContent.s1, value: parseInt(statsContent.s1.count) || 0, icon: Database },
        { ...statsContent.s2, value: parseInt(statsContent.s2.count) || 0, icon: Globe2 },
        { ...statsContent.s3, value: parseInt(statsContent.s3.count) || 0, icon: Microscope },
        { ...statsContent.s5, value: parseInt(statsContent.s5.count) || 0, icon: BarChart3 },
    ];

    const chartData = classData
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .map((item, index) => ({
            name: lang === 'en' ? item.title_en : lang === 'pt' ? item.title_pt : item.title_es,
            value: item.count,
            fill: COLORS[index % COLORS.length]
        }));

    if (!isMounted) return <div className="h-[600px] w-full bg-[#0c141d] animate-pulse rounded-[3rem]" />;

    return (
        <section className="py-24 bg-white dark:bg-[#04070a] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="relative bg-[#0c141d] rounded-[3.5rem] p-8 md:p-16 overflow-hidden border border-white/5 shadow-2xl">
                    {/* Background Visual Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-green/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                    
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        {/* Left Side: Text and Content */}
                        <div className="lg:col-span-5 space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-px w-8 bg-accent-green"></div>
                                    <span className="text-accent-green font-black text-[10px] uppercase tracking-[0.4em]">
                                        {chartContent.title_sm}
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold tracking-tighter leading-[1.1]">
                                    {chartContent.title.split(' ').map((word, i) => (
                                        <span key={i} className={i > 2 ? 'text-accent-green/90' : ''}>{word} </span>
                                    ))}
                                </h2>
                                <p className="text-gray-400 text-lg leading-relaxed max-w-md font-light">
                                    {chartContent.desc}
                                </p>
                            </motion.div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                {metrics.map((metric, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-accent-green/20 transition-all"
                                    >
                                        <metric.icon className="w-5 h-5 text-accent-green/50 mb-4 group-hover:text-accent-green transition-colors" />
                                        <div className="space-y-1">
                                            <div className="text-3xl font-bold text-white tracking-tighter">
                                                <CountUp value={metric.value} />
                                            </div>
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                {metric.label}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.a 
                                href={`/${lang}/species`}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="inline-flex items-center gap-4 group"
                            >
                                <span className="h-12 px-8 rounded-full bg-accent-green text-black font-bold text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                                    {chartContent.button}
                                </span>
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-white/10 transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </motion.a>
                        </div>

                        {/* Right Side: Advanced Visualization */}
                        <div className="lg:col-span-7 h-[500px] md:h-[600px] relative">
                            <motion.div
                                initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
                                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full h-full"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius="20%" 
                                        outerRadius="100%" 
                                        barSize={20} 
                                        data={chartData}
                                        startAngle={180} 
                                        endAngle={-180}
                                    >
                                        <RadialBar
                                            background={{ fill: 'rgba(255,255,255,0.03)' }}
                                            label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 'bold' }}
                                            dataKey="value"
                                            cornerRadius={10}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                        <Legend 
                                            iconSize={10} 
                                            layout="vertical" 
                                            verticalAlign="middle" 
                                            align="right"
                                            wrapperStyle={{
                                                paddingLeft: '20px',
                                                fontSize: '11px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                fontWeight: '700'
                                            }}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>

                                {/* Decorative Center Piece */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex flex-col items-center justify-center">
                                    <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-2xl animate-pulse"></div>
                                    <Activity className="w-8 h-8 text-accent-green mb-2 relative z-10" />
                                    <span className="text-[8px] font-black text-accent-green uppercase tracking-[0.3em] relative z-10">Live Data</span>
                                </div>
                            </motion.div>

                            {/* Soundwave Animation Overlay */}
                            <div className="absolute bottom-10 right-10 flex items-end gap-1 h-12 pointer-events-none opacity-20">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [10, 40, 15, 30, 10] }}
                                        transition={{ 
                                            repeat: Infinity, 
                                            duration: 1 + Math.random(),
                                            ease: "easeInOut"
                                        }}
                                        className="w-1 bg-accent-green rounded-full"
                                    ></motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
