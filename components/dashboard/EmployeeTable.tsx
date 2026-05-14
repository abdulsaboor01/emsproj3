'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Trash2, Mail } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

interface Props {
  employees: any[]
  onDelete: (id: string) => void
  canWrite?: boolean
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-slate-400',
  'on-leave': 'bg-amber-500',
}

export default function EmployeeTable({ employees, onDelete, canWrite = true }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            {['Employee', 'Position', 'Department', 'Status', 'Salary', ...(canWrite ? ['Actions'] : [])].map((h, i) => (
              <th key={h} className={clsx('py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider', canWrite && i === 5 ? 'text-right' : 'text-left')}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {employees.map((emp, i) => (
              <motion.tr
                key={emp._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: 'easeOut' }}
                className="border-b border-slate-50 group"
                whileHover={{ backgroundColor: 'rgba(238,242,255,0.6)' }}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black shadow-sm"
                      style={{ background: `linear-gradient(135deg, hsl(${(emp.firstName?.charCodeAt(0) || 0) * 5 % 360}, 70%, 55%), hsl(${(emp.firstName?.charCodeAt(0) || 0) * 5 % 360 + 40}, 70%, 45%))` }}
                    >
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </motion.div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{emp.firstName} {emp.lastName}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3" /> {emp.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-sm text-slate-600 font-medium">{emp.position}</td>
                <td className="py-3.5 px-4">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl">
                    {emp.departmentId?.name || 'N/A'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={clsx(
                    emp.status === 'active' && 'badge-active',
                    emp.status === 'inactive' && 'badge-inactive',
                    emp.status === 'on-leave' && 'badge-leave'
                  )}>
                    <span className={clsx('w-1.5 h-1.5 rounded-full', STATUS_DOT[emp.status])} />
                    {emp.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-sm font-black text-gray-900">${emp.salary?.toLocaleString()}</td>
                {canWrite && (
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Link href={`/employees/${emp._id}`}>
                        <motion.button
                          whileHover={{ scale: 1.15, backgroundColor: '#eef2ff' }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 text-indigo-500" />
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.15, backgroundColor: '#fef2f2' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(emp._id)}
                        className="p-2 rounded-xl transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </motion.button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
