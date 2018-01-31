SELECT v.id, v.make, v.model, v.year, v.owner_id 
FROM vehicles v
JOIN users u ON u.id = v.owner_id
WHERE u.email = $1;