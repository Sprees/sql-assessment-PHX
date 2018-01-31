SELECT v.id, v.make, v.model, v.year, v.owner_id, u.name 
FROM vehicles v
JOIN users u ON v.owner_id = u.id
WHERE year > 2000
ORDER BY year DESC;