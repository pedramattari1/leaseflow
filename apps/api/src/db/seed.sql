INSERT INTO properties (id, name, address)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'The Fay San Jose', '123 S Market St, San Jose, CA 95113')
ON CONFLICT DO NOTHING;

INSERT INTO units (property_id, unit_number, unit_type, floor, market_rent, sqft, unit_code, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '101', 'Studio A', 1, 2950.00, 520, 'Studio A', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '102', 'Studio B', 1, 2795.00, 510, 'Studio B', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '201', '1bd 1ba A', 2, 3450.00, 720, '1bd 1ba A', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '202', '1bd 1ba B', 2, 3690.00, 750, '1bd 1ba B', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '203', '1bd 1ba C', 2, 3310.00, 730, '1bd 1ba C', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '204', '1bd 1ba D', 2, 4250.00, 830, '1bd 1ba D', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '301', '2bd 2ba A', 3, 4420.00, 1050, '2bd 2ba A', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '302', '2bd 2ba B', 3, 4465.00, 1060, '2bd 2ba B', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '303', '2bd 2ba C', 3, 4640.00, 1080, '2bd 2ba C', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '304', '2bd 2ba D', 3, 4500.00, 1070, '2bd 2ba D', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '305', '2bd 2ba E', 3, 5200.00, 1150, '2bd 2ba E', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '401', '2bd 2ba F', 4, 6025.00, 1500, '2bd 2ba F', 'available');
