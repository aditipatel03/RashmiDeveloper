const supabase = require('../config/supabase');

exports.getProperties = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.getProperty = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.createProperty = async (req, res) => {
    try {
        let imageUrl = '';
        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('property-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const propertyData = {
            ...req.body,
            image: imageUrl,
            amenities: req.body.amenities ? JSON.parse(req.body.amenities) : []
        };

        const { data, error } = await supabase
            .from('properties')
            .insert([propertyData])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('property-images')
                .getPublicUrl(fileName);

            updateData.image = publicUrlData.publicUrl;
        }

        if (updateData.amenities) {
            updateData.amenities = JSON.parse(updateData.amenities);
        }

        const { data, error } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        // Soft Delete
        const { error } = await supabase
            .from('properties')
            .update({ is_deleted: true })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Property moved to trash' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.restoreProperty = async (req, res) => {
    try {
        const { error } = await supabase
            .from('properties')
            .update({ is_deleted: false })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ msg: 'Property restored' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
