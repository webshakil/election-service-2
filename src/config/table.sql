//latest tables
-- Database Schema for Vottery Election Service

-- 1. Main Elections Table
CREATE TABLE vottery_elections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    topic_image_url TEXT,
    topic_video_url TEXT,
    logo_branding_url TEXT,
    custom_voting_url VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    voting_type VARCHAR(50) NOT NULL CHECK (voting_type IN ('plurality', 'ranked_choice', 'approval')),
    permission_to_vote VARCHAR(50) NOT NULL CHECK (permission_to_vote IN ('open', 'registered', 'country_specific')),
    auth_method VARCHAR(50) NOT NULL DEFAULT 'passkey' CHECK (auth_method IN ('passkey', 'oauth', 'magic_link', 'email_password')),
    biometric_required BOOLEAN DEFAULT FALSE,
    allow_oauth BOOLEAN DEFAULT TRUE,
    allow_magic_link BOOLEAN DEFAULT TRUE,
    allow_email_password BOOLEAN DEFAULT TRUE,
    is_country_specific BOOLEAN DEFAULT FALSE,
    countries JSONB,
    pricing_type VARCHAR(50) DEFAULT 'free' CHECK (pricing_type IN ('free', 'general', 'regional')),
    is_paid BOOLEAN DEFAULT FALSE,
    participation_fee DECIMAL(10,2) DEFAULT 0,
    regional_fees JSONB,
    processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
    projected_revenue DECIMAL(12,2) DEFAULT 0,
    revenue_share_percentage DECIMAL(5,2) DEFAULT 0,
    show_live_results BOOLEAN DEFAULT TRUE,
    allow_vote_editing BOOLEAN DEFAULT TRUE,
    custom_css TEXT,
    brand_colors JSONB,
    primary_language VARCHAR(10) DEFAULT 'en',
    supports_multilang BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT FALSE,
    creator_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_saved TIMESTAMP
);

-- 2. Questions Table
CREATE TABLE vottery_election_questions (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL REFERENCES vottery_elections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'open_answer', 'image_based')),
    question_image_url TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    allow_other_option BOOLEAN DEFAULT FALSE,
    character_limit INTEGER DEFAULT 5000,
    question_order INTEGER NOT NULL,
    question_external_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Answers Table
CREATE TABLE vottery_question_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES vottery_election_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    answer_image_url TEXT,
    answer_order INTEGER NOT NULL,
    answer_external_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Lottery Configuration Table
CREATE TABLE vottery_election_lottery (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL REFERENCES vottery_elections(id) ON DELETE CASCADE,
    is_lotterized BOOLEAN DEFAULT FALSE,
    reward_type VARCHAR(50) CHECK (reward_type IN ('monetary', 'non_monetary', 'revenue_share')),
    reward_amount DECIMAL(12,2),
    non_monetary_reward TEXT,
    winner_count INTEGER DEFAULT 1,
    lottery_active BOOLEAN DEFAULT FALSE,
    draw_completed BOOLEAN DEFAULT FALSE,
    draw_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Image Uploads Tracking Table
CREATE TABLE vottery_election_images (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL REFERENCES vottery_elections(id) ON DELETE CASCADE,
    image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('topic', 'logo', 'question', 'answer')),
    cloudinary_public_id VARCHAR(255) NOT NULL,
    cloudinary_url TEXT NOT NULL,
    original_filename VARCHAR(255),
    upload_status VARCHAR(50) DEFAULT 'completed' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
    reference_id INTEGER, -- Can reference question_id or answer_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_vottery_elections_creator_id ON vottery_elections(creator_id);
CREATE INDEX idx_vottery_elections_is_published ON vottery_elections(is_published);
CREATE INDEX idx_vottery_elections_start_date ON vottery_elections(start_date);
CREATE INDEX idx_vottery_election_questions_election_id ON vottery_election_questions(election_id);
CREATE INDEX idx_vottery_question_answers_question_id ON vottery_question_answers(question_id);
CREATE INDEX idx_vottery_election_lottery_election_id ON vottery_election_lottery(election_id);
CREATE INDEX idx_vottery_election_images_election_id ON vottery_election_images(election_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_vottery_elections_updated_at BEFORE UPDATE ON vottery_elections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vottery_election_questions_updated_at BEFORE UPDATE ON vottery_election_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vottery_question_answers_updated_at BEFORE UPDATE ON vottery_question_answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vottery_election_lottery_updated_at BEFORE UPDATE ON vottery_election_lottery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



























































//old tables

-- Complete Database Migration for vottery_election-2
-- All Tables Creation Script

-- Create main elections table
CREATE TABLE IF NOT EXISTS vottery_election_2 (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    voting_body_content TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    voting_type VARCHAR(20) NOT NULL DEFAULT 'plurality' CHECK (voting_type IN ('plurality', 'ranked_choice', 'approval')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    authentication_method VARCHAR(20) NOT NULL DEFAULT 'passkey' CHECK (authentication_method IN ('passkey', 'oauth', 'magic_link', 'email_password')),
    biometric_required BOOLEAN DEFAULT FALSE,
    topic_image_url TEXT,
    topic_video_url TEXT,
    custom_voting_url VARCHAR(500) UNIQUE,
    unique_election_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    is_content_creator_election BOOLEAN DEFAULT FALSE,
    content_creator_stage VARCHAR(30) CHECK (content_creator_stage IN ('subscription_icon', 'visibility_control', 'personalized_voting', 'lottery_results')),
    vottery_icon_url TEXT,
    icon_visible BOOLEAN DEFAULT FALSE,
    one_time_links_enabled BOOLEAN DEFAULT FALSE,
    projected_revenue_amount DECIMAL(15,2),
    supported_languages JSONB DEFAULT '["en"]',
    translated_content JSONB DEFAULT '{}',
    show_live_results BOOLEAN DEFAULT FALSE,
    allow_vote_editing BOOLEAN DEFAULT FALSE,
    results_visible_during_voting BOOLEAN DEFAULT FALSE,
    total_votes INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    encryption_enabled BOOLEAN DEFAULT TRUE,
    digital_signatures_enabled BOOLEAN DEFAULT TRUE,
    audit_trail_enabled BOOLEAN DEFAULT TRUE,
    cloned_from INTEGER REFERENCES vottery_election_2(id),
    clone_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_creator FOREIGN KEY (creator_id) REFERENCES vottery_user_management(id) ON DELETE RESTRICT,
    CONSTRAINT chk_dates CHECK (end_date > start_date),
    CONSTRAINT chk_revenue CHECK (projected_revenue_amount IS NULL OR projected_revenue_amount >= 0)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS vottery_question_2 (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL REFERENCES vottery_election_2(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'open_text', 'image_based', 'comparison')),
    question_order INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    min_selections INTEGER DEFAULT 1,
    max_selections INTEGER DEFAULT 1,
    text_min_length INTEGER DEFAULT 1,
    text_max_length INTEGER DEFAULT 5000,
    question_image_url TEXT,
    comparison_items JSONB DEFAULT '[]',
    comparison_type VARCHAR(20) CHECK (comparison_type IN ('head_to_head', 'ranking', 'approval')),
    plurality_config JSONB DEFAULT '{"allow_single_selection": true, "show_results_immediately": false}',
    ranked_choice_config JSONB DEFAULT '{"require_full_ranking": true, "elimination_rounds": true, "show_elimination_process": false}',
    approval_config JSONB DEFAULT '{"min_approvals": 1, "max_approvals": null, "show_approval_count": false}',
    translated_questions JSONB DEFAULT '{}',
    response_count INTEGER DEFAULT 0,
    skip_count INTEGER DEFAULT 0,
    display_condition JSONB DEFAULT NULL,
    parent_question_id INTEGER REFERENCES vottery_question_2(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create answers table
CREATE TABLE IF NOT EXISTS vottery_answer_2 (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES vottery_question_2(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_image_url TEXT,
    answer_order INTEGER NOT NULL DEFAULT 1,
    is_correct BOOLEAN DEFAULT FALSE,
    weight DECIMAL(5,2) DEFAULT 1.0,
    comparison_item_id VARCHAR(100),
    comparison_attributes JSONB DEFAULT '{}',
    image_description TEXT,
    image_alt_text VARCHAR(255),
    image_metadata JSONB DEFAULT '{}',
    translated_answers JSONB DEFAULT '{}',
    selection_count INTEGER DEFAULT 0,
    ranking_sum INTEGER DEFAULT 0,
    approval_count INTEGER DEFAULT 0,
    display_condition JSONB DEFAULT NULL,
    validation_rules JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create election access control table
CREATE TABLE IF NOT EXISTS vottery_election_access_2 (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL UNIQUE REFERENCES vottery_election_2(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) NOT NULL DEFAULT 'world_citizens' CHECK (permission_type IN ('registered_members', 'world_citizens', 'country_residents')),
    organization_id INTEGER,
    group_id INTEGER,
    member_list JSONB DEFAULT '[]',
    allowed_countries JSONB DEFAULT '[]',
    blocked_countries JSONB DEFAULT '[]',
    pricing_type VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid_general', 'paid_regional')),
    general_fee DECIMAL(10,2) DEFAULT 0.00,
    general_fee_currency VARCHAR(3) DEFAULT 'USD',
    regional_fees JSONB DEFAULT '{}',
    processing_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    payment_methods_enabled JSONB DEFAULT '["stripe", "paypal", "google_pay", "apple_pay"]',
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 1,
    ip_geolocation_enabled BOOLEAN DEFAULT TRUE,
    vpn_detection_enabled BOOLEAN DEFAULT FALSE,
    min_age INTEGER,
    max_age INTEGER,
    age_verification_required BOOLEAN DEFAULT FALSE,
    whitelist_emails JSONB DEFAULT '[]',
    blacklist_emails JSONB DEFAULT '[]',
    whitelist_domains JSONB DEFAULT '[]',
    blacklist_domains JSONB DEFAULT '[]',
    early_access_enabled BOOLEAN DEFAULT FALSE,
    early_access_start TIMESTAMP WITH TIME ZONE,
    early_access_users JSONB DEFAULT '[]',
    total_access_attempts INTEGER DEFAULT 0,
    successful_authentications INTEGER DEFAULT 0,
    failed_authentications INTEGER DEFAULT 0,
    blocked_attempts INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create election branding table
CREATE TABLE IF NOT EXISTS vottery_election_branding_2 (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL UNIQUE REFERENCES vottery_election_2(id) ON DELETE CASCADE,
    logo_url TEXT,
    logo_position VARCHAR(20) DEFAULT 'top-center' CHECK (logo_position IN ('top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right')),
    logo_size VARCHAR(10) DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large')),
    favicon_url TEXT,
    background_image_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#007bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    accent_color VARCHAR(7) DEFAULT '#28a745',
    background_color VARCHAR(7) DEFAULT '#ffffff',
    text_color VARCHAR(7) DEFAULT '#212529',
    button_color VARCHAR(7) DEFAULT '#007bff',
    button_text_color VARCHAR(7) DEFAULT '#ffffff',
    font_family VARCHAR(100) DEFAULT 'Inter, system-ui, sans-serif',
    heading_font VARCHAR(100),
    body_font VARCHAR(100),
    font_size VARCHAR(10) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    corporate_style_enabled BOOLEAN DEFAULT FALSE,
    white_label_enabled BOOLEAN DEFAULT FALSE,
    hide_vottery_branding BOOLEAN DEFAULT FALSE,
    custom_css TEXT,
    custom_javascript TEXT,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    border_radius INTEGER DEFAULT 8,
    shadow_enabled BOOLEAN DEFAULT TRUE,
    animations_enabled BOOLEAN DEFAULT TRUE,
    content_creator_branding JSONB DEFAULT '{"enabled": false, "creator_name": "", "creator_logo_url": "", "creator_colors": {"primary": "#007bff", "secondary": "#6c757d"}, "integration_style": "embedded"}',
    social_sharing_enabled BOOLEAN DEFAULT TRUE,
    social_share_image_url TEXT,
    social_share_title VARCHAR(200),
    social_share_description TEXT,
    email_header_image_url TEXT,
    email_signature TEXT,
    mobile_logo_url TEXT,
    mobile_optimized BOOLEAN DEFAULT TRUE,
    high_contrast_mode BOOLEAN DEFAULT FALSE,
    accessibility_features JSONB DEFAULT '{"screen_reader_optimized": true, "keyboard_navigation": true, "focus_indicators": true, "alt_text_required": true}',
    localized_branding JSONB DEFAULT '{}',
    branding_version INTEGER DEFAULT 1,
    last_preview_generated TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create election lottery table
CREATE TABLE IF NOT EXISTS vottery_election_lottery_2 (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL UNIQUE REFERENCES vottery_election_2(id) ON DELETE CASCADE,
    lottery_enabled BOOLEAN DEFAULT FALSE,
    lottery_trigger_time TIMESTAMP WITH TIME ZONE,
    auto_trigger_at_election_end BOOLEAN DEFAULT TRUE,
    prize_type VARCHAR(20) CHECK (prize_type IN ('monetary', 'non_monetary', 'projected_revenue')),
    monetary_amount DECIMAL(15,2),
    monetary_currency VARCHAR(3) DEFAULT 'USD',
    non_monetary_description TEXT,
    non_monetary_value_estimate DECIMAL(15,2),
    non_monetary_provider VARCHAR(200),
    voucher_codes JSONB DEFAULT '[]',
    projected_revenue_amount DECIMAL(15,2),
    projected_revenue_percentage DECIMAL(5,2),
    actual_revenue_amount DECIMAL(15,2),
    revenue_source VARCHAR(100),
    winner_count INTEGER DEFAULT 1 CHECK (winner_count >= 1 AND winner_count <= 100),
    prize_distribution JSONB DEFAULT '[{"rank": 1, "percentage": 100}]',
    machine_visible BOOLEAN DEFAULT TRUE,
    machine_animation_enabled BOOLEAN DEFAULT TRUE,
    machine_style VARCHAR(20) DEFAULT 'transparent_oval' CHECK (machine_style IN ('transparent_oval', 'classic_sphere', 'modern_cylinder')),
    ball_color_scheme VARCHAR(20) DEFAULT 'rainbow' CHECK (ball_color_scheme IN ('rainbow', 'monochrome', 'custom')),
    custom_ball_colors JSONB DEFAULT '["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]',
    lottery_executed BOOLEAN DEFAULT FALSE,
    execution_timestamp TIMESTAMP WITH TIME ZONE,
    execution_method VARCHAR(20) CHECK (execution_method IN ('automatic', 'manual', 'scheduled')),
    rng_algorithm VARCHAR(30) DEFAULT 'crypto_random' CHECK (rng_algorithm IN ('crypto_random', 'mersenne_twister', 'linear_congruential')),
    rng_seed VARCHAR(100),
    winners JSONB DEFAULT '[]',
    winner_selection_log JSONB DEFAULT '[]',
    total_prize_pool DECIMAL(15,2) DEFAULT 0.00,
    sponsor_contributions JSONB DEFAULT '[]',
    creator_contribution DECIMAL(15,2) DEFAULT 0.00,
    prizes_distributed BOOLEAN DEFAULT FALSE,
    distribution_method VARCHAR(20) DEFAULT 'automatic' CHECK (distribution_method IN ('automatic', 'manual', 'hybrid')),
    distribution_threshold DECIMAL(10,2) DEFAULT 100.00,
    distribution_log JSONB DEFAULT '[]',
    eligible_participants INTEGER DEFAULT 0,
    total















    //new

    -- Create elections table for vottery election creation service
-- Database: vottery_election_2

CREATE TABLE IF NOT EXISTS vottery_elections_2 (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    topic_image_url TEXT,
    topic_video_url TEXT,
    start_date DATE,
    start_time TIME,
    end_date DATE,
    end_time TIME,
    voting_type VARCHAR(30) NOT NULL CHECK (voting_type IN ('plurality', 'ranked_choice', 'approval')),
    creator_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'paused')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en-US',
    custom_url VARCHAR(100) UNIQUE,
    corporate_style JSONB,
    logo_branding_url TEXT,
    results_visible BOOLEAN DEFAULT FALSE,
    vote_editing_allowed BOOLEAN DEFAULT FALSE,
    meta_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    
    -- Foreign key constraint
    CONSTRAINT fk_elections_creator 
        FOREIGN KEY (creator_id) 
        REFERENCES vottery_user_management(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_elections_creator_id ON vottery_elections_2(creator_id);
CREATE INDEX IF NOT EXISTS idx_elections_status ON vottery_elections_2(status);
CREATE INDEX IF NOT EXISTS idx_elections_custom_url ON vottery_elections_2(custom_url);
CREATE INDEX IF NOT EXISTS idx_elections_start_date ON vottery_elections_2(start_date);
CREATE INDEX IF NOT EXISTS idx_elections_end_date ON vottery_elections_2(end_date);
CREATE INDEX IF NOT EXISTS idx_elections_voting_type ON vottery_elections_2(voting_type);
CREATE INDEX IF NOT EXISTS idx_elections_deleted_at ON vottery_elections_2(deleted_at);
CREATE INDEX IF NOT EXISTS idx_elections_created_at ON vottery_elections_2(created_at);

-- Create composite indexes
CREATE INDEX IF NOT EXISTS idx_elections_creator_status ON vottery_elections_2(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_elections_status_dates ON vottery_elections_2(status, start_date, end_date);

-- Create GIN index for JSONB columns
CREATE INDEX IF NOT EXISTS idx_elections_meta_data_gin ON vottery_elections_2 USING GIN(meta_data);
CREATE INDEX IF NOT EXISTS idx_elections_corporate_style_gin ON vottery_elections_2 USING GIN(corporate_style);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_elections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_elections_updated_at ON vottery_elections_2;
CREATE TRIGGER trigger_update_elections_updated_at
    BEFORE UPDATE ON vottery_elections_2
    FOR EACH ROW
    EXECUTE FUNCTION update_elections_updated_at();

-- Add comments for documentation
COMMENT ON TABLE vottery_elections_2 IS 'Main elections table for storing election/poll information';
COMMENT ON COLUMN vottery_elections_2.id IS 'Primary key, unique election identifier';
COMMENT ON COLUMN vottery_elections_2.title IS 'Election title/name';
COMMENT ON COLUMN vottery_elections_2.description IS 'Detailed election description';
COMMENT ON COLUMN vottery_elections_2.topic_image_url IS 'Main election image URL from Cloudinary';
COMMENT ON COLUMN vottery_elections_2.topic_video_url IS 'Election video URL from Cloudinary';
COMMENT ON COLUMN vottery_elections_2.voting_type IS 'Type of voting: plurality, ranked_choice, or approval';
COMMENT ON COLUMN vottery_elections_2.creator_id IS 'Foreign key to user who created the election';
COMMENT ON COLUMN vottery_elections_2.status IS 'Current election status';
COMMENT ON COLUMN vottery_elections_2.custom_url IS 'Custom URL slug for the election';
COMMENT ON COLUMN vottery_elections_2.corporate_style IS 'JSON configuration for election branding';
COMMENT ON COLUMN vottery_elections_2.results_visible IS 'Whether vote results are visible during voting';
COMMENT ON COLUMN vottery_elections_2.vote_editing_allowed IS 'Whether voters can edit their votes';
COMMENT ON COLUMN vottery_elections_2.meta_data IS 'Additional metadata in JSON format';
COMMENT ON COLUMN vottery_elections_2.deleted_at IS 'Soft delete timestamp';

-- Insert sample data (optional - for development)
-- INSERT INTO vottery_elections_2 (title, description, voting_type, creator_id, custom_url) 
-- VALUES 
--     ('Sample Election', 'This is a sample election for testing', 'plurality', 1, 'sample-election-2024'),
--     ('Presidential Poll', 'Who would you vote for president?', 'ranked_choice', 1, 'presidential-poll-2024');

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON vottery_elections_2 TO vottery_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE vottery_elections_2_id_seq TO vottery_app_user;








-- Create election security tables for vottery election creation service
-- Database: vottery_election_2

CREATE TABLE IF NOT EXISTS vottery_election_security_2 (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL,
    encryption_enabled BOOLEAN DEFAULT TRUE,
    digital_signatures_enabled BOOLEAN DEFAULT TRUE,
    audit_trail_enabled BOOLEAN DEFAULT TRUE,
    hash_algorithm VARCHAR(20) DEFAULT 'sha256' CHECK (hash_algorithm IN ('md5', 'sha1', 'sha256', 'sha512', 'blake2b')),
    encryption_method VARCHAR(30) DEFAULT 'aes-256-gcm' CHECK (encryption_method IN ('aes-256-gcm', 'aes-256-cbc', 'rsa-oaep', 'ecdh')),
    key_length INTEGER DEFAULT 256 CHECK (key_length IN (128, 192, 256, 512, 1024, 2048, 4096)),
    public_key TEXT,
    private_key_hash VARCHAR(64),
    certificate_info JSONB DEFAULT '{}',
    zero_knowledge_proofs_enabled BOOLEAN DEFAULT FALSE,
    mixnet_enabled BOOLEAN DEFAULT FALSE,
    threshold_encryption BOOLEAN DEFAULT FALSE,
    key_escrow_enabled BOOLEAN DEFAULT FALSE,
    biometric_hash_method VARCHAR(30),
    anonymity_level VARCHAR(20) DEFAULT 'standard' CHECK (anonymity_level IN ('basic', 'standard', 'high', 'maximum')),
    tamper_evidence JSONB DEFAULT '{}',
    blockchain_anchoring BOOLEAN DEFAULT FALSE,
    blockchain_network VARCHAR(50),
    blockchain_contract_address VARCHAR(100),
    compliance_standards JSONB DEFAULT '{}',
    security_audit_date TIMESTAMP WITHOUT TIME ZONE,
    security_audit_report TEXT,
    penetration_test_date TIMESTAMP WITHOUT TIME ZONE,
    vulnerability_scan_date TIMESTAMP WITHOUT TIME ZONE,
    security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
    meta_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_security_election 
        FOREIGN KEY (election_id) 
        REFERENCES vottery_elections_2(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint - one security config per election
    CONSTRAINT unique_election_security UNIQUE (election_id)
);

-- Create indexes for security table
CREATE INDEX IF NOT EXISTS idx_security_election_id ON vottery_election_security_2(election_id);
CREATE INDEX IF NOT EXISTS idx_security_encryption_enabled ON vottery_election_security_2(encryption_enabled);
CREATE INDEX IF NOT EXISTS idx_security_anonymity_level ON vottery_election_security_2(anonymity_level);
CREATE INDEX IF NOT EXISTS idx_security_blockchain_enabled ON vottery_election_security_2(blockchain_anchoring);
CREATE INDEX IF NOT EXISTS idx_security_audit_date ON vottery_election_security_2(security_audit_date);
CREATE INDEX IF NOT EXISTS idx_security_score ON vottery_election_security_2(security_score);

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_security_certificate_info_gin ON vottery_election_security_2 USING GIN(certificate_info);
CREATE INDEX IF NOT EXISTS idx_security_tamper_evidence_gin ON vottery_election_security_2 USING GIN(tamper_evidence);
CREATE INDEX IF NOT EXISTS idx_security_compliance_gin ON vottery_election_security_2 USING GIN(compliance_standards);
CREATE INDEX IF NOT EXISTS idx_security_meta_data_gin ON vottery_election_security_2 USING GIN(meta_data);

-- Create audit trail table for all election activities
CREATE TABLE IF NOT EXISTS vottery_election_audit_2 (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) DEFAULT 'election',
    resource_id INTEGER,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    api_endpoint VARCHAR(200),
    http_method VARCHAR(10),
    response_status INTEGER,
    execution_time_ms INTEGER,
    data_before JSONB,
    data_after JSONB,
    cryptographic_hash VARCHAR(64),
    digital_signature TEXT,
    blockchain_hash VARCHAR(64),
    blockchain_transaction_id VARCHAR(100),
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    anomaly_detected BOOLEAN DEFAULT FALSE,
    anomaly_score DECIMAL(3,2) DEFAULT 0.0 CHECK (anomaly_score >= 0.0 AND anomaly_score <= 1.0),
    geolocation JSONB DEFAULT '{}',
    device_fingerprint VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_audit_election 
        FOREIGN KEY (election_id) 
        REFERENCES vottery_elections_2(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_audit_user 
        FOREIGN KEY (user_id) 
        REFERENCES vottery_user_management(id) 
        ON DELETE SET NULL
);

-- Create indexes for audit table
CREATE INDEX IF NOT EXISTS idx_audit_election_id ON vottery_election_audit_2(election_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON vottery_election_audit_2(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON vottery_election_audit_2(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource_type ON vottery_election_audit_2(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON vottery_election_audit_2(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_ip_address ON vottery_election_audit_2(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_risk_level ON vottery_election_audit_2(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_anomaly_detected ON vottery_election_audit_2(anomaly_detected);

-- Create composite indexes
CREATE INDEX IF NOT EXISTS idx_audit_election_action ON vottery_election_audit_2(election_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON vottery_election_audit_2(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_created_risk ON vottery_election_audit_2(created_at, risk_level);

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_audit_details_gin ON vottery_election_audit_2 USING GIN(details);
CREATE INDEX IF NOT EXISTS idx_audit_data_before_gin ON vottery_election_audit_2 USING GIN(data_before);
CREATE INDEX IF NOT EXISTS idx_audit_data_after_gin ON vottery_election_audit_2 USING GIN(data_after);
CREATE INDEX IF NOT EXISTS idx_audit_geolocation_gin ON vottery_election_audit_2 USING GIN(geolocation);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_security_updated_at()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for security table
DROP TRIGGER IF EXISTS trigger_update_security_updated_at ON vottery_election_security_2;
CREATE TRIGGER trigger_update_security_updated_at
    BEFORE UPDATE ON vottery_election_security_2
    FOR EACH ROW
    EXECUTE FUNCTION update_security_updated_at();

-- Add comments for documentation
COMMENT ON TABLE vottery_election_security_2 IS 'Security configuration and settings for elections';
COMMENT ON COLUMN vottery_election_security_2.id IS 'Primary key, unique security config identifier';
COMMENT ON COLUMN vottery_election_security_2.election_id IS 'Foreign key to associated election';
COMMENT ON COLUMN vottery_election_security_2.encryption_enabled IS 'Whether vote encryption is enabled';
COMMENT ON COLUMN vottery_election_security_2.digital_signatures_enabled IS 'Whether digital signatures are used';
COMMENT ON COLUMN vottery_election_security_2.audit_trail_enabled IS 'Whether audit trail is maintained';
COMMENT ON COLUMN vottery_election_security_2.hash_algorithm IS 'Hashing algorithm used for integrity';
COMMENT ON COLUMN vottery_election_security_2.encryption_method IS 'Encryption method for vote data';
COMMENT ON COLUMN vottery_election_security_2.anonymity_level IS 'Level of voter anonymity protection';
COMMENT ON COLUMN vottery_election_security_2.blockchain_anchoring IS 'Whether results are anchored to blockchain';
COMMENT ON COLUMN vottery_election_security_2.security_score IS 'Overall security score (0-100)';

COMMENT ON TABLE vottery_election_audit_2 IS 'Comprehensive audit trail for all election-related activities';
COMMENT ON COLUMN vottery_election_audit_2.action IS 'Type of action performed';
COMMENT ON COLUMN vottery_election_audit_2.resource_type IS 'Type of resource affected';
COMMENT ON COLUMN vottery_election_audit_2.cryptographic_hash IS 'Hash of the action for integrity verification';
COMMENT ON COLUMN vottery_election_audit_2.digital_signature IS 'Digital signature for authenticity';
COMMENT ON COLUMN vottery_election_audit_2.risk_level IS 'Assessed risk level of the action';
COMMENT ON COLUMN vottery_election_audit_2.anomaly_detected IS 'Whether any anomaly was detected';
COMMENT ON COLUMN vottery_election_audit_2.device_fingerprint IS 'Unique fingerprint of the device used';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON vottery_election_security_2 TO vottery_app_user;
-- GRANT SELECT, INSERT ON vottery_election_audit_2 TO vottery_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vottery_app_user;







-- Create election lottery table for vottery election creation service
-- Database: vottery_election_2

CREATE TABLE IF NOT EXISTS vottery_election_lottery_2 (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL,
    lottery_enabled BOOLEAN DEFAULT FALSE,
    prize_type VARCHAR(30) CHECK (prize_type IN ('monetary', 'non_monetary', 'projected_revenue')),
    total_prize_pool DECIMAL(12,2) DEFAULT 0,
    monetary_prize_amount DECIMAL(12,2) DEFAULT 0,
    non_monetary_prize_description TEXT,
    projected_revenue_amount DECIMAL(12,2) DEFAULT 0,
    projected_revenue_percentage DECIMAL(5,2) DEFAULT 0,
    winner_count INTEGER DEFAULT 1 CHECK (winner_count >= 1 AND winner_count <= 100),
    prize_distribution JSONB DEFAULT '{}',
    lottery_machine_config JSONB DEFAULT '{}',
    draw_method VARCHAR(20) DEFAULT 'automatic' CHECK (draw_method IN ('automatic', 'manual')),
    draw_scheduled_at TIMESTAMP WITHOUT TIME ZONE,
    draw_executed_at TIMESTAMP WITHOUT TIME ZONE,
    draw_status VARCHAR(20) DEFAULT 'pending' CHECK (draw_status IN ('pending', 'scheduled', 'executed', 'cancelled')),
    rng_seed VARCHAR(64),
    cryptographic_proof TEXT,
    winners_selected JSONB DEFAULT '[]',
    prizes_distributed BOOLEAN DEFAULT FALSE,
    prize_claim_deadline TIMESTAMP WITHOUT TIME ZONE,
    sponsor_funding JSONB DEFAULT '{}',
    content_creator_revenue_share DECIMAL(5,2) DEFAULT 0,
    lottery_terms_conditions TEXT,
    meta_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_lottery_election 
        FOREIGN KEY (election_id) 
        REFERENCES vottery_elections_2(id) 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT check_prize_amounts 
        CHECK (
            (prize_type = 'monetary' AND monetary_prize_amount > 0) OR
            (prize_type = 'non_monetary' AND non_monetary_prize_description IS NOT NULL) OR
            (prize_type = 'projected_revenue' AND projected_revenue_amount > 0)
        ),
    
    CONSTRAINT check_winner_count_valid 
        CHECK (winner_count > 0 AND winner_count <= 100),
    
    CONSTRAINT check_revenue_percentage 
        CHECK (projected_revenue_percentage >= 0 AND projected_revenue_percentage <= 100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lottery_election_id ON vottery_election_lottery_2(election_id);
CREATE INDEX IF NOT EXISTS idx_lottery_enabled ON vottery_election_lottery_2(lottery_enabled);
CREATE INDEX IF NOT EXISTS idx_lottery_draw_status ON vottery_election_lottery_2(draw_status);
CREATE INDEX IF NOT EXISTS idx_lottery_draw_scheduled ON vottery_election_lottery_2(draw_scheduled_at);
CREATE INDEX IF NOT EXISTS idx_lottery_draw_executed ON vottery_election_lottery_2(draw_executed_at);
CREATE INDEX IF NOT EXISTS idx_lottery_prize_type ON vottery_election_lottery_2(prize_type);
CREATE INDEX IF NOT EXISTS idx_lottery_prizes_distributed ON vottery_election_lottery_2(prizes_distributed);

-- Create composite indexes
CREATE INDEX IF NOT EXISTS idx_lottery_election_status ON vottery_election_lottery_2(election_id, draw_status);
CREATE INDEX IF NOT EXISTS idx_lottery_enabled_scheduled ON vottery_election_lottery_2(lottery_enabled, draw_scheduled_at) WHERE lottery_enabled = TRUE;

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_lottery_prize_distribution_gin ON vottery_election_lottery_2 USING GIN(prize_distribution);
CREATE INDEX IF NOT EXISTS idx_lottery_machine_config_gin ON vottery_election_lottery_2 USING GIN(lottery_machine_config);
CREATE INDEX IF NOT EXISTS idx_lottery_winners_selected_gin ON vottery_election_lottery_2 USING GIN(winners_selected);
CREATE INDEX IF NOT EXISTS idx_lottery_sponsor_funding_gin ON vottery_election_lottery_2 USING GIN(sponsor_funding);
CREATE INDEX IF NOT EXISTS idx_lottery_meta_data_gin ON vottery_election_lottery_2 USING GIN(meta_data);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lottery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_lottery_updated_at ON vottery_election_lottery_2;
CREATE TRIGGER trigger_update_lottery_updated_at
    BEFORE UPDATE ON vottery_election_lottery_2
    FOR EACH ROW
    EXECUTE FUNCTION update_lottery_updated_at();

-- Create lottery winners table
CREATE TABLE IF NOT EXISTS vottery_lottery_winners_2 (
    id SERIAL PRIMARY KEY,
    lottery_id INTEGER NOT NULL,
    election_id INTEGER NOT NULL,
    winner_user_id INTEGER,
    winner_email VARCHAR(500),
    winner_name VARCHAR(200),
    winner_phone VARCHAR(50),
    winner_country VARCHAR(100),
    winner_rank INTEGER NOT NULL,
    prize_amount DECIMAL(12,2),
    prize_description TEXT,
    prize_type VARCHAR(30),
    winning_ticket_id VARCHAR(100),
    winning_vote_id VARCHAR(100),
    selected_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP WITHOUT TIME ZONE,
    claim_status VARCHAR(20) DEFAULT 'pending' CHECK (claim_status IN ('pending', 'claimed', 'expired', 'forfeited')),
    claimed_at TIMESTAMP WITHOUT TIME ZONE,
    prize_distributed_at TIMESTAMP WITHOUT TIME ZONE,
    distribution_method VARCHAR(50),
    distribution_reference VARCHAR(200),
    verification_required BOOLEAN DEFAULT FALSE,
    verification_completed BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '{}',
    tax_information JSONB DEFAULT '{}',
    meta_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_winners_lottery 
        FOREIGN KEY (lottery_id) 
        REFERENCES vottery_election_lottery_2(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_winners_election 
        FOREIGN KEY (election_id) 
        REFERENCES vottery_elections_2(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_winners_user 
        FOREIGN KEY (winner_user_id) 
        REFERENCES vottery_user_management(id) 
        ON DELETE SET NULL,
    
    -- Unique constraint to prevent duplicate winners for same rank in same lottery
    CONSTRAINT unique_lottery_winner_rank UNIQUE (lottery_id, winner_rank)
);

-- Create indexes for winners table
CREATE INDEX IF NOT EXISTS idx_winners_lottery_id ON vottery_lottery_winners_2(lottery_id);
CREATE INDEX IF NOT EXISTS idx_winners_election_id ON vottery_lottery_winners_2(election_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON vottery_lottery_winners_2(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_winners_email ON vottery_lottery_winners_2(winner_email);
CREATE INDEX IF NOT EXISTS idx_winners_claim_status ON vottery_lottery_winners_2(claim_status);
CREATE INDEX IF NOT EXISTS idx_winners_selected_at ON vottery_lottery_winners_2(selected_at);
CREATE INDEX IF NOT EXISTS idx_winners_rank ON vottery_lottery_winners_2(winner_rank);

-- Create composite indexes for winners
CREATE INDEX IF NOT EXISTS idx_winners_lottery_rank ON vottery_lottery_winners_2(lottery_id, winner_rank);
CREATE INDEX IF NOT EXISTS idx_winners_election_status ON vottery_lottery_winners_2(election_id, claim_status);

-- Create GIN indexes for JSONB columns in winners table
CREATE INDEX IF NOT EXISTS idx_winners_verification_docs_gin ON vottery_lottery_winners_2 USING GIN(verification_documents);
CREATE INDEX IF NOT EXISTS idx_winners_tax_info_gin ON vottery_lottery_winners_2 USING GIN(tax_information);
CREATE INDEX IF NOT EXISTS idx_winners_meta_data_gin ON vottery_lottery_winners_2 USING GIN(meta_data);

-- Create trigger for winners table
DROP TRIGGER IF EXISTS trigger_update_winners_updated_at ON vottery_lottery_winners_2;
CREATE TRIGGER trigger_update_winners_updated_at
    BEFORE UPDATE ON vottery_lottery_winners_2
    FOR EACH ROW
    EXECUTE FUNCTION update_lottery_updated_at();

-- Create lottery audit trail table
CREATE TABLE IF NOT EXISTS vottery_lottery_audit_2 (
    id SERIAL PRIMARY KEY,
    lottery_id INTEGER NOT NULL,
    election_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_user_id INTEGER,
    actor_email VARCHAR(500),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    cryptographic_hash VARCHAR(64),
    digital_signature TEXT,
    blockchain_record TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_lottery_audit_lottery 
        FOREIGN KEY (lottery_id) 
        REFERENCES vottery_election_lottery_2(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_lottery_audit_election 
        FOREIGN KEY (election_id) 
        REFERENCES vottery_elections_2(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_lottery_audit_user 
        FOREIGN KEY (actor_user_id) 
        REFERENCES vottery_user_management(id) 
        ON DELETE SET NULL
);

-- Create indexes for audit table
CREATE INDEX IF NOT EXISTS idx_lottery_audit_lottery_id ON vottery_lottery_audit_2(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_audit_election_id ON vottery_lottery_audit_2(election_id);
CREATE INDEX IF NOT EXISTS idx_lottery_audit_action ON vottery_lottery_audit_2(action);
CREATE INDEX IF NOT EXISTS idx_lottery_audit_actor ON vottery_lottery_audit_2(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_audit_created_at ON vottery_lottery_audit_2(created_at);

-- Create GIN index for audit details
CREATE INDEX IF NOT EXISTS idx_lottery_audit_details_gin ON vottery_lottery_audit_2 USING GIN(details);

-- Add comments for documentation
COMMENT ON TABLE vottery_election_lottery_2 IS 'Lottery configuration and management for elections';
COMMENT ON COLUMN vottery_election_lottery_2.id IS 'Primary key, unique lottery identifier';
COMMENT ON COLUMN vottery_election_lottery_2.election_id IS 'Foreign key to associated election';
COMMENT ON COLUMN vottery_election_lottery_2.lottery_enabled IS 'Whether lottery is enabled for this election';
COMMENT ON COLUMN vottery_election_lottery_2.prize_type IS 'Type of prize: monetary, non_monetary, or projected_revenue';
COMMENT ON COLUMN vottery_election_lottery_2.total_prize_pool IS 'Total value of all prizes';
COMMENT ON COLUMN vottery_election_lottery_2.winner_count IS 'Number of winners to select (1-100)';
COMMENT ON COLUMN vottery_election_lottery_2.prize_distribution IS 'JSON configuration of how prizes are distributed';
COMMENT ON COLUMN vottery_election_lottery_2.lottery_machine_config IS 'JSON configuration for 3D lottery machine display';
COMMENT ON COLUMN vottery_election_lottery_2.draw_method IS 'How the draw is triggered: automatic or manual';
COMMENT ON COLUMN vottery_election_lottery_2.rng_seed IS 'Cryptographic seed for random number generation';
COMMENT ON COLUMN vottery_election_lottery_2.cryptographic_proof IS 'Proof of fair lottery draw';
COMMENT ON COLUMN vottery_election_lottery_2.winners_selected IS 'JSON array of selected winners';
COMMENT ON COLUMN vottery_election_lottery_2.content_creator_revenue_share IS 'Percentage of content creator revenue used as prize';

COMMENT ON TABLE vottery_lottery_winners_2 IS 'Individual lottery winners for each lottery';
COMMENT ON COLUMN vottery_lottery_winners_2.winner_rank IS 'Winner position (1st, 2nd, 3rd, etc.)';
COMMENT ON COLUMN vottery_lottery_winners_2.winning_ticket_id IS 'Unique ticket/vote ID that won';
COMMENT ON COLUMN vottery_lottery_winners_2.claim_status IS 'Status of prize claim process';
COMMENT ON COLUMN vottery_lottery_winners_2.verification_required IS 'Whether winner identity verification is required';

COMMENT ON TABLE vottery_lottery_audit_2 IS 'Audit trail for all lottery-related actions';
COMMENT ON COLUMN vottery_lottery_audit_2.cryptographic_hash IS 'Hash of the action for integrity verification';
COMMENT ON COLUMN vottery_lottery_audit_2.digital_signature IS 'Digital signature for action authenticity';
COMMENT ON COLUMN vottery_lottery_audit_2.blockchain_record IS 'Reference to blockchain record if applicable';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON vottery_election_lottery_2 TO vottery_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON vottery_lottery_winners_2 TO vottery_app_user;
-- GRANT SELECT, INSERT ON vottery_lottery_audit_2 TO vottery_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vottery_app_user;