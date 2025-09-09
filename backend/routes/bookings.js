// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');



const Venue = require('../models/Venue');
const requireAuth = require('../middleware/auth');
const { sendEmail } = require('../mail');
const { sendPush } = require('../push');
const User = require('../models/User');

// helper: testa se é ObjectId de 24 hex
const isMongoId = (s) => /^[a-fA-F0-9]{24}$/.test(String(s || ''));

// Minhas reservas
router.get('/my', requireAuth, async (req, res) => {
  const list = await Booking.find({ user: req.userId })
    .sort({ createdAt: -1 })
    // se 'venue' existir (interno) popula; se for Google, fica null mas tens os metadados no próprio doc
    .populate('venue', 'name district type');
  res.json(list);
});

// Criar reserva (aceita venue interno OU Google)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      venueId,
      date,
      time,
      paymentIntentId = null,
      receiptUrl = null,

      // metadados opcionais (necessários quando o venue é Google)
      venueName,
      venueType,
      venueDistrict,
      venueAddress,
      imageUrl,

      amount,
      currency,
    } = req.body || {};

    if (!venueId || !date || !time) {
      return res.status(400).json({ msg: 'Dados em falta (venueId, date, time)' });
    }

    // vamos montar vMeta com base na origem do venue
    let vMeta = {
      venueId: String(venueId),
      venue: undefined, // ObjectId quando for interno
      venueName: venueName || '',
      venueType: venueType || '',
      venueDistrict: venueDistrict || '',
      venueAddress: venueAddress || '',
      imageUrl: imageUrl || undefined,
    };

    if (isMongoId(venueId)) {
      // venue da tua BD -> obtém metadados do documento
      const v = await Venue.findById(venueId);
      if (!v) return res.status(404).json({ msg: 'Recinto não encontrado' });

      vMeta = {
        ...vMeta,
        venue: v._id,
        venueName: v.name,
        venueType: v.type,
        venueDistrict: v.district,
        venueAddress: v.address,
        imageUrl: v.imageUrl || undefined,
      };
    }
    // se não for MongoId, assume Google: já usamos os metadados vindos do body

    const booking = await Booking.create({
      user: req.userId,
      ...vMeta,
      date,
      time,
      status: 'confirmed',
      paymentIntentId,
      receiptUrl,
      amount: Number(amount ?? 1200),
      currency: String(currency || 'eur').toLowerCase(),
    });

    // Notificações
    try {
      const me = await User.findById(req.userId).select('email expoPushToken name');
      const title = 'Reserva confirmada ✅';
      const msg = `${booking.venueName || 'Recinto'} — ${booking.date} ${booking.time}`;

      if (me?.email) {
        await sendEmail({
          to: me.email,
          subject: title,
          text: msg,
          html: `<p>Olá ${me.name || ''},</p><p>${msg}</p>${
            booking.receiptUrl ? `<p><a href="${booking.receiptUrl}" target="_blank">Ver recibo</a></p>` : ''
          }`,
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
    console.error('BOOKINGS_POST ERROR:', e);
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
