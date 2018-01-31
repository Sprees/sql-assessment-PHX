SELECT Count(id)
FROM vehicles
WHERE owner_id = $1;