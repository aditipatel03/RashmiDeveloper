const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const propertyController = require('../controllers/propertyController');
const userController = require('../controllers/userController');
const { supabase } = require('../config/supabase');

// Multer in-memory storage for Supabase uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// User Routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', auth, userController.resetPassword);
router.get('/stats', auth, userController.getStats);
router.get('/users', auth, userController.getUsers);
router.delete('/users/:id', auth, userController.deleteUser);
router.put('/update-profile', auth, userController.updateProfile);
router.post('/track-visit', userController.trackVisit);

// Property Routes
router.get('/properties', propertyController.getProperties);
router.get('/properties/:id', propertyController.getProperty);
router.post('/properties', auth, upload.array('images', 10), propertyController.createProperty);
router.put('/properties/:id', auth, upload.array('images', 10), propertyController.updateProperty);
router.delete('/properties/:id', auth, propertyController.deleteProperty);
router.patch('/properties/:id/status', auth, propertyController.updateStatus);
router.post('/properties/:id/restore', auth, propertyController.restoreProperty);

// Appointment Routes
router.post('/appointments', async (req, res) => {
    try {
        const { phone, name } = req.body;
        if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
            return res.status(400).send('Please provide a valid 10-digit phone number');
        }

        if (name && !/^[a-zA-Z\s]+$/.test(name)) {
            return res.status(400).send('Name should contain only letters and spaces');
        }

        const { data, error } = await supabaseAdmin
            .from('appointments')
            .insert([req.body])
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/appointments', auth, async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            msg: 'Admin access required',
            debug: {
                role: req.user.role,
                email: req.user.email,
                id: req.user.id
            }
        });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('appointments')
            .select('*, property_id(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.delete('/appointments/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin access required' });
    }

    try {
        const { error } = await supabaseAdmin
            .from('appointments')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Appointment removed' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.patch('/appointments/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin access required' });
    }

    try {
        const { status } = req.body;
        const { data, error } = await supabaseAdmin
            .from('appointments')
            .update({ status })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
