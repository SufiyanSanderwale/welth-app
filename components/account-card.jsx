import React from 'react'
import { ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react'

/**
 * AccountCard
 * Props:
 * - title: string (e.g., "Personal")
 * - balance: string or number (e.g., 14713.01)
 * - currencySymbol: string (e.g., "₹")
 * - accountType: string (e.g., "Savings Account")
 * - onIncomeClick, onExpenseClick: fn
 * - onToggle: fn
 * - isToggled: boolean
 */
export default function AccountCard({
  title = 'Personal',
  balance = 0,
  currencySymbol = '₹',
  accountType = 'Savings Account',
  onIncomeClick = () => {},
  onExpenseClick = () => {},
  onToggle = () => {},
  isToggled = false,
}) {
  const formatted = Number(balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full">
      {/* Top section */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>

        <div className="flex items-center gap-3">
          {/* Simple toggle (accessible) */}
          <button
            aria-pressed={isToggled}
            onClick={onToggle}
            className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors ${isToggled ? 'bg-black' : 'bg-gray-200'}`}
            title={isToggled ? 'On' : 'Off'}
          >
            <span
              className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${isToggled ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>

          {/* Kebab / more menu icon - placeholder button */}
          <button className="p-1 rounded-full hover:bg-gray-100" aria-label="More options">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Middle section - Balance */}
      <div className="mt-4">
        <div className="flex items-center gap-2">
          {/* Use flex with items-center to vertically align currency symbol and amount */}
          <span className="text-4xl font-bold leading-none">{currencySymbol}</span>
          <span className="text-4xl font-bold leading-none">{formatted}</span>
        </div>
        <div className="text-md text-gray-500 mt-1">{accountType}</div>
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex items-center justify-between">
        <button onClick={onIncomeClick} className="flex items-center gap-2 text-green-600 hover:underline">
          <ArrowUpRight className="w-4 h-4" />
          <span>Income</span>
        </button>

        <button onClick={onExpenseClick} className="flex items-center gap-2 text-red-600 hover:underline">
          <ArrowDownRight className="w-4 h-4" />
          <span>Expense</span>
        </button>
      </div>
    </div>
  )
}
