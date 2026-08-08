CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    whatsapp_number VARCHAR(100),
    instagram_handle VARCHAR(100),
    website VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    description TEXT,
    momo_wallet_number VARCHAR(100),
    momo_provider VARCHAR(50),
    paystack_recipient_code VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_amount NUMERIC(12,2),
    price_currency VARCHAR(10),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    location_details VARCHAR(255),
    embedding vector(768),
    whatsapp_booking_link VARCHAR(255),
    instagram_handle VARCHAR(100),
    external_place_id VARCHAR(100),
    image_urls TEXT[],
    tags TEXT[],
    duration_hours INT,
    max_group_size INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination VARCHAR(255),
    country VARCHAR(100),
    total_days INT,
    generated_json TEXT,
    pace VARCHAR(50),
    estimated_total_cost_usd DOUBLE PRECISION,
    preferred_language VARCHAR(50),
    tourist_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    tourist_email VARCHAR(255),
    tourist_name VARCHAR(255),
    paystack_reference VARCHAR(255) UNIQUE NOT NULL,
    amount_usd NUMERIC(12,2),
    platform_fee_usd NUMERIC(12,2),
    operator_amount_local NUMERIC(12,2),
    operator_currency VARCHAR(10),
    settlement_transfer_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
    group_size INT DEFAULT 1,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    settled_at TIMESTAMP
);
