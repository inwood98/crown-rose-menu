interface Props {
  qty: number
  onChange: (qty: number) => void
  label: string
}

const MAX = 99

export function QuantityStepper({ qty, onChange, label }: Props) {
  return (
    <div className="stepper" data-active={qty > 0}>
      <button
        type="button"
        className="stepper-btn"
        aria-label={`Remove one ${label}`}
        disabled={qty <= 0}
        onClick={() => onChange(Math.max(0, qty - 1))}
      >
        −
      </button>
      <span className="stepper-qty" aria-live="polite" aria-label={`${qty} ${label}`}>
        {qty}
      </span>
      <button
        type="button"
        className="stepper-btn"
        aria-label={`Add one ${label}`}
        disabled={qty >= MAX}
        onClick={() => onChange(Math.min(MAX, qty + 1))}
      >
        +
      </button>
    </div>
  )
}
