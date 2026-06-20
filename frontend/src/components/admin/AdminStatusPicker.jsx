import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from '../Icons.jsx'
import { ORDER_STATUSES } from '../../services/orders.js'

function StatusDot({ status }) {
  return (
    <span
      className={`status-dot status-dot-${status.toLowerCase()}`}
      aria-hidden="true"
    />
  )
}

function AdminStatusPicker({ value, onChange, disabled, label = 'Estado' }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const optionRefs = useRef([])

  const selectedIndex = ORDER_STATUSES.findIndex((status) => status.value === value)
  const current = ORDER_STATUSES[selectedIndex >= 0 ? selectedIndex : 0]

  const handleSelect = useCallback(
    (nextValue) => {
      if (nextValue !== value) onChange(nextValue)
      setOpen(false)
    },
    [onChange, value],
  )

  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }
  }, [open, selectedIndex])

  useEffect(() => {
    if (!open) return undefined

    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((index) => (index + 1) % ORDER_STATUSES.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex(
          (index) => (index - 1 + ORDER_STATUSES.length) % ORDER_STATUSES.length,
        )
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleSelect(ORDER_STATUSES[activeIndex].value)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, activeIndex, handleSelect])

  const toggleOpen = () => {
    if (disabled) return
    setOpen((current) => !current)
  }

  return (
    <div className={`admin-status-picker${open ? ' is-open' : ''}`} ref={rootRef}>
      <span className="admin-status-picker-label">{label}</span>
      <button
        type="button"
        className="admin-status-trigger"
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="admin-status-trigger-main">
          <StatusDot status={value} />
          <span>{current?.label ?? value}</span>
        </span>
        <ChevronDownIcon size={14} />
      </button>

      {open ? (
        <ul className="admin-status-menu" role="listbox" aria-label={label} aria-activedescendant={`status-option-${ORDER_STATUSES[activeIndex].value}`}>
          {ORDER_STATUSES.map((status, index) => {
            const selected = status.value === value
            const active = index === activeIndex
            return (
              <li key={status.value} role="presentation">
                <button
                  id={`status-option-${status.value}`}
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`admin-status-option${selected ? ' is-selected' : ''}${active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelect(status.value)}
                >
                  <span className="admin-status-option-main">
                    <StatusDot status={status.value} />
                    <span>{status.label}</span>
                  </span>
                  {selected ? <CheckIcon size={14} /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default AdminStatusPicker
