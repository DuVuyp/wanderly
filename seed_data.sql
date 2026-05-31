-- Chạy 3 dòng dưới đây để reset dữ liệu database
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
EXEC sp_MSforeachtable 'DELETE FROM ?';
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';

USE wanderly;
GO

-- 1. Clean up existing records to prevent unique key / foreign key conflicts
DELETE FROM Itinerary_Notes;
DELETE FROM Itinerary_Locations;
DELETE FROM Itineraries;
DELETE FROM Booking_Details;
DELETE FROM Bookings;
DELETE FROM Rooms;
DELETE FROM Room_Types;
DELETE FROM Properties;
DELETE FROM Users;

--------------------------------------------------------------------------------
-- 1.5. USERS
-- NOTE: ALL accounts are seeded with the default password: "Wanderly@123"
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Users ON;

INSERT INTO Users (id, email, password_hash, role, is_verified, verify_token, reset_pass_token, token_expiry, created_at, is_deleted, full_name, avatar, phone_number)
VALUES
(1, 'kiet.luu@gmail.com', '$2b$10$PE2Fl1b24R6.9GlSZ4STkeHC8TVpOTLnnK3jEv5Wf6CAaAOzXHvly', 'provider', 0, NULL, NULL, NULL, GETDATE(), 0, N'Lưu Trí Kiệt', NULL, NULL),
(2, 'giang.phan@gmail.com', '$2b$10$PE2Fl1b24R6.9GlSZ4STkeHC8TVpOTLnnK3jEv5Wf6CAaAOzXHvly', 'provider', 0, NULL, NULL, NULL, GETDATE(), 0, N'Phan Tuấn Giang', NULL, NULL),
(3, 'hung.nguyen@gmail.com', '$2b$10$PE2Fl1b24R6.9GlSZ4STkeHC8TVpOTLnnK3jEv5Wf6CAaAOzXHvly', 'provider', 0, NULL, NULL, NULL, GETDATE(), 0, N'Nguyễn Cao Mạnh Hùng', NULL, NULL),
(4, 'duyen.nguyen@gmail.com', '$2b$10$PE2Fl1b24R6.9GlSZ4STkeHC8TVpOTLnnK3jEv5Wf6CAaAOzXHvly', 'traveler', 0, NULL, NULL, NULL, GETDATE(), 0, N'Nguyễn Thị Mỹ Duyên', NULL, NULL),
(5, 'minhnhat@wanderly.com', '$2b$10$PE2Fl1b24R6.9GlSZ4STkeHC8TVpOTLnnK3jEv5Wf6CAaAOzXHvly', 'traveler', 0, NULL, NULL, NULL, GETDATE(), 0, N'Lê Hoàng Minh Nhật', NULL, NULL);

SET IDENTITY_INSERT Users OFF;

--------------------------------------------------------------------------------
-- 2. PROPERTIES (20 properties distributed among provider_ids 1, 2, and 3)
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Properties ON;

INSERT INTO Properties (id, provider_id, name, property_type, address, latitude, longitude, check_in_time, check_out_time, is_deleted, created_at)
VALUES
(1, 2, 'Nha Trang Luxury Resort', 'resort', N'01 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa', 12.25000000, 109.19000000, '14:00:00', '12:00:00', 0, GETDATE()),
(2, 1, 'Da Nang Seaside Hotel', 'hotel', N'200 Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng', 16.06000000, 108.24000000, '14:00:00', '12:00:00', 0, GETDATE()),
(3, 3, 'Hoi An Ancient Homestay', 'homestay', N'45 Lê Lợi, Minh An, Hội An, Quảng Nam', 15.88000000, 108.33000000, '14:00:00', '12:00:00', 0, GETDATE()),
(4, 2, 'Quy Nhon Beach Villa', 'villa', N'Bãi Dài, Ghềnh Ráng, Quy Nhơn, Bình Định', 13.73000000, 109.21000000, '14:00:00', '12:00:00', 0, GETDATE()),
(5, 2, 'Phu Quoc Sunset Resort', 'resort', N'Bãi Trường, Dương Tơ, Phú Quốc, Kiên Giang', 10.15000000, 103.96000000, '14:00:00', '12:00:00', 0, GETDATE()),
(6, 1, 'Da Lat Pine Hill Homestay', 'homestay', N'12 Triệu Việt Vương, Phường 4, Đà Lạt, Lâm Đồng', 11.93000000, 108.44000000, '14:00:00', '12:00:00', 0, GETDATE()),
(7, 3, 'Vung Tau Ocean View Hotel', 'hotel', N'15 Thùy Vân, Phường Thắng Tam, Vũng Tàu, Bà Rịa - Vũng Tàu', 10.34000000, 107.09000000, '14:00:00', '12:00:00', 0, GETDATE()),
(8, 1, 'Saigon Heritage Hotel', 'hotel', N'88 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh', 10.77000000, 106.70000000, '14:00:00', '12:00:00', 0, GETDATE()),
(9, 2, 'Hanoi Old Quarter Homestay', 'homestay', N'12 Hàng Bạc, Hoàn Kiếm, Hà Nội', 21.03000000, 105.85000000, '14:00:00', '12:00:00', 0, GETDATE()),
(10, 1, 'Mui Ne Sand Dunes Resort', 'resort', N'Nguyễn Đình Chiểu, Hàm Tiến, Phan Thiết, Bình Thuận', 10.95000000, 108.22000000, '14:00:00', '12:00:00', 0, GETDATE()),
(11, 3, 'Sapa Mountain View Villa', 'villa', N'Mường Hoa, Sa Pa, Lào Cai', 22.33000000, 103.84000000, '14:00:00', '12:00:00', 0, GETDATE()),
(12, 3, 'Ha Long Bay Cruise Hotel', 'hotel', N'Tuần Châu, Hạ Long, Quảng Ninh', 20.93000000, 106.99000000, '14:00:00', '12:00:00', 0, GETDATE()),
(13, 2, 'Ninh Binh Eco Garden Homestay', 'homestay', N'Tràng An, Trường Yên, Hoa Lư, Ninh Bình', 20.25000000, 105.90000000, '14:00:00', '12:00:00', 0, GETDATE()),
(14, 1, 'Hue Imperial Hotel', 'hotel', N'22 Lê Lợi, Vĩnh Ninh, Thành phố Huế, Thừa Thiên Huế', 16.46000000, 107.59000000, '14:00:00', '12:00:00', 0, GETDATE()),
(15, 3, 'Phong Nha Cave Homestay', 'homestay', N'Sơn Trạch, Bố Trạch, Quảng Bình', 17.58000000, 106.28000000, '14:00:00', '12:00:00', 0, GETDATE()),
(16, 2, 'Can Tho River Villa', 'villa', N'Cái Răng, Cần Thơ', 10.01000000, 105.74000000, '14:00:00', '12:00:00', 0, GETDATE()),
(17, 2, 'Con Dao Paradise Resort', 'resort', N'Bến Đầm, Côn Đảo, Bà Rịa - Vũng Tàu', 8.68000000, 106.60000000, '14:00:00', '12:00:00', 0, GETDATE()),
(18, 1, 'Phu Yen Cliff Villa', 'villa', N'An Chấn, Tuy An, Phú Yên', 13.16000000, 109.30000000, '14:00:00', '12:00:00', 0, GETDATE()),
(19, 3, 'Buon Ma Thuot Coffee Homestay', 'homestay', N'Trần Nhật Duật, Buôn Ma Thuột, Đắk Lắk', 12.68000000, 108.04000000, '14:00:00', '12:00:00', 0, GETDATE()),
(20, 1, 'Ha Giang Loop Hostel', 'homestay', N'Quản Bạ, Hà Giang', 22.90000000, 104.98000000, '14:00:00', '12:00:00', 0, GETDATE());

SET IDENTITY_INSERT Properties OFF;

--------------------------------------------------------------------------------
-- 3. ROOM TYPES (2 room types for each property, e.g. ids 1-40)
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Room_Types ON;

INSERT INTO Room_Types (id, property_id, name, max_guests, base_price, total_quantity, amenities, is_deleted, created_at)
VALUES
-- Prop 1
(1, 1, 'Standard Double Room', 2, 650000.00, 3, N'Wifi, Air Conditioning, Hot Water, Cable TV, Mini Fridge', 0, GETDATE()),
(2, 1, 'Deluxe Ocean View', 2, 1200000.00, 2, N'Wifi, Air Conditioning, Hot Water, Cable TV, Fridge, Balcony, Bathtub', 0, GETDATE()),
-- Prop 2
(3, 2, 'Standard Double Room', 2, 700000.00, 3, N'Wifi, Air Conditioning, Hot Water, Cable TV', 0, GETDATE()),
(4, 2, 'Executive Suite', 4, 2200000.00, 2, N'Wifi, Air Conditioning, Hot Water, Cable TV, Kitchen, Bathtub', 0, GETDATE()),
-- Prop 3
(5, 3, 'Cozy Double Bed Room', 2, 450000.00, 3, N'Wifi, Fan, Shared Kitchen, Bike Rental Included', 0, GETDATE()),
(6, 3, 'Traditional Family Suite', 4, 900000.00, 2, N'Wifi, Air Conditioning, Garden View, Balcony', 0, GETDATE()),
-- Prop 4
(7, 4, 'Standard Double Room', 2, 850000.00, 3, N'Wifi, Air Conditioning, Cable TV', 0, GETDATE()),
(8, 4, 'Sunset Beach Villa', 4, 3500000.00, 2, N'Wifi, Air Conditioning, Private Pool, Ocean View, Mini Bar', 0, GETDATE()),
-- Prop 5
(9, 5, 'Superior Double Room', 2, 1500000.00, 3, N'Wifi, Air Conditioning, Cable TV, Mini Fridge', 0, GETDATE()),
(10, 5, 'VIP Beachfront Bungalow', 2, 4500000.00, 2, N'Wifi, Air Conditioning, Private Jacuzzi, Sea View, Fruit Basket', 0, GETDATE()),
-- Prop 6
(11, 6, 'Pine View Double Room', 2, 500000.00, 3, N'Wifi, Heater, Balcony, Coffee Maker', 0, GETDATE()),
(12, 6, 'Family Wooden Cabin', 6, 1800000.00, 2, N'Wifi, Heater, Kitchen, Attic, Garden View', 0, GETDATE()),
-- Prop 7
(13, 7, 'Standard Double Room', 2, 600000.00, 3, N'Wifi, Air Conditioning, Hot Water', 0, GETDATE()),
(14, 7, 'Deluxe Ocean View Room', 2, 1100000.00, 2, N'Wifi, Air Conditioning, Balcony, Sea View', 0, GETDATE()),
-- Prop 8
(15, 8, 'Classic Double Room', 2, 1300000.00, 3, N'Wifi, Air Conditioning, Soundproof, Desk', 0, GETDATE()),
(16, 8, 'Heritage Suite', 4, 3000000.00, 2, N'Wifi, Air Conditioning, Living Room, City View, Bathtub', 0, GETDATE()),
-- Prop 9
(17, 9, 'Standard Window Room', 2, 400000.00, 3, N'Wifi, Air Conditioning, Wardrobe', 0, GETDATE()),
(18, 9, 'Old Quarter Balcony Suite', 4, 1000000.00, 2, N'Wifi, Air Conditioning, Balcony, Vintage Decor', 0, GETDATE()),
-- Prop 10
(19, 10, 'Standard Garden Room', 2, 800000.00, 3, N'Wifi, Air Conditioning, Cable TV', 0, GETDATE()),
(20, 10, 'Ocean Pool Villa', 4, 4000000.00, 2, N'Wifi, Air Conditioning, Private Pool, Patio', 0, GETDATE()),
-- Prop 11
(21, 11, 'Mountain View Double', 2, 750000.00, 3, N'Wifi, Heater, Electric Blanket', 0, GETDATE()),
(22, 11, 'Cloud Terrace Suite', 2, 1600000.00, 2, N'Wifi, Heater, Balcony, Bathtub, Fireplace', 0, GETDATE()),
-- Prop 12
(23, 12, 'Standard Cabin Room', 2, 1800000.00, 3, N'Wifi, Air Conditioning, Sea View window', 0, GETDATE()),
(24, 12, 'Executive Cruise Suite', 2, 3500000.00, 2, N'Wifi, Air Conditioning, Private Balcony, Bathtub', 0, GETDATE()),
-- Prop 13
(25, 13, 'River View Homestay Room', 2, 450000.00, 3, N'Wifi, Fan, Bamboo Bed', 0, GETDATE()),
(26, 13, 'Family Garden Cottage', 4, 1100000.00, 2, N'Wifi, Air Conditioning, Kitchen, Garden View', 0, GETDATE()),
-- Prop 14
(27, 14, 'Standard Double Room', 2, 900000.00, 3, N'Wifi, Air Conditioning, Perfume River view', 0, GETDATE()),
(28, 14, 'Imperial Suite', 4, 2800000.00, 2, N'Wifi, Air Conditioning, King Bed, Living Room', 0, GETDATE()),
-- Prop 15
(29, 15, 'Eco Forest Double', 2, 380000.00, 3, N'Wifi, Fan, Mosquito Net', 0, GETDATE()),
(30, 15, 'Mountain View Cabin', 4, 850000.00, 2, N'Wifi, Air Conditioning, Terrace', 0, GETDATE()),
-- Prop 16
(31, 16, 'Garden View Villa Room', 2, 1000000.00, 3, N'Wifi, Air Conditioning, Mini Fridge', 0, GETDATE()),
(32, 16, 'Mekong Riverside Villa', 4, 2700000.00, 2, N'Wifi, Air Conditioning, Private Dock, River View', 0, GETDATE()),
-- Prop 17
(33, 17, 'Standard Hillside Room', 2, 1200000.00, 3, N'Wifi, Air Conditioning, Safe Box', 0, GETDATE()),
(34, 17, 'Beachfront Sanctuary', 2, 3900000.00, 2, N'Wifi, Air Conditioning, Private Path to Beach', 0, GETDATE()),
-- Prop 18
(35, 18, 'Standard Coastal Room', 2, 700000.00, 3, N'Wifi, Air Conditioning, Cable TV', 0, GETDATE()),
(36, 18, 'Ganh Da Dia View Villa', 4, 2500000.00, 2, N'Wifi, Air Conditioning, Scenic Balcony', 0, GETDATE()),
-- Prop 19
(37, 19, 'Coffee Garden Double', 2, 400000.00, 3, N'Wifi, Fan, Coffee tasting session', 0, GETDATE()),
(38, 19, 'Central Highlands Family Room', 5, 1200000.00, 2, N'Wifi, Fan, Large Terrace', 0, GETDATE()),
-- Prop 20
(39, 20, 'Loop View Dorm Room', 1, 200000.00, 10, N'Wifi, Locker, Shared Bathroom', 0, GETDATE()),
(40, 20, 'Mountain View Private Double', 2, 550000.00, 2, N'Wifi, Fan, Balcony', 0, GETDATE());

SET IDENTITY_INSERT Room_Types OFF;

--------------------------------------------------------------------------------
-- 4. ROOMS (Physical rooms. Constraints: digits only, max 3 characters)
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Rooms ON;

INSERT INTO Rooms (id, room_type_id, room_number, status, is_deleted, created_at)
VALUES
-- Room type 1 (Standard Double Room, Prop 1)
(1, 1, '101', 'available', 0, GETDATE()),
(2, 1, '102', 'available', 0, GETDATE()),
(3, 1, '103', 'available', 0, GETDATE()),
-- Room type 2 (Deluxe Ocean View, Prop 1)
(4, 2, '201', 'available', 0, GETDATE()),
(5, 2, '202', 'available', 0, GETDATE()),
-- Room type 3 (Standard Double Room, Prop 2)
(6, 3, '101', 'available', 0, GETDATE()),
(7, 3, '102', 'available', 0, GETDATE()),
(8, 3, '103', 'available', 0, GETDATE()),
-- Room type 4 (Executive Suite, Prop 2)
(9, 4, '301', 'available', 0, GETDATE()),
(10, 4, '302', 'available', 0, GETDATE()),
-- Room type 5 (Cozy Double Bed, Prop 3)
(11, 5, '101', 'available', 0, GETDATE()),
(12, 5, '102', 'available', 0, GETDATE()),
(13, 5, '103', 'available', 0, GETDATE()),
-- Room type 6 (Traditional Family, Prop 3)
(14, 6, '201', 'available', 0, GETDATE()),
(15, 6, '202', 'available', 0, GETDATE()),
-- Room type 7 (Standard, Prop 4)
(16, 7, '101', 'available', 0, GETDATE()),
(17, 7, '102', 'available', 0, GETDATE()),
-- Room type 8 (Villa, Prop 4)
(18, 8, '901', 'available', 0, GETDATE()),
(19, 8, '902', 'available', 0, GETDATE()),
-- Room type 9 (Superior, Prop 5)
(20, 9, '101', 'available', 0, GETDATE()),
(21, 9, '102', 'available', 0, GETDATE()),
-- Room type 10 (Bungalow, Prop 5)
(22, 10, '111', 'available', 0, GETDATE()),
(23, 10, '112', 'available', 0, GETDATE()),
-- Room type 11 (Double, Prop 6)
(24, 11, '101', 'available', 0, GETDATE()),
(25, 11, '102', 'available', 0, GETDATE()),
-- Room type 12 (Cabin, Prop 6)
(26, 12, '221', 'available', 0, GETDATE()),
(27, 12, '222', 'available', 0, GETDATE()),
-- Room type 13 (Standard, Prop 7)
(28, 13, '101', 'available', 0, GETDATE()),
(29, 13, '102', 'available', 0, GETDATE()),
-- Room type 14 (Deluxe Ocean, Prop 7)
(30, 14, '201', 'available', 0, GETDATE()),
(31, 14, '202', 'available', 0, GETDATE()),
-- Room type 15 (Classic, Prop 8)
(32, 15, '401', 'available', 0, GETDATE()),
(33, 15, '402', 'available', 0, GETDATE()),
-- Room type 16 (Suite, Prop 8)
(34, 16, '501', 'available', 0, GETDATE()),
(35, 16, '502', 'available', 0, GETDATE()),
-- Room type 17 (Standard Window, Prop 9)
(36, 17, '101', 'available', 0, GETDATE()),
(37, 17, '102', 'available', 0, GETDATE()),
-- Room type 18 (Balcony Suite, Prop 9)
(38, 18, '201', 'available', 0, GETDATE()),
(39, 18, '202', 'available', 0, GETDATE()),
-- Room type 19 (Garden, Prop 10)
(40, 19, '101', 'available', 0, GETDATE()),
(41, 19, '102', 'available', 0, GETDATE()),
-- Room type 20 (Pool Villa, Prop 10)
(42, 20, '801', 'available', 0, GETDATE()),
(43, 20, '802', 'available', 0, GETDATE()),
-- Room type 21 (Mountain View, Prop 11)
(44, 21, '101', 'available', 0, GETDATE()),
(45, 21, '102', 'available', 0, GETDATE()),
-- Room type 22 (Terrace Suite, Prop 11)
(46, 22, '201', 'available', 0, GETDATE()),
(47, 22, '202', 'available', 0, GETDATE()),
-- Room type 23 (Cabin Room, Prop 12)
(48, 23, '101', 'available', 0, GETDATE()),
(49, 23, '102', 'available', 0, GETDATE()),
-- Room type 24 (Cruise Suite, Prop 12)
(50, 24, '301', 'available', 0, GETDATE()),
(51, 24, '302', 'available', 0, GETDATE()),
-- Room type 25 (River View, Prop 13)
(52, 25, '101', 'available', 0, GETDATE()),
(53, 25, '102', 'available', 0, GETDATE()),
-- Room type 26 (Garden Cottage, Prop 13)
(54, 26, '201', 'available', 0, GETDATE()),
(55, 26, '202', 'available', 0, GETDATE()),
-- Room type 27 (Standard, Prop 14)
(56, 27, '101', 'available', 0, GETDATE()),
(57, 27, '102', 'available', 0, GETDATE()),
-- Room type 28 (Imperial Suite, Prop 14)
(58, 28, '401', 'available', 0, GETDATE()),
(59, 28, '402', 'available', 0, GETDATE()),
-- Room type 29 (Eco Forest, Prop 15)
(60, 29, '101', 'available', 0, GETDATE()),
(61, 29, '102', 'available', 0, GETDATE()),
-- Room type 30 (Mountain Cabin, Prop 15)
(62, 30, '201', 'available', 0, GETDATE()),
(63, 30, '202', 'available', 0, GETDATE()),
-- Room type 31 (Garden View, Prop 16)
(64, 31, '101', 'available', 0, GETDATE()),
(65, 31, '102', 'available', 0, GETDATE()),
-- Room type 32 (Riverside Villa, Prop 16)
(66, 32, '301', 'available', 0, GETDATE()),
(67, 32, '302', 'available', 0, GETDATE()),
-- Room type 33 (Hillside, Prop 17)
(68, 33, '101', 'available', 0, GETDATE()),
(69, 33, '102', 'available', 0, GETDATE()),
-- Room type 34 (Beachfront, Prop 17)
(70, 34, '111', 'available', 0, GETDATE()),
(71, 34, '112', 'available', 0, GETDATE()),
-- Room type 35 (Coastal, Prop 18)
(72, 35, '101', 'available', 0, GETDATE()),
(73, 35, '102', 'available', 0, GETDATE()),
-- Room type 36 (Villa, Prop 18)
(74, 36, '201', 'available', 0, GETDATE()),
(75, 36, '202', 'available', 0, GETDATE()),
-- Room type 37 (Coffee Garden, Prop 19)
(76, 37, '101', 'available', 0, GETDATE()),
(77, 37, '102', 'available', 0, GETDATE()),
-- Room type 38 (Family Room, Prop 19)
(78, 38, '201', 'available', 0, GETDATE()),
(79, 38, '202', 'available', 0, GETDATE()),
-- Room type 39 (Dorm Room, Prop 20)
(80, 39, '101', 'available', 0, GETDATE()),
(81, 39, '102', 'available', 0, GETDATE()),
-- Room type 40 (Private Double, Prop 20)
(82, 40, '201', 'available', 0, GETDATE()),
(83, 40, '202', 'available', 0, GETDATE());

SET IDENTITY_INSERT Rooms OFF;

--------------------------------------------------------------------------------
-- 5. BOOKINGS & DETAILS (20 Bookings made by user_id 5)
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Bookings ON;

INSERT INTO Bookings (id, user_id, property_id, check_in_date, check_out_date, total_price, status, is_deleted, created_at)
VALUES
(1, 5, 1, '2026-06-01', '2026-06-03', 1300000.00, 'pending', 0, GETDATE()),
(2, 5, 2, '2026-06-04', '2026-06-06', 1400000.00, 'confirmed', 0, GETDATE()),
(3, 5, 3, '2026-06-07', '2026-06-09', 900000.00, 'completed', 0, GETDATE()),
(4, 5, 4, '2026-06-10', '2026-06-12', 1700000.00, 'cancelled', 0, GETDATE()),
(5, 5, 5, '2026-06-13', '2026-06-15', 3000000.00, 'pending', 0, GETDATE()),
(6, 5, 6, '2026-06-16', '2026-06-18', 1000000.00, 'confirmed', 0, GETDATE()),
(7, 5, 7, '2026-06-19', '2026-06-21', 1200000.00, 'completed', 0, GETDATE()),
(8, 5, 8, '2026-06-22', '2026-06-24', 2600000.00, 'cancelled', 0, GETDATE()),
(9, 5, 9, '2026-06-25', '2026-06-27', 800000.00, 'pending', 0, GETDATE()),
(10, 5, 10, '2026-06-28', '2026-06-30', 1600000.00, 'confirmed', 0, GETDATE()),
(11, 5, 11, '2026-07-01', '2026-07-03', 1500000.00, 'completed', 0, GETDATE()),
(12, 5, 12, '2026-07-04', '2026-07-06', 3600000.00, 'cancelled', 0, GETDATE()),
(13, 5, 13, '2026-07-07', '2026-07-09', 900000.00, 'pending', 0, GETDATE()),
(14, 5, 14, '2026-07-10', '2026-07-12', 1800000.00, 'confirmed', 0, GETDATE()),
(15, 5, 15, '2026-07-13', '2026-07-15', 760000.00, 'completed', 0, GETDATE()),
(16, 5, 16, '2026-07-16', '2026-07-18', 2000000.00, 'cancelled', 0, GETDATE()),
(17, 5, 17, '2026-07-19', '2026-07-21', 2400000.00, 'pending', 0, GETDATE()),
(18, 5, 18, '2026-07-22', '2026-07-24', 1400000.00, 'confirmed', 0, GETDATE()),
(19, 5, 19, '2026-07-25', '2026-07-27', 800000.00, 'completed', 0, GETDATE()),
(20, 5, 20, '2026-07-28', '2026-07-30', 400000.00, 'pending', 0, GETDATE());

SET IDENTITY_INSERT Bookings OFF;

--------------------------------------------------------------------------------
-- 6. BOOKING DETAILS
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Booking_Details ON;

INSERT INTO Booking_Details (id, booking_id, room_type_id, quantity, price_at_booking, is_deleted)
VALUES
(1, 1, 1, 1, 650000.00, 0),
(2, 2, 3, 1, 700000.00, 0),
(3, 3, 5, 1, 450000.00, 0),
(4, 4, 7, 1, 850000.00, 0),
(5, 5, 9, 1, 1500000.00, 0),
(6, 6, 11, 1, 500000.00, 0),
(7, 7, 13, 1, 600000.00, 0),
(8, 8, 15, 1, 1300000.00, 0),
(9, 9, 17, 1, 400000.00, 0),
(10, 10, 19, 1, 800000.00, 0),
(11, 11, 21, 1, 750000.00, 0),
(12, 12, 23, 1, 1800000.00, 0),
(13, 13, 25, 1, 450000.00, 0),
(14, 14, 27, 1, 900000.00, 0),
(15, 15, 29, 1, 380000.00, 0),
(16, 16, 31, 1, 100000.00, 0),
(17, 17, 33, 1, 1200000.00, 0),
(18, 18, 35, 1, 700000.00, 0),
(19, 19, 37, 1, 400000.00, 0),
(20, 20, 39, 1, 200000.00, 0);

SET IDENTITY_INSERT Booking_Details OFF;

--------------------------------------------------------------------------------
-- 7. ITINERARIES (For traveler user 5)
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Itineraries ON;

INSERT INTO Itineraries (id, user_id, title, status, start_date, end_date, is_deleted, created_at)
VALUES
(1, 5, 'Summer Coastline Trip 2026', 'published', '2026-06-10', '2026-06-15', 0, GETDATE()),
(2, 5, 'Da Lat Pine Forests Escape', 'draft', '2026-06-15', '2026-06-18', 0, GETDATE()),
(3, 5, 'Ha Long Bay & Hanoi Explorer', 'draft', '2026-06-20', '2026-06-25', 0, GETDATE());

SET IDENTITY_INSERT Itineraries OFF;

--------------------------------------------------------------------------------
-- 8. ITINERARY LOCATIONS
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Itinerary_Locations ON;

INSERT INTO Itinerary_Locations (id, itinerary_id, property_id, custom_name, latitude, longitude, visit_time, order_index, is_deleted, created_at)
VALUES
-- Itinerary 1 (Nha Trang / Da Nang / Hoi An / Quy Nhon)
(1, 1, 1, NULL, 12.25000000, 109.19000000, '2026-06-10 09:00:00', 0, 0, GETDATE()),
(2, 1, 2, NULL, 16.06000000, 108.24000000, '2026-06-11 10:00:00', 1, 0, GETDATE()),
(3, 1, 3, NULL, 15.88000000, 108.33000000, '2026-06-12 14:00:00', 2, 0, GETDATE()),
(4, 1, 4, NULL, 13.73000000, 109.21000000, '2026-06-13 16:30:00', 3, 0, GETDATE()),
-- Itinerary 2 (Da Lat)
(5, 2, 6, NULL, 11.93000000, 108.44000000, '2026-06-15 09:00:00', 0, 0, GETDATE()),
(6, 2, NULL, N'Đồi Chè Cầu Đất', 11.85000000, 108.55000000, '2026-06-16 08:30:00', 1, 0, GETDATE()),
(7, 2, NULL, N'Hồ Tuyền Lâm', 11.90000000, 108.43000000, '2026-06-17 15:00:00', 2, 0, GETDATE()),
-- Itinerary 3 (Hanoi / Ha Long)
(8, 3, 9, NULL, 21.03000000, 105.85000000, '2026-06-20 09:00:00', 0, 0, GETDATE()),
(9, 3, 12, NULL, 20.93000000, 106.99000000, '2026-06-22 12:00:00', 1, 0, GETDATE()),
(10, 3, NULL, N'Lăng Chủ Tịch Hồ Chí Minh', 21.03600000, 105.83400000, '2026-06-23 08:00:00', 2, 0, GETDATE());

SET IDENTITY_INSERT Itinerary_Locations OFF;

--------------------------------------------------------------------------------
-- 9. ITINERARY NOTES
--------------------------------------------------------------------------------
SET IDENTITY_INSERT Itinerary_Notes ON;

INSERT INTO Itinerary_Notes (id, itinerary_id, content, is_checked, is_deleted, created_at)
VALUES
(1, 1, N'Check weather forecast, pack sunblock, camera gear, and booking vouchers.', 0, 0, GETDATE()),
(2, 1, N'Try famous local food spots recommended by locals in Nha Trang and Hoi An.', 1, 0, GETDATE()),
(3, 2, N'Bring warm jacket because Da Lat can get very cold at night.', 0, 0, GETDATE()),
(4, 3, N'Book Sapa train tickets in advance if planning to extend the trip.', 0, 0, GETDATE());

SET IDENTITY_INSERT Itinerary_Notes OFF;
