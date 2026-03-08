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

// Property Routes
router.get('/properties', propertyController.getProperties);
router.get('/properties/:id', propertyController.getProperty);
router.post('/properties', auth, upload.single('image'), propertyController.createProperty);
router.put('/properties/:id', auth, upload.single('image'), propertyController.updateProperty);
router.delete('/properties/:id', auth, propertyController.deleteProperty);
router.post('/properties/:id/restore', auth, propertyController.restoreProperty);

// Appointment Routes
router.post('/appointments', async (req, res) => {
    try {
        const { data, error } = await supabase
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
    try {
        const { data, error } = await supabase
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
    try {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Appointment removed' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
