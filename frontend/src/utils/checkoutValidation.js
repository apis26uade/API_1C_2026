export const digitsOnly = (value) => value.replace(/\D/g, '')

export const formatPhoneInput = (value) => {
  const trimmed = value.trimStart()
  const hasPlus = trimmed.startsWith('+')
  const digits = digitsOnly(trimmed)
  if (hasPlus) return `+${digits.slice(0, 13)}`
  return digits.slice(0, 13)
}

export const formatPostalCodeInput = (value) =>
  value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)

export const formatCardNumberInput = (value) => {
  const digits = digitsOnly(value).slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export const formatExpiryInput = (value) => {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export const formatCvvInput = (value) => digitsOnly(value).slice(0, 4)

export const validatePhone = (phone) => {
  const digits = digitsOnly(phone)
  if (digits.length < 10 || digits.length > 13) {
    return 'El telefono debe tener entre 10 y 13 digitos'
  }
  return null
}

export const validatePostalCode = (postalCode) => {
  const normalized = postalCode.trim().toUpperCase()
  if (!/^[A-Z0-9]{4,8}$/.test(normalized)) {
    return 'Codigo postal invalido (4 a 8 caracteres alfanumericos)'
  }
  return null
}

export const validateEmail = (email) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Ingresa un email valido'
  }
  return null
}

export const validateShippingForm = (form) => {
  const errors = {}

  if (!form.name.trim() || form.name.trim().length < 3) {
    errors.name = 'Ingresa tu nombre completo (minimo 3 caracteres)'
  }

  const emailError = validateEmail(form.email)
  if (emailError) errors.email = emailError

  const phoneError = validatePhone(form.phone)
  if (phoneError) errors.phone = phoneError

  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = 'Ingresa una direccion valida'
  }

  if (!form.city.trim() || form.city.trim().length < 2) {
    errors.city = 'Ingresa una ciudad valida'
  }

  const postalError = validatePostalCode(form.postalCode)
  if (postalError) errors.postalCode = postalError

  return { valid: Object.keys(errors).length === 0, errors }
}

export const validateCardNumber = (cardNumber) => {
  const digits = digitsOnly(cardNumber)
  if (digits.length < 13 || digits.length > 19) {
    return 'La tarjeta debe tener entre 13 y 19 digitos'
  }
  return null
}

export const validateExpiry = (expiry) => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return 'Usa el formato MM/AA'
  }

  const [monthPart, yearPart] = expiry.split('/')
  const month = Number(monthPart)
  const year = Number(yearPart)

  if (month < 1 || month > 12) {
    return 'El mes debe estar entre 01 y 12'
  }

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'La tarjeta esta vencida'
  }

  return null
}

export const validateCvv = (cvv) => {
  const digits = digitsOnly(cvv)
  if (!/^\d{3,4}$/.test(digits)) {
    return 'El CVV debe tener 3 o 4 digitos'
  }
  return null
}

export const validatePaymentForm = (cardForm) => {
  const errors = {}

  const cardError = validateCardNumber(cardForm.cardNumber)
  if (cardError) errors.cardNumber = cardError

  const expiryError = validateExpiry(cardForm.expiry)
  if (expiryError) errors.expiry = expiryError

  const cvvError = validateCvv(cardForm.cvv)
  if (cvvError) errors.cvv = cvvError

  if (!cardForm.cardName.trim() || cardForm.cardName.trim().length < 3) {
    errors.cardName = 'Ingresa el nombre como figura en la tarjeta'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
