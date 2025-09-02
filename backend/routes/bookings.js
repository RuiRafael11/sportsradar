// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const requireAuth = require('../middleware/auth');
const { sendEmail } = require('../mail');
const { sendPush } = require('../push');
const User = require('../models/User');

// Minhas reservas
router.get('/my', requireAuth, async (req, res) => {
  const list = await Booking.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .populate('venue', 'name district type');
  res.json(list);
});

// Criar reserva (já com pagamento OK)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { venueId, date, time, paymentIntentId = null, receiptUrl = null } = req.body || {};
    if (!venueId || !date || !time) {
      return res.status(400).json({ msg: 'Dados em falta (venueId, date, time)' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) return res.status(404).json({ msg: 'Recinto não encontrado' });

    const booking = await Booking.create({
      user: req.userId,
      venue: venue._id,
      date,
      time,
      status: 'confirmed',
      paymentIntentId,
      receiptUrl,
    });

    // Notificações
    try {
      const me = await User.findById(req.userId).select('email expoPushToken name');
      const title = 'Reserva confirmada ✅';
      const msg = `${venue.name} — ${date} ${time}`;

      if (me?.email) {
        await sendEmail({
          to: me.email,
          subject: title,
          text: msg,
          html: `<p>Olá ${me.name || ''},</p><p>${msg}</p>${receiptUrl ? `<p><a href="${receiptUrl}" target="_blank">Ver recibo</a></p>` : ''}`,
        });
      }
      if (me?.expoPushToken) {
        await sendPush(me.expoPushToken, title, msg);
      }
    } catch (e) {
      console.warn('Notificações falharam:', e.message);
    }

    res.status(201).json(booking);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Erro ao criar reserva' });
  }
});

// Cancelar (até 24h antes)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const b = await Booking.findOne({ _id: req.params.id, user: req.userId }).populate('venue', 'name');
    if (!b) return res.status(404).json({ msg: 'Reserva não encontrada' });

    const dt = new Date(`${b.date}T${b.time}:00`);
    const now = new Date();
    if (dt.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ msg: 'Só podes cancelar até 24h antes.' });
    }

    b.status = 'cancelled';
    await b.save();

    res.json({ msg: 'Reserva cancelada', booking: b });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Erro ao cancelar' });
  }
});

module.exports = router;
