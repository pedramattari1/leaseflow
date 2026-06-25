INSERT INTO properties (id, name, address)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'The Fay San Jose', '123 S Market St, San Jose, CA 95113')
ON CONFLICT DO NOTHING;

INSERT INTO units (property_id, unit_number, unit_type, floor, market_rent, sqft, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '101', 'Studio', 1, 2450.00, 520, 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '102', 'Studio', 1, 2500.00, 540, 'occupied'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '201', '1BR', 2, 3200.00, 720, 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '202', '1BR', 2, 3350.00, 750, 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '203', '1BR+Den', 2, 3600.00, 830, 'notice'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '301', '2BR', 3, 4200.00, 1050, 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '302', '2BR', 3, 4350.00, 1080, 'occupied'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '401', '2BR+Den', 4, 4800.00, 1200, 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '501', 'Penthouse', 5, 6500.00, 1500, 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '502', 'Penthouse', 5, 7200.00, 1650, 'occupied');
