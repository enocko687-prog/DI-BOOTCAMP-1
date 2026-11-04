USE EnockPortfolioDB;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Projects WHERE ProjectName = N'WOFEM Church Website')
BEGIN
    INSERT INTO dbo.Projects (ProjectName, Description, Technologies)
    VALUES (
        N'WOFEM Church Website',
        N'A website project for World of Faith Evangelistic Ministries International.',
        N'HTML, CSS, JavaScript'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Projects WHERE ProjectName = N'Mariposa Foundation')
BEGIN
    INSERT INTO dbo.Projects (ProjectName, Description, Technologies)
    VALUES (
        N'Mariposa Foundation',
        N'A website project supporting vulnerable children and young people.',
        N'HTML, CSS, JavaScript'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Projects WHERE ProjectName = N'Youth Mentorship Platform')
BEGIN
    INSERT INTO dbo.Projects (ProjectName, Description, Technologies)
    VALUES (
        N'Youth Mentorship Platform',
        N'A digital platform for youth mentorship and programme coordination.',
        N'Node.js, JavaScript, SQL'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Projects WHERE ProjectName = N'Assignment Tracker')
BEGIN
    INSERT INTO dbo.Projects (ProjectName, Description, Technologies)
    VALUES (
        N'Assignment Tracker',
        N'A dashboard for managing assignments and academic progress.',
        N'HTML, CSS, JavaScript'
    );
END;
GO

INSERT INTO dbo.Skills (SkillName, Category, SkillLevel)
SELECT source.SkillName, source.Category, source.SkillLevel
FROM (VALUES
    (N'HTML', N'Web Development', N'Learning'),
    (N'CSS', N'Web Development', N'Learning'),
    (N'JavaScript', N'Programming', N'Learning'),
    (N'Node.js', N'Backend Development', N'Learning'),
    (N'SQL Server', N'Database Management', N'Learning'),
    (N'Youth Mentorship', N'Leadership', N'Experienced'),
    (N'Community Outreach', N'Community Service', N'Experienced'),
    (N'Canva', N'Digital Design', N'Learning'),
    (N'Communication', N'Personal Development', N'Experienced')
) AS source(SkillName, Category, SkillLevel)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Skills AS existing
    WHERE existing.SkillName = source.SkillName
);
GO

IF NOT EXISTS (
    SELECT 1 FROM dbo.Experience
    WHERE Position = N'Youth Mentor and Community Volunteer'
      AND Organization = N'Githogoro Youth Movement'
)
BEGIN
    INSERT INTO dbo.Experience (Position, Organization, Description, IsCurrent)
    VALUES (
        N'Youth Mentor and Community Volunteer',
        N'Githogoro Youth Movement',
        N'Supporting youth empowerment, mentorship and leadership development.',
        1
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM dbo.Experience
    WHERE Position = N'Academic Mentor'
      AND Organization = N'Community-Based Academic Support'
)
BEGIN
    INSERT INTO dbo.Experience (Position, Organization, Description, IsCurrent)
    VALUES (
        N'Academic Mentor',
        N'Community-Based Academic Support',
        N'Supporting learners in English, Kiswahili, CRE and Social Studies.',
        1
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM dbo.Experience
    WHERE Position = N'Ministry and Worship Service'
      AND Organization = N'World of Faith Evangelistic Ministries International'
)
BEGIN
    INSERT INTO dbo.Experience (Position, Organization, Description, IsCurrent)
    VALUES (
        N'Ministry and Worship Service',
        N'World of Faith Evangelistic Ministries International',
        N'Participating in youth ministry, worship and community outreach.',
        1
    );
END;
GO
