/**
 * Why Online Component (在线版优势区块)
 * SEO 优化的在线版优势展示区块，嵌入痛点关键词
 * pos: src/themes/default/blocks/why-online.tsx
 */
'use client';

import { Clock, Cpu, Zap } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

// 优势特性类型
type Advantage = {
  icon: React.ReactNode;
  title: string;
  description: string;
  keywords: string[];
};

// 默认优势特性（用于 SEO 痛点关键词嵌入）
const defaultAdvantages: Advantage[] = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'No High-End GPU Needed',
    description: "Don't worry about VRAM or OOM (Out of Memory) errors. Use our cloud GPU for seamless processing.",
    keywords: ['no GPU', 'OOM', 'low vram', 'cloud GPU']
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'No ComfyUI Workflow Setup',
    description: 'Forget complex nodes. No need to install Python or ComfyUI. Just drag and drop your files.',
    keywords: ['no ComfyUI', 'workflow', 'no installation', 'no python']
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Fast Processing',
    description: 'Get results in seconds with our optimized cloud infrastructure. No waiting, no queues.',
    keywords: ['fast', 'quick', 'instant', 'seconds']
  }
];

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />
};

export function WhyOnline({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  // 从 section 获取配置，或使用默认值
  const advantages = section.items?.map((item) => ({
    icon: typeof item.icon === 'string' ? iconMap[item.icon] || <Cpu className="w-6 h-6" /> : item.icon,
    title: item.title || '',
    description: item.description || '',
    keywords: item.keywords || []
  })) || defaultAdvantages;

  return (
    <section 
      id={section.id || 'why-online'} 
      className={cn('py-20', section.className, className)}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* 区块标题 - H2 用于 SEO，包含痛点关键词 */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">
              {section.title || 'Why Use SeedVR2 Online? (No GPU & No OOM)'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {section.description || 'Skip the hassle of local installation and hardware requirements. Process videos and images instantly in the cloud.'}
            </p>
          </motion.div>
        </div>

        {/* 优势卡片网格 - 三列布局 */}
        <div className="grid md:grid-cols-3 gap-6">
          {advantages.map((advantage, index) => (
            <motion.div
              key={advantage.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:border-green-500/50 hover:bg-white/[0.07] transition-all"
            >
              {/* 图标 */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mb-4 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                <div className="text-green-500">
                  {advantage.icon}
                </div>
              </div>

              {/* 内容 */}
              <h3 className="text-xl font-semibold mb-2 text-white">{advantage.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{advantage.description}</p>

              {/* 关键词标签（用于 SEO 痛点关键词展示） */}
              {advantage.keywords && advantage.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {advantage.keywords.slice(0, 4).map((keyword: string) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 text-xs rounded-full bg-green-500/10 border border-green-500/20 text-green-400"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
