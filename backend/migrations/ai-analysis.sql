-- AI Analysis Records Table
-- Stores AI-generated analysis for MBTI test reports

CREATE TABLE IF NOT EXISTS ai_analysis_records (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- Foreign Keys
  report_id BIGINT NOT NULL,
  user_id BIGINT,

  -- Task Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'processing', 'completed', 'failed'

  -- Analysis Type
  analysis_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive',
  -- Values: 'comprehensive', 'career', 'relationship', 'growth'

  -- Input Data Snapshot (JSONB)
  input_data JSONB NOT NULL,
  -- Structure:
  -- {
  --   mbtiType: "INTJ",
  --   dimensionScores: { EI: 30, SN: 20, TF: 28, JP: 25 },
  --   percentages: { EI: 100, SN: 67, TF: 93, JP: 83 },
  --   answerSummary: "...",
  --   answerCount: 60,
  --   completedAt: "2026-04-20T12:00:00Z"
  -- }

  -- AI Generated Content (JSONB)
  analysis_content JSONB,
  -- Structure: See AnalysisContent type in ai-config.types.ts

  -- Error Information (for failed tasks)
  error_message TEXT,
  error_details JSONB,

  -- Metadata
  model_name VARCHAR(50),
  model_version VARCHAR(50),
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- Constraints
  CONSTRAINT fk_report
    FOREIGN KEY (report_id)
    REFERENCES test_reports(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT valid_status
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  CONSTRAINT valid_analysis_type
    CHECK (analysis_type IN ('comprehensive', 'career', 'relationship', 'growth')),

  CONSTRAINT non_negative_tokens
    CHECK (tokens_used >= 0),

  CONSTRAINT non_negative_processing_time
    CHECK (processing_time_ms >= 0)
);

-- Indexes for performance
CREATE INDEX idx_ai_analysis_report_id ON ai_analysis_records(report_id);
CREATE INDEX idx_ai_analysis_user_id ON ai_analysis_records(user_id);
CREATE INDEX idx_ai_analysis_status ON ai_analysis_records(status);
CREATE INDEX idx_ai_analysis_type ON ai_analysis_records(analysis_type);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis_records(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_ai_analysis_report_status ON ai_analysis_records(report_id, status);
CREATE INDEX idx_ai_analysis_user_status ON ai_analysis_records(user_id, status);
CREATE INDEX idx_ai_analysis_status_created ON ai_analysis_records(status, created_at DESC);

-- Index for JSONB queries
CREATE INDEX idx_ai_analysis_input_mbti ON ai_analysis_records USING GIN (input_data);
CREATE INDEX idx_ai_analysis_content_gin ON ai_analysis_records USING GIN (analysis_content);

-- Comments for documentation
COMMENT ON TABLE ai_analysis_records IS 'AI-generated personality analysis records';
COMMENT ON COLUMN ai_analysis_records.status IS 'Task status: pending/processing/completed/failed';
COMMENT ON COLUMN ai_analysis_records.analysis_type IS 'Analysis type: comprehensive/career/relationship/growth';
COMMENT ON COLUMN ai_analysis_records.input_data IS 'Snapshot of user test data (JSONB)';
COMMENT ON COLUMN ai_analysis_records.analysis_content IS 'AI-generated analysis content (JSONB)';
COMMENT ON COLUMN ai_analysis_records.tokens_used IS 'Total tokens consumed for AI generation';
COMMENT ON COLUMN ai_analysis_records.processing_time_ms IS 'Processing time in milliseconds';
COMMENT ON COLUMN ai_analysis_records.created_at IS 'Task creation timestamp';
COMMENT ON COLUMN ai_analysis_records.completed_at IS 'Task completion timestamp (null if not completed)';
