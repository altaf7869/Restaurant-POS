-- Run this in your SQL Server to create schema and sample data
CREATE TABLE Users (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Username VARCHAR(100) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  Role VARCHAR(20) NOT NULL,
  FullName VARCHAR(200),
  CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE RestaurantTables (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  TableNumber INT NOT NULL UNIQUE,
  Status VARCHAR(20) NOT NULL DEFAULT 'free',
  CurrentOrderId INT NULL
);

CREATE TABLE MenuItems (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name VARCHAR(200) NOT NULL,
  Description VARCHAR(500) NULL,
  Price DECIMAL(10,2) NOT NULL,
  IsActive BIT DEFAULT 1
);

CREATE TABLE Orders (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  TableId INT NULL,
  WaiterId INT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'pending',
  SubTotal DECIMAL(12,2) DEFAULT 0,
  Tax DECIMAL(12,2) DEFAULT 0,
  Discount DECIMAL(12,2) DEFAULT 0,
  Total DECIMAL(12,2) DEFAULT 0,
  PaymentMethod VARCHAR(50) NULL,
  CreatedAt DATETIME DEFAULT GETDATE(),
  SubmittedAt DATETIME NULL,
  PaidAt DATETIME NULL
);

CREATE TABLE OrderItems (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  OrderId INT NOT NULL,
  MenuItemId INT NOT NULL,
  Qty INT NOT NULL,
  Rate DECIMAL(12,2) NOT NULL,
  Amount DECIMAL(12,2) NOT NULL,
  Remarks VARCHAR(500) NULL
);

CREATE TABLE Payments (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  OrderId INT NOT NULL,
  Amount DECIMAL(12,2) NOT NULL,
  Method VARCHAR(50) NOT NULL,
  CollectedBy INT NULL,
  CollectedAt DATETIME DEFAULT GETDATE()
);

-- sample data
INSERT INTO MenuItems (Name, Description, Price) VALUES
('Chicken Biryani','Aromatic chicken biryani',250.00),
('Mutton Curry','Spicy mutton curry',320.00),
('Naan','Indian flatbread',30.00),
('Veg Salad','Fresh salad',80.00);

INSERT INTO RestaurantTables (TableNumber, Status) VALUES (1,'free'),(2,'free'),(3,'free'),(4,'free');

-- Create sample users with known passwords (bcrypt hashes)
-- Password for all: password123
-- Generate bcrypt hash in Node.js and replace below. For quick start, you can create users through app or replace with real hashes.
