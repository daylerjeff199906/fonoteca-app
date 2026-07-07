import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { type translations } from '../../i18n/data';

import { Music, Dna, TreeDeciduous, Boxes, Layers } from 'lucide-react';

interface StatsExplorerProps {
    data: {
        totalRecordings: number;
        totalSpecies: number;
        totalFamilies: number;
        totalOrders: number;
        totalClasses: number;
        speciesByClass: any[];
    };
    lang: string;
    translations: typeof translations.es.stats;
    chartTranslations: typeof translations.es.chart;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

const getLocalizedClassName = (className: string, l: string, fallback: string) => {
    const clean = className.trim().toLowerCase();
    if (clean === 'amphibia') {
        return l === 'es' ? 'Anfibios' : l === 'pt' ? 'Anfíbios' : 'Amphibians';
    }
    if (clean === 'aves') {
        return l === 'es' ? 'Aves' : l === 'pt' ? 'Aves' : 'Birds';
    }
    if (clean === 'mammalia') {
        return l === 'es' ? 'Mamíferos' : l === 'pt' ? 'Mamíferos' : 'Mammals';
    }
    if (clean === 'insecta') {
        return l === 'es' ? 'Insectos' : l === 'pt' ? 'Insetos' : 'Insects';
    }
    return fallback;
};

export const StatsExplorer: React.FC<StatsExplorerProps> = ({ data, lang, translations, chartTranslations }) => {
    const { totalRecordings, totalSpecies, totalFamilies, totalOrders, totalClasses, speciesByClass } = data;

    // Format data for charts
    const chartData = speciesByClass.map(item => ({
        name: getLocalizedClassName(item.id, lang, item.label_name || item.id),
        count: item.count,
    }));

    // Mock trend data for area chart (could be replaced with real data over time)
    const trendData = [
        { month: 'Jan', count: 120 },
        { month: 'Feb', count: 210 },
        { month: 'Mar', count: 350 },
        { month: 'Apr', count: 520 },
        { month: 'May', count: 680 },
        { month: 'Jun', count: totalRecordings },
    ];

    const activeLang = (lang === 'es' || lang === 'en' || lang === 'pt') ? lang : 'es';

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16 pb-6">
                    {[
                        { label: translations.s1.label, value: totalRecordings, desc: translations.s1.desc, icon: <Music className="w-8 h-8 md:w-10 md:h-10" /> },
                        { label: translations.s2.label, value: totalSpecies, desc: translations.s2.desc, icon: <Dna className="w-8 h-8 md:w-10 md:h-10" /> },
                        { label: translations.s3.label, value: totalFamilies, desc: translations.s3.desc, icon: <TreeDeciduous className="w-8 h-8 md:w-10 md:h-10" /> },
                        { label: translations.s4.label, value: totalOrders, desc: translations.s4.desc, icon: <Boxes className="w-8 h-8 md:w-10 md:h-10" /> },
                        { label: translations.s5.label, value: totalClasses, desc: translations.s5.desc, icon: <Layers className="w-8 h-8 md:w-10 md:h-10" /> },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-[#121b28] p-6 rounded-lg border border-gray-200 dark:border-gray-800 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 text-accent-green group-hover:scale-110 transition-transform">{item.icon}</div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">{item.label}</h3>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                                {item.value}
                                <span className="text-accent-green">+</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Layout */}
                <div className="grid grid-cols-1 gap-12">

                    {/* Species by Class Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-[#121b28] p-8 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                        <h4 className="text-3xl mb-6 text-gray-900 dark:text-white">
                            {chartTranslations.classes_title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-2xl">
                            {chartTranslations.classes_desc}
                        </p>
                        <div className="h-[380px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 15, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        label={{ value: activeLang === 'es' ? 'Número de Especímenes / Especies' : activeLang === 'pt' ? 'Número de Espécies' : 'Number of Species', angle: -90, position: 'insideLeft', offset: -5, style: { fill: '#9ca3af', fontSize: 12, textAnchor: 'middle' } }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6', opacity: 0.1 }}
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                        }}
                                        itemStyle={{ color: '#10b981' }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Bar name={activeLang === 'es' ? 'Especies por Clase' : activeLang === 'pt' ? 'Espécies por Classe' : 'Species by Class'} dataKey="count" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#9ca3af', fontSize: 11, offset: 5 }}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Growth area chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-[#121b28] p-8 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                        <h4 className="text-3xl mb-6 text-gray-900 dark:text-white">
                            {chartTranslations.growth_title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-2xl">
                            {chartTranslations.growth_desc}
                        </p>
                        <div className="h-[380px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 15, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        label={{ value: activeLang === 'es' ? 'Total de Grabaciones' : activeLang === 'pt' ? 'Total de Gravações' : 'Total Recordings', angle: -90, position: 'insideLeft', offset: -5, style: { fill: '#9ca3af', fontSize: 12, textAnchor: 'middle' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                        }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Area
                                        name={activeLang === 'es' ? 'Grabaciones Acumuladas' : activeLang === 'pt' ? 'Gravações Acumuladas' : 'Accumulated Recordings'}
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                </div>

                {/* Taxonomic Breakdown Pie */}
                <div className="mt-12 bg-white dark:bg-[#121b28] p-8 md:p-12 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="w-full md:w-1/2">
                            <h4 className="text-3xl mb-6 text-gray-900 dark:text-white">
                                {chartTranslations.composition_title}
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
                                {chartTranslations.composition_desc}
                            </p>
                            <div className="space-y-4">
                                {chartData.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                                        </div>
                                        <span className="text-gray-400 font-mono text-sm">{Math.round((item.count / totalSpecies) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 h-[450px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="count"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
