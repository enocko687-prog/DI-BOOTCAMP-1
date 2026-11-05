USE EnockPortfolioDB;
GO

INSERT INTO dbo.Skills (SkillName, Category, SkillLevel)
SELECT source.SkillName, source.Category, source.SkillLevel
FROM (VALUES
    (N'HTML5', N'Web Development', NULL),
    (N'CSS3', N'Web Development', NULL),
    (N'JavaScript', N'Programming', NULL),
    (N'Node.js', N'Backend Development', NULL),
    (N'Express.js', N'Backend Development', NULL),
    (N'SQL Server', N'Database Management', NULL),
    (N'Python', N'Programming', NULL),
    (N'npm', N'Development Tools', NULL),
    (N'Git & GitHub', N'Development Tools', NULL)
) AS source(SkillName, Category, SkillLevel)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Skills AS existing
    WHERE existing.SkillName = source.SkillName
);
GO
-- Project and experience rows are omitted until verified details are available.
