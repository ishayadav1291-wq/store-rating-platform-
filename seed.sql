-- Seed data for Store Rating Platform
-- Passwords: Admin@123, Owner@123, User@123 (bcrypt hashed)

INSERT INTO users (name, email, password_hash, address, role) VALUES
('System Administrator Account', 'admin@test.com', '$2b$10$VyhVcygK3F4mmzio7WC9S.52mUMLAlBnyWIFelLISv32tQzyUCnYe', '123 Main Street, Downtown City Center, State 12345', 'admin'),
('Premium Store Owner Account', 'owner1@test.com', '$2b$10$opV.IDooEAZRIheV3cH.Ve4KznZ3oC79Ll8dN8Qccv8AJx6Ja0Kdm', '456 Business Avenue, Commercial District, State 23456', 'owner'),
('Elite Retail Owner Profile', 'owner2@test.com', '$2b$10$opV.IDooEAZRIheV3cH.Ve4KznZ3oC79Ll8dN8Qccv8AJx6Ja0Kdm', '789 Enterprise Boulevard, Shopping Center, State 34567', 'owner'),
('Regular Customer User One', 'user1@test.com', '$2b$10$izye9Du0MHVGALADZoujUunypYw7yD4JpLUOIbXucad03PhBYgoyW', '321 Residential Lane, Suburbs Area, State 45678', 'user'),
('Standard Member User Two Account', 'user2@test.com', '$2b$10$izye9Du0MHVGALADZoujUunypYw7yD4JpLUOIbXucad03PhBYgoyW', '654 Apartment Complex Street, Urban Zone, State 56789', 'user'),
('Normal Customer Three Profile', 'user3@test.com', '$2b$10$izye9Du0MHVGALADZoujUunypYw7yD4JpLUOIbXucad03PhBYgoyW', '987 Housing Development Road, Neighborhood District, State 67890', 'user');

INSERT INTO stores (name, email, address, owner_id) VALUES
('Downtown Electronics Store Center', 'electronics@downtown.com', '100 Tech Avenue, Electronics District, State 11111', 2),
('Premium Fashion Boutique Shop', 'fashion@premium.com', '200 Style Street, Fashion Quarter, State 22222', 2),
('Elite Grocery Supermarket Chain', 'grocery@elite.com', '300 Market Road, Shopping Center, State 33333', 3),
('Quality Home Furniture Outlet', 'furniture@quality.com', '400 Interior Design Boulevard, Home District, State 44444', 3),
('Fresh Organic Food Market Store', 'organic@fresh.com', '500 Green Avenue, Health Quarter, State 55555', 2);

INSERT INTO ratings (user_id, store_id, rating) VALUES
(4, 1, 5),
(4, 2, 4),
(4, 3, 3),
(5, 1, 4),
(5, 2, 5),
(5, 4, 4),
(6, 1, 5),
(6, 3, 2),
(6, 5, 4);
