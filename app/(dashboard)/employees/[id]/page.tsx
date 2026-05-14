'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import EmployeeForm from '@/components/dashboard/EmployeeForm'

export default function EditEmployeePage() {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then(r => r.json())
      .then(data => { setEmployee(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return <EmployeeForm employee={employee} isEdit />
}
