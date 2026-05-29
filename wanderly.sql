CREATE DATABASE wanderly
go
USE wanderly
go

-- 1. Bảng Users
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
	full_name NVARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL 
        CHECK (role IN ('traveler', 'provider', 'admin'))
		DEFAULT('traveler'),
    is_verified BIT DEFAULT 0,
    verify_token VARCHAR(255) NULL,
    reset_pass_token VARCHAR(255) NULL,
    token_expiry DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    avatar NVARCHAR(MAX) NULL,
    phone_number VARCHAR(20) NULL
);

-- 2. Bảng Properties
CREATE TABLE Properties (
    id INT IDENTITY(1,1) PRIMARY KEY,
    provider_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL
        CHECK (property_type IN ('hotel', 'homestay', 'resort', 'villa')),
    address NVARCHAR(MAX) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    check_in_time TIME NOT NULL,
    check_out_time TIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_Properties_Users
        FOREIGN KEY (provider_id) REFERENCES Users(id)
        ON DELETE CASCADE
);

-- 3. Bảng Room_Types
CREATE TABLE Room_Types (
    id INT IDENTITY(1,1) PRIMARY KEY,
    property_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    max_guests INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    total_quantity INT NOT NULL,
    amenities NVARCHAR(MAX) NULL, -- lưu JSON string
    created_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_RoomTypes_Properties
        FOREIGN KEY (property_id) REFERENCES Properties(id)
        ON DELETE CASCADE
);

-- 4. Bảng Rooms
CREATE TABLE Rooms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_type_id INT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'maintenance')),
    created_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_Rooms_RoomTypes
        FOREIGN KEY (room_type_id) REFERENCES Room_Types(id)
        ON DELETE CASCADE
);

-- 5. Bảng Itineraries
CREATE TABLE Itineraries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'completed')),
    start_date DATE NULL,
    end_date DATE NULL,
    created_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_Itineraries_Users
        FOREIGN KEY (user_id) REFERENCES Users(id)
        ON DELETE CASCADE,
    CONSTRAINT CHK_Itinerary_Dates
        CHECK (
            start_date IS NULL 
            OR end_date IS NULL 
            OR end_date >= start_date
        )
);

-- 6. Bảng Itinerary_Locations
CREATE TABLE Itinerary_Locations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    itinerary_id INT NOT NULL,
    property_id INT NULL,
    custom_name VARCHAR(255) NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    visit_time DATETIME NULL,
    order_index INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_Locations_Itineraries
        FOREIGN KEY (itinerary_id) REFERENCES Itineraries(id)
        ON DELETE CASCADE,
    CONSTRAINT FK_Locations_Properties
        FOREIGN KEY (property_id) REFERENCES Properties(id),
    CONSTRAINT UQ_Itinerary_Order 
        UNIQUE (itinerary_id, order_index),
    CONSTRAINT CHK_Location_Source
        CHECK (
            property_id IS NOT NULL 
            OR custom_name IS NOT NULL
        )
);

-- 7. Bảng Itinerary_Notes
CREATE TABLE Itinerary_Notes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    itinerary_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    is_checked BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_Notes_Itineraries
        FOREIGN KEY (itinerary_id) REFERENCES Itineraries(id)
        ON DELETE CASCADE
);

-- 8. Bảng Bookings
CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_Bookings_Users
        FOREIGN KEY (user_id) REFERENCES Users(id),
    CONSTRAINT FK_Bookings_Properties
        FOREIGN KEY (property_id) REFERENCES Properties(id),
    CONSTRAINT CHK_Booking_Dates
        CHECK (check_out_date > check_in_date)
);

-- 9. Bảng Booking_Details
CREATE TABLE Booking_Details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    room_type_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_booking DECIMAL(10,2) NOT NULL,
    is_deleted BIT DEFAULT 0,
    CONSTRAINT FK_Details_Bookings
        FOREIGN KEY (booking_id) REFERENCES Bookings(id)
        ON DELETE CASCADE,
    CONSTRAINT FK_Details_RoomTypes
        FOREIGN KEY (room_type_id) REFERENCES Room_Types(id),
    CONSTRAINT CHK_Quantity
        CHECK (quantity > 0)
);