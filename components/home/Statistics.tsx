'use client'

import { Download, FileText, Link2, Users } from 'lucide-react'

export function Statistics() {
  const stats = [
    { icon: Users, label: '活跃用户', value: '10,234' },
    { icon: FileText, label: '收录游戏', value: '1,567' },
    { icon: Download, label: '累计下载', value: '89,432' },
    { icon: Link2, label: '友情链接', value: '128' }
  ]

  return (
    <section className="rounded-xl bg-content1 p-8">
      <h2 className="mb-6 text-3xl font-bold">站点数据</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <Icon className="mx-auto mb-2" size={32} />
            <h3 className="mb-1 text-2xl font-bold">{value}</h3>
            <p className="text-default-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
