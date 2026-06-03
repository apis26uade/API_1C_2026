import { useState } from 'react'
import SectionTitle from '../components/SectionTitle.jsx'

const initialForm = {
  name: '',
  email: '',
  message: '',
}

function Contact() {
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSent(true)
    setForm(initialForm)
  }

  return (
    <section className="contact-layout">
      <div>
        <SectionTitle eyebrow="Contacto" title="Contanos que estas buscando">
          Este formulario muestra manejo de inputs controlados con estado local.
        </SectionTitle>
        <div className="contact-card">
          <p>
            Podemos ayudarte a elegir prendas por talle, color, ocasion o estilo.
            Los mensajes quedan preparados para conectarse a la API cuando el
            backend sume este endpoint.
          </p>
          <span>hola@almaboho.com</span>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Tu nombre"
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            required
          />
        </label>
        <label>
          Mensaje
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Quiero consultar por..."
            rows="5"
            required
          ></textarea>
        </label>
        <button className="button primary" type="submit">
          Enviar consulta
        </button>
        {sent ? <p className="success-message">Consulta enviada. Gracias!</p> : null}
      </form>
    </section>
  )
}

export default Contact
