const { supabase } = require('../config/supabase');

exports.getProperties = async (req, res) => {
    try {
        // Attempt to fetch with user info
        const { data, error } = await supabase
            .from('properties')
            .select('*, user_id (username, role, email)')
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) {
            // Fallback: If user_id column doesn't exist yet, just fetch properties
            console.warn('Property fetch with user info failed, falling back to simple fetch:', error.message);
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('properties')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (fallbackError) throw fallbackError;
            return res.json(fallbackData);
        }

        res.json(data);
    } catch (err) {
        console.error('Property fetch error:', err);
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
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrlData.publicUrl);
            }
        }

        const thumbnailIndex = parseInt(req.body.thumbnailIndex) || 0;
        const mainImage = imageUrls.length > 0 ? (imageUrls[thumbnailIndex] || imageUrls[0]) : '';

        const propertyData = {
            title: req.body.title,
            type: req.body.type,
            category: req.body.category,
            price: req.body.price,
            location: req.body.location,
            area: req.body.area,
            status: req.body.status || 'Active',
            availability: req.body.availability || 'Ready to Move',
            description: req.body.description,
            image: mainImage,
            images: imageUrls,
            thumbnail_index: thumbnailIndex,
            verified: req.body.verified === 'true' || req.body.verified === true,
            featured: req.body.featured === 'true' || req.body.featured === true,
            facing: req.body.facing,
            furnishing: req.body.furnishing,
            user_id: req.user.id
        };

        let { data, error } = await supabase
            .from('properties')
            .insert([propertyData])
            .select();

        if (error) {
            // Fallback: If user_id column doesn't exist, remove it and try again
            if (error.code === '42703' || error.message.includes('column "user_id" does not exist')) {
                console.warn('user_id column missing, falling back to insert without it');
                delete propertyData.user_id;
                const { data: retryData, error: retryError } = await supabase
                    .from('properties')
                    .insert([propertyData])
                    .select();

                if (retryError) throw retryError;
                data = retryData;
                error = null;
            } else {
                throw error;
            }
        }

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
            availability: req.body.availability,
            description: req.body.description,
            verified: req.body.verified === 'true' || req.body.verified === true,
            featured: req.body.featured === 'true' || req.body.featured === true,
            furnishing: req.body.furnishing,
            thumbnail_index: req.body.thumbnailIndex ? parseInt(req.body.thumbnailIndex) : undefined
        };

        let currentImageUrls = [];
        if (req.body.existingImages) {
            currentImageUrls = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
        }

        if (req.files && req.files.length > 0) {
            const newImageUrls = [];
            for (const file of req.files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(fileName);

                newImageUrls.push(publicUrlData.publicUrl);
            }
            currentImageUrls = [...currentImageUrls, ...newImageUrls];
        }

        if (currentImageUrls.length > 0) {
            updateData.images = currentImageUrls;
            const tIndex = updateData.thumbnail_index !== undefined ? updateData.thumbnail_index : 0;
            updateData.image = currentImageUrls[tIndex] || currentImageUrls[0];
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

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await supabase
            .from('properties')
            .update({ status })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
