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
            title: req.body.title,
            type: req.body.type,
            category: req.body.category,
            price: req.body.price,
            location: req.body.location,
            area: req.body.area,
            status: req.body.status,
            description: req.body.description,
            image: imageUrl,
            verified: req.body.verified === 'true' || req.body.verified === true,
            featured: req.body.featured === 'true' || req.body.featured === true,
            brokerage: parseFloat(req.body.brokerage) || 0,
            amenities: req.body.amenities ? (typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities) : [],
            possession: req.body.possession,
            rera: req.body.rera,
            floor: req.body.floor,
            facing: req.body.facing,
            furnishing: req.body.furnishing
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
        let updateData = {
            title: req.body.title,
            type: req.body.type,
            category: req.body.category,
            price: req.body.price,
            location: req.body.location,
            area: req.body.area,
            status: req.body.status,
            description: req.body.description,
            verified: req.body.verified === 'true' || req.body.verified === true,
            featured: req.body.featured === 'true' || req.body.featured === true,
            brokerage: req.body.brokerage ? parseFloat(req.body.brokerage) : undefined,
            possession: req.body.possession,
            rera: req.body.rera,
            floor: req.body.floor,
            facing: req.body.facing,
            furnishing: req.body.furnishing
        };

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

        if (req.body.amenities) {
            updateData.amenities = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities;
        }

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

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
